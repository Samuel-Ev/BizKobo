"""
Trust Score engine.

This is deliberately a transparent, rule-based scorer rather than a black
box — it's easy to explain to Zenith, easy to defend to regulators, and
easy to swap piece-by-piece for a trained model later without changing
the API contract. Every factor below is visible in `breakdown`.

Score range: 300-850 (mirrors a familiar credit-score scale so it's
intuitive to students and partner banks alike).
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from . import models

BASE_SCORE = 300
MAX_SCORE = 850


def compute_trust_score(db: Session, user: models.User) -> dict:
    txns = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user.id)
        .order_by(models.Transaction.created_at.desc())
        .all()
    )
    loans = (
        db.query(models.UrgentLoan)
        .filter(models.UrgentLoan.user_id == user.id)
        .all()
    )

    # 1. Savings consistency: net positive balance trend over last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_credits = sum(t.amount for t in txns if t.amount > 0 and t.created_at >= thirty_days_ago)
    recent_debits = sum(-t.amount for t in txns if t.amount < 0 and t.created_at >= thirty_days_ago)
    savings_ratio = recent_credits / recent_debits if recent_debits > 0 else (2.0 if recent_credits > 0 else 1.0)
    savings_points = min(150, int(savings_ratio * 60))

    # 2. Repayment history: repaid loans on time vs overdue
    repaid = [l for l in loans if l.status == models.LoanStatus.repaid]
    overdue = [l for l in loans if l.status == models.LoanStatus.overdue]
    repayment_points = min(200, repaid.__len__() * 45 - overdue.__len__() * 80)
    repayment_points = max(0, repayment_points)

    # 3. Account activity / tenure: more history = more signal = more trust
    activity_points = min(100, len(txns) * 4)

    # 4. Side-hustle / external income signal: credits not tagged as "fund" from a bank
    income_txns = [t for t in txns if t.amount > 0 and t.type == models.TransactionType.receive]
    income_points = min(80, len(income_txns) * 10)

    # 5. Spending discipline: penalize very frequent small emergency-like debits
    debit_count_recent = len([t for t in txns if t.amount < 0 and t.created_at >= thirty_days_ago])
    discipline_points = max(0, 100 - max(0, debit_count_recent - 15) * 5)

    total = BASE_SCORE + savings_points + repayment_points + activity_points + income_points + discipline_points
    total = max(BASE_SCORE, min(MAX_SCORE, total))

    if total >= 780:
        tier = "Gold"
        urgent_limit = 5000.0
    elif total >= 650:
        tier = "Silver"
        urgent_limit = 2000.0
    elif total >= 500:
        tier = "Bronze"
        urgent_limit = 1000.0
    else:
        tier = "Starter"
        urgent_limit = 500.0

    return {
        "score": total,
        "max_score": MAX_SCORE,
        "tier": tier,
        "urgent_limit": urgent_limit,
        "breakdown": {
            "savings_consistency": savings_points,
            "repayment_history": repayment_points,
            "account_activity": activity_points,
            "income_signal": income_points,
            "spending_discipline": discipline_points,
        },
    }


def evaluate_urgent_2k(db: Session, user: models.User, requested_amount: float) -> dict:
    score_data = compute_trust_score(db, user)
    score = score_data["score"]
    limit = score_data["urgent_limit"]

    open_loans = (
        db.query(models.UrgentLoan)
        .filter(
            models.UrgentLoan.user_id == user.id,
            models.UrgentLoan.status.in_([models.LoanStatus.pending, models.LoanStatus.approved]),
        )
        .count()
    )

    if open_loans > 0:
        return {
            "eligible": False,
            "amount": 0.0,
            "trust_score": score,
            "reason": "You already have an active Urgent 2K loan. Repay it first to unlock a new one.",
        }

    if score < 500:
        return {
            "eligible": False,
            "amount": 0.0,
            "trust_score": score,
            "reason": "Your Trust Score needs to reach 500 for Urgent 2K. Keep saving consistently to build it up.",
        }

    approved_amount = min(requested_amount, limit)
    return {
        "eligible": True,
        "amount": approved_amount,
        "trust_score": score,
        "reason": f"Approved based on savings consistency and account history. {score_data['tier']} tier limit: ₦{limit:,.0f}.",
    }
