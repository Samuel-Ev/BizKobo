from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/fees", tags=["fees"])


@router.get("", response_model=List[schemas.FeeOut])
def list_fees(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Fee)
        .filter(models.Fee.university_id == current_user.university_id)
        .all()
    )


@router.post("/pay", response_model=schemas.WalletOut)
def pay_fee(
    payload: schemas.PayFeeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    fee = db.query(models.Fee).filter(models.Fee.id == payload.fee_id).first()
    if not fee or fee.university_id != current_user.university_id:
        raise HTTPException(status_code=404, detail="Fee not found")

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if wallet.balance < fee.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance to pay this fee")

    wallet.balance -= fee.amount
    db.add(models.Transaction(
        university_id=current_user.university_id,
        user_id=current_user.id,
        type=models.TransactionType.fee_payment,
        amount=-fee.amount,
        counterparty=fee.name,
        note=f"{fee.category} fee payment",
    ))
    db.commit()
    db.refresh(wallet)
    return wallet
