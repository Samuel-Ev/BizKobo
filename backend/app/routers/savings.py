from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/savings", tags=["savings"])


def _current_cycle(db: Session, group_id: str, member_count: int) -> int:
    """A cycle is complete once every member has contributed in it.
    Walk forward from cycle 1 until we find one that isn't complete yet."""
    cycle = 1
    while True:
        count = (
            db.query(models.Contribution)
            .filter(models.Contribution.group_id == group_id, models.Contribution.cycle_number == cycle)
            .count()
        )
        if count < member_count:
            return cycle
        cycle += 1


def _to_group_out(db: Session, group: models.SavingsGroup) -> dict:
    member_count = len(group.members)
    current_cycle = _current_cycle(db, group.id, member_count) if member_count else 1
    return {
        "id": group.id,
        "name": group.name,
        "contribution_amount": group.contribution_amount,
        "frequency_days": group.frequency_days,
        "member_count": member_count,
        "current_cycle": current_cycle,
    }


@router.get("/discover", response_model=List[schemas.SavingsGroupOut])
def discover_groups(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Groups in the student's university that they haven't joined yet."""
    my_group_ids = {
        m.group_id for m in db.query(models.GroupMembership).filter(
            models.GroupMembership.user_id == current_user.id
        ).all()
    }
    groups = (
        db.query(models.SavingsGroup)
        .filter(models.SavingsGroup.university_id == current_user.university_id)
        .all()
    )
    joinable = [g for g in groups if g.id not in my_group_ids]
    return [_to_group_out(db, g) for g in joinable]


@router.get("", response_model=List[schemas.SavingsGroupOut])
def list_my_groups(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    memberships = db.query(models.GroupMembership).filter(
        models.GroupMembership.user_id == current_user.id
    ).all()
    groups = [m.group for m in memberships]
    return [_to_group_out(db, g) for g in groups]


@router.post("", response_model=schemas.SavingsGroupOut)
def create_group(
    payload: schemas.SavingsGroupCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = models.SavingsGroup(
        university_id=current_user.university_id,
        creator_id=current_user.id,
        name=payload.name,
        contribution_amount=payload.contribution_amount,
        frequency_days=payload.frequency_days,
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    db.add(models.GroupMembership(group_id=group.id, user_id=current_user.id, payout_position=0))
    db.commit()
    db.refresh(group)
    return _to_group_out(db, group)


@router.post("/{group_id}/join", response_model=schemas.SavingsGroupOut)
def join_group(
    group_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(models.SavingsGroup).filter(models.SavingsGroup.id == group_id).first()
    if not group or group.university_id != current_user.university_id:
        raise HTTPException(status_code=404, detail="Group not found")

    existing = db.query(models.GroupMembership).filter(
        models.GroupMembership.group_id == group_id, models.GroupMembership.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member of this group")

    next_position = len(group.members)
    db.add(models.GroupMembership(group_id=group_id, user_id=current_user.id, payout_position=next_position))
    db.commit()
    db.refresh(group)
    return _to_group_out(db, group)


@router.post("/{group_id}/contribute", response_model=schemas.WalletOut)
def contribute(
    group_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(models.SavingsGroup).filter(models.SavingsGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    membership = db.query(models.GroupMembership).filter(
        models.GroupMembership.group_id == group_id, models.GroupMembership.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You're not a member of this group")

    member_count = len(group.members)
    cycle = _current_cycle(db, group_id, member_count)

    already = db.query(models.Contribution).filter(
        models.Contribution.group_id == group_id,
        models.Contribution.user_id == current_user.id,
        models.Contribution.cycle_number == cycle,
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="You've already contributed this cycle")

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if wallet.balance < group.contribution_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for this contribution")

    wallet.balance -= group.contribution_amount
    db.add(models.Contribution(
        group_id=group_id, user_id=current_user.id,
        amount=group.contribution_amount, cycle_number=cycle,
    ))
    db.add(models.Transaction(
        university_id=current_user.university_id, user_id=current_user.id,
        type=models.TransactionType.send, amount=-group.contribution_amount,
        counterparty=f"{group.name} (Ajo)", note=f"Cycle {cycle} contribution",
    ))
    db.commit()

    # Check if the cycle just completed — if so, pay out the recipient
    count_now = db.query(models.Contribution).filter(
        models.Contribution.group_id == group_id, models.Contribution.cycle_number == cycle
    ).count()
    if count_now == member_count:
        recipient_position = (cycle - 1) % member_count
        recipient_membership = next(m for m in group.members if m.payout_position == recipient_position)
        recipient_wallet = db.query(models.Wallet).filter(
            models.Wallet.user_id == recipient_membership.user_id
        ).first()
        payout = group.contribution_amount * member_count
        recipient_wallet.balance += payout
        db.add(models.Transaction(
            university_id=current_user.university_id, user_id=recipient_membership.user_id,
            type=models.TransactionType.receive, amount=payout,
            counterparty=f"{group.name} (Ajo)", note=f"Cycle {cycle} payout",
        ))
        db.commit()

    db.refresh(wallet)
    return wallet
