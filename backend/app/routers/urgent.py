from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth, scoring
from ..database import get_db

router = APIRouter(prefix="/urgent2k", tags=["urgent2k"])


@router.post("/check", response_model=schemas.UrgentCheckResult)
def check_eligibility(
    requested_amount: float = 2000.0,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    result = scoring.evaluate_urgent_2k(db, current_user, requested_amount)

    if not result["eligible"]:
        return {
            "eligible": False,
            "amount": 0.0,
            "trust_score": result["trust_score"],
            "status": "declined",
            "due_date": None,
            "reason": result["reason"],
        }

    # Simulated partner-bank approval. In production this call goes to
    # Zenith's lending API and this endpoint awaits their response instead
    # of deciding locally.
    due_date = datetime.utcnow() + timedelta(days=7)
    loan = models.UrgentLoan(
        university_id=current_user.university_id,
        user_id=current_user.id,
        amount=result["amount"],
        trust_score_at_request=result["trust_score"],
        status=models.LoanStatus.approved,
        due_date=due_date,
    )
    db.add(loan)

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    wallet.balance += result["amount"]

    db.add(models.Transaction(
        university_id=current_user.university_id,
        user_id=current_user.id,
        type=models.TransactionType.loan_disbursement,
        amount=result["amount"],
        counterparty="Zenith Bank",
        note="Urgent 2K disbursement",
    ))
    db.commit()

    return {
        "eligible": True,
        "amount": result["amount"],
        "trust_score": result["trust_score"],
        "status": "approved",
        "due_date": due_date,
        "reason": result["reason"],
    }


@router.post("/repay")
def repay_loan(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    loan = (
        db.query(models.UrgentLoan)
        .filter(
            models.UrgentLoan.user_id == current_user.id,
            models.UrgentLoan.status == models.LoanStatus.approved,
        )
        .order_by(models.UrgentLoan.created_at.desc())
        .first()
    )
    if not loan:
        raise HTTPException(status_code=404, detail="No active loan to repay")

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if wallet.balance < loan.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance to repay")

    wallet.balance -= loan.amount
    loan.status = models.LoanStatus.repaid
    loan.repaid_at = datetime.utcnow()

    db.add(models.Transaction(
        university_id=current_user.university_id,
        user_id=current_user.id,
        type=models.TransactionType.loan_repayment,
        amount=-loan.amount,
        counterparty="Zenith Bank",
        note="Urgent 2K repayment",
    ))
    db.commit()
    return {"status": "repaid"}
