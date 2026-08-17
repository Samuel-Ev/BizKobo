from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/parent", tags=["parent"])


@router.post("/link", response_model=schemas.ParentLinkOut)
def create_or_update_link(
    payload: schemas.ParentLinkCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Students generate this link once and share it with a parent/guardian.
    No parent account/login required — the token itself is the access key,
    so treat it like a password reset link and only share it privately."""
    link = db.query(models.ParentLink).filter(models.ParentLink.student_id == current_user.id).first()
    if link:
        link.parent_name = payload.parent_name
        link.parent_email = payload.parent_email
        link.monthly_budget_limit = payload.monthly_budget_limit
    else:
        link = models.ParentLink(
            student_id=current_user.id,
            parent_name=payload.parent_name,
            parent_email=payload.parent_email,
            monthly_budget_limit=payload.monthly_budget_limit,
        )
        db.add(link)
    db.commit()
    db.refresh(link)
    return link


@router.get("/my-link", response_model=schemas.ParentLinkOut)
def get_my_link(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    link = db.query(models.ParentLink).filter(models.ParentLink.student_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="No parent link set up yet")
    return link


@router.post("/regenerate-link", response_model=schemas.ParentLinkOut)
def regenerate_link(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Issues a fresh share token, immediately invalidating the old one —
    use this if a link was shared with the wrong person or leaked."""
    link = db.query(models.ParentLink).filter(models.ParentLink.student_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="No parent link set up yet")
    link.share_token = models.gen_id()
    db.commit()
    db.refresh(link)
    return link


@router.get("/view/{share_token}", response_model=schemas.ParentView)
def parent_view(share_token: str, db: Session = Depends(get_db)):
    """Public — no login required. The share_token itself is the access
    control, same model as an unlisted-but-unguessable link."""
    link = db.query(models.ParentLink).filter(models.ParentLink.share_token == share_token).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid or expired link")

    student = db.query(models.User).filter(models.User.id == link.student_id).first()
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == student.id).first()

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == student.id)
        .order_by(models.Transaction.created_at.desc())
        .limit(15)
        .all()
    )
    monthly_spend = sum(
        -t.amount for t in recent if t.amount < 0 and t.created_at >= thirty_days_ago
    )
    over_budget = bool(link.monthly_budget_limit and monthly_spend > link.monthly_budget_limit)

    return {
        "student_name": student.full_name,
        "university_name": student.university.name,
        "wallet_balance": wallet.balance,
        "monthly_budget_limit": link.monthly_budget_limit,
        "monthly_spend_so_far": monthly_spend,
        "over_budget": over_budget,
        "recent_transactions": recent,
    }
