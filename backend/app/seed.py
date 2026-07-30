"""
Run with: python -m app.seed
Creates the NBU tenant and a demo student account with realistic
transaction history, so the Trust Score and Urgent 2K flow have real
data to compute against instead of showing zeros.

Demo login: demo@nbu.edu.ng / password123
"""
from datetime import datetime, timedelta

from .database import SessionLocal, engine, Base
from . import models, auth

Base.metadata.create_all(bind=engine)
db = SessionLocal()

nbu = db.query(models.University).filter(models.University.slug == "nbu").first()
if not nbu:
    nbu = models.University(name="Nigerian British University", slug="nbu",
                             brand_color="#EFB63F", logo_initial="N")
    db.add(nbu)
    db.commit()
    db.refresh(nbu)
    print(f"Created university: {nbu.name}")

if db.query(models.Fee).filter(models.Fee.university_id == nbu.id).count() == 0:
    db.add_all([
        models.Fee(university_id=nbu.id, name="Hostel Accommodation", amount=45000, category="hostel"),
        models.Fee(university_id=nbu.id, name="Student Union Dues", amount=2500, category="dues"),
        models.Fee(university_id=nbu.id, name="Departmental Lab Fee", amount=8000, category="dept"),
        models.Fee(university_id=nbu.id, name="Late Registration Fine", amount=5000, category="fine"),
    ])
    db.commit()
    print("Seeded fee catalog")

demo_user = db.query(models.User).filter(models.User.email == "demo@nbu.edu.ng").first()
if not demo_user:
    demo_user = models.User(
        university_id=nbu.id,
        full_name="Samuel Ev.",
        email="demo@nbu.edu.ng",
        hashed_password=auth.hash_password("password123"),
        student_id="NBU/2023/0417",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    wallet = models.Wallet(user_id=demo_user.id, balance=0.0)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    now = datetime.utcnow()
    txns = [
        (now - timedelta(days=25), models.TransactionType.fund, 15000, "GTBank", "Wallet funding"),
        (now - timedelta(days=22), models.TransactionType.vendor_payment, -1200, "Buttery Cafeteria", None),
        (now - timedelta(days=20), models.TransactionType.send, -3000, "Tolu B.", "Owed for textbook"),
        (now - timedelta(days=18), models.TransactionType.receive, 5000, "Aunty Ngozi", "Upkeep"),
        (now - timedelta(days=15), models.TransactionType.vendor_payment, -800, "Campus Print Hub", None),
        (now - timedelta(days=12), models.TransactionType.fund, 10000, "GTBank", "Wallet funding"),
        (now - timedelta(days=9), models.TransactionType.vendor_payment, -1500, "Buttery Cafeteria", None),
        (now - timedelta(days=6), models.TransactionType.receive, 8000, "Freelance gig", "Logo design payment"),
        (now - timedelta(days=3), models.TransactionType.vendor_payment, -2000, "NBU Bookshop", None),
        (now - timedelta(days=1), models.TransactionType.vendor_payment, -1200, "Buttery Cafeteria", None),
    ]

    balance = 0.0
    for created_at, ttype, amount, counterparty, note in txns:
        balance += amount
        db.add(models.Transaction(
            university_id=nbu.id, user_id=demo_user.id, type=ttype,
            amount=amount, counterparty=counterparty, note=note,
            created_at=created_at,
        ))

    # One prior loan, repaid on time, to seed real repayment history
    loan = models.UrgentLoan(
        university_id=nbu.id, user_id=demo_user.id, amount=2000.0,
        trust_score_at_request=690, status=models.LoanStatus.repaid,
        due_date=now - timedelta(days=10), created_at=now - timedelta(days=17),
        repaid_at=now - timedelta(days=11),
    )
    db.add(loan)
    balance -= 2000.0  # the repayment debit

    wallet.balance = balance
    db.commit()
    print(f"Created demo user: {demo_user.email} / password123 — wallet balance ₦{balance:,.0f}")
else:
    print("Demo user already exists — skipping seed")

db.close()
