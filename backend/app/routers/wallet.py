from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("", response_model=schemas.WalletOut)
def get_wallet(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    return wallet


@router.post("/fund", response_model=schemas.WalletOut)
def fund_wallet(
    payload: schemas.FundWalletRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """
    In production this only fires after Zenith confirms the inbound NIP
    transfer into the pooled settlement account (via webhook). Here we
    credit the ledger directly to keep the demo self-contained.
    """
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    wallet.balance += payload.amount

    txn = models.Transaction(
        university_id=current_user.university_id,
        user_id=current_user.id,
        type=models.TransactionType.fund,
        amount=payload.amount,
        counterparty=payload.source,
        note="Wallet funding",
    )
    db.add(txn)
    db.commit()
    db.refresh(wallet)
    return wallet


@router.post("/send", response_model=schemas.WalletOut)
def send_money(
    payload: schemas.SendMoneyRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    sender_wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if sender_wallet.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    recipient = db.query(models.User).filter(models.User.email == payload.recipient_email).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if recipient.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send money to yourself")

    recipient_wallet = db.query(models.Wallet).filter(models.Wallet.user_id == recipient.id).first()

    # Pooled-ledger transfer: no money physically moves at the bank level,
    # only the internal ledger balances for these two users change.
    sender_wallet.balance -= payload.amount
    recipient_wallet.balance += payload.amount

    db.add(models.Transaction(
        university_id=current_user.university_id, user_id=current_user.id,
        type=models.TransactionType.send, amount=-payload.amount,
        counterparty=recipient.full_name, note=payload.note,
    ))
    db.add(models.Transaction(
        university_id=recipient.university_id, user_id=recipient.id,
        type=models.TransactionType.receive, amount=payload.amount,
        counterparty=current_user.full_name, note=payload.note,
    ))
    db.commit()
    db.refresh(sender_wallet)
    return sender_wallet
