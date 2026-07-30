"""
Core data models.

Multi-tenancy: every user, wallet, transaction, and loan carries a
university_id. This is what lets BizKobo white-label into a new school
later by adding one University row and a theme config, instead of a
schema change or a separate deployment.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, DateTime, ForeignKey, Enum, Boolean, Integer, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id():
    return str(uuid.uuid4())


class University(Base):
    __tablename__ = "universities"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)  # e.g. "nbu"
    brand_color = Column(String, default="#EFB63F")
    logo_initial = Column(String, default="U")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="university")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    student_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    university = relationship("University", back_populates="users")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")
    loans = relationship("UrgentLoan", back_populates="user")


class Wallet(Base):
    """
    The wallet balance is BizKobo's internal ledger figure — the number a
    student sees. It is NOT the same as the actual cash sitting at the
    partner bank (Zenith). Zenith holds one pooled settlement account;
    this table is the per-user ledger split of that pool.
    """
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")


class TransactionType(str, enum.Enum):
    fund = "fund"
    send = "send"
    receive = "receive"
    fee_payment = "fee_payment"
    vendor_payment = "vendor_payment"
    loan_disbursement = "loan_disbursement"
    loan_repayment = "loan_repayment"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)  # positive = credit, negative = debit
    counterparty = Column(String, nullable=True)  # e.g. "Buttery Cafeteria", "Tolu B."
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class LoanStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    declined = "declined"
    repaid = "repaid"
    overdue = "overdue"


class UrgentLoan(Base):
    """
    BizKobo never funds this loan itself. It computes a trust score from
    the user's transaction history and sends a recommendation; in
    production this hits Zenith Bank's API for the real approval and
    disbursement. For now `approved_by_partner` simulates that decision.
    """
    __tablename__ = "urgent_loans"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    trust_score_at_request = Column(Integer, nullable=False)
    status = Column(Enum(LoanStatus), default=LoanStatus.pending)
    approved_by_partner = Column(String, default="Zenith Bank")
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    repaid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="loans")


# ---------------------------------------------------------------------------
# Pay Fees
# ---------------------------------------------------------------------------

class Fee(Base):
    """A payable fee item defined per university (e.g. hostel fee, dept dues)."""
    __tablename__ = "fees"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="general")  # tuition, hostel, dues, other


# ---------------------------------------------------------------------------
# SME bookkeeping — for businesses operating within the school
# (food vendors, laundry, hairdressers, print hubs run by students/staff)
# ---------------------------------------------------------------------------

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="general")  # food, laundry, print, fashion, other
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("BizEntry", back_populates="business")


class BizEntryType(str, enum.Enum):
    sale = "sale"
    expense = "expense"


class BizEntry(Base):
    """A single sale or expense record for a campus business."""
    __tablename__ = "biz_entries"

    id = Column(String, primary_key=True, default=gen_id)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    type = Column(Enum(BizEntryType), nullable=False)
    amount = Column(Float, nullable=False)
    item = Column(String, nullable=True)  # e.g. "Rice", "Fabric supply"
    note = Column(String, nullable=True)
    source_text = Column(String, nullable=True)  # raw voice/text input, if logged that way
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="entries")


# ---------------------------------------------------------------------------
# Digital Ajo / Esusu — rotating group savings
# ---------------------------------------------------------------------------

class SavingsGroup(Base):
    __tablename__ = "savings_groups"

    id = Column(String, primary_key=True, default=gen_id)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    contribution_amount = Column(Float, nullable=False)
    frequency_days = Column(Integer, default=7)  # e.g. 7 = weekly, 30 = monthly
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("GroupMembership", back_populates="group")


class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(String, primary_key=True, default=gen_id)
    group_id = Column(String, ForeignKey("savings_groups.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    payout_position = Column(Integer, nullable=False)  # rotation order, 0-indexed
    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("SavingsGroup", back_populates="members")


class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(String, primary_key=True, default=gen_id)
    group_id = Column(String, ForeignKey("savings_groups.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    cycle_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Parents' financial control
# ---------------------------------------------------------------------------

class ParentLink(Base):
    """
    Grants a parent read-only visibility into a student's spending via a
    share token — no separate parent login system needed for v1.
    """
    __tablename__ = "parent_links"

    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    parent_name = Column(String, nullable=True)
    parent_email = Column(String, nullable=True)
    share_token = Column(String, unique=True, default=gen_id)
    monthly_budget_limit = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
