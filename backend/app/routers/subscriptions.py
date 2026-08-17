from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/status", response_model=schemas.SubscriptionStatus)
def get_status(
    product: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    sub = (
        db.query(models.Subscription)
        .filter(models.Subscription.user_id == current_user.id, models.Subscription.product == product)
        .order_by(models.Subscription.created_at.desc())
        .first()
    )
    if not sub:
        return {"active": False, "product": product, "expires_at": None}

    is_active = sub.active and (sub.expires_at is None or sub.expires_at > datetime.utcnow())
    return {"active": is_active, "product": product, "expires_at": sub.expires_at}


@router.post("/subscribe", response_model=schemas.SubscriptionStatus)
def subscribe(
    payload: schemas.SubscribeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if wallet.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for this subscription")

    wallet.balance -= payload.amount
    expires_at = datetime.utcnow() + timedelta(days=30)

    sub = models.Subscription(
        user_id=current_user.id,
        product=payload.product,
        active=True,
        amount_paid=payload.amount,
        expires_at=expires_at,
    )
    db.add(sub)
    db.add(models.Transaction(
        university_id=current_user.university_id,
        user_id=current_user.id,
        type=models.TransactionType.subscription_payment,
        amount=-payload.amount,
        counterparty="BizKobo Premium",
        note=f"{payload.product} subscription",
    ))
    db.commit()

    return {"active": True, "product": payload.product, "expires_at": expires_at}
