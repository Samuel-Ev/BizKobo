from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UniversityOut(BaseModel):
    id: str
    name: str
    slug: str
    brand_color: str
    logo_initial: str

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    university_slug: str
    student_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    student_id: Optional[str]
    university: UniversityOut

    class Config:
        from_attributes = True


class WalletOut(BaseModel):
    balance: float

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: str
    type: str
    amount: float
    counterparty: Optional[str]
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TrustScoreOut(BaseModel):
    score: int
    max_score: int = 850
    tier: str
    points_this_month: int
    urgent_limit: float
    breakdown: dict


class UrgentCheckResult(BaseModel):
    eligible: bool
    amount: float
    trust_score: int
    status: str
    due_date: Optional[datetime]
    reason: str


class SendMoneyRequest(BaseModel):
    recipient_email: EmailStr
    amount: float
    note: Optional[str] = None


class FundWalletRequest(BaseModel):
    amount: float
    source: str = "Bank transfer"


class FeeOut(BaseModel):
    id: str
    name: str
    amount: float
    category: str

    class Config:
        from_attributes = True


class PayFeeRequest(BaseModel):
    fee_id: str


class BusinessCreate(BaseModel):
    name: str
    category: str = "general"


class BusinessOut(BaseModel):
    id: str
    name: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


class BizEntryCreate(BaseModel):
    type: str  # "sale" or "expense"
    amount: float
    item: Optional[str] = None
    note: Optional[str] = None


class BizEntryOut(BaseModel):
    id: str
    type: str
    amount: float
    item: Optional[str]
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class IncomeStatement(BaseModel):
    total_sales: float
    total_expenses: float
    net_profit: float
    entry_count: int


class VoiceParseRequest(BaseModel):
    text: str
    business_id: Optional[str] = None


class VoiceParseResult(BaseModel):
    understood: bool
    type: Optional[str] = None
    amount: Optional[float] = None
    item: Optional[str] = None
    raw_text: str
    message: str


class SavingsGroupCreate(BaseModel):
    name: str
    contribution_amount: float
    frequency_days: int = 7


class SavingsGroupOut(BaseModel):
    id: str
    name: str
    contribution_amount: float
    frequency_days: int
    member_count: int
    current_cycle: int

    class Config:
        from_attributes = True


class ContributeRequest(BaseModel):
    group_id: str


class LedgerRecordCreate(BaseModel):
    description: str
    category: str = "general"
    type: str  # "income" or "expense"
    amount: float
    date: Optional[datetime] = None


class LedgerRecordOut(BaseModel):
    id: str
    date: datetime
    description: str
    category: str
    type: str
    amount: float

    class Config:
        from_attributes = True


class SubscriptionStatus(BaseModel):
    active: bool
    product: str
    expires_at: Optional[datetime] = None


class SubscribeRequest(BaseModel):
    product: str
    amount: float


class ParentLinkCreate(BaseModel):
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    monthly_budget_limit: Optional[float] = None


class ParentLinkOut(BaseModel):
    id: str
    parent_name: Optional[str]
    parent_email: Optional[str]
    share_token: str
    monthly_budget_limit: Optional[float]

    class Config:
        from_attributes = True


class ParentView(BaseModel):
    student_name: str
    university_name: str
    wallet_balance: float
    monthly_budget_limit: Optional[float]
    monthly_spend_so_far: float
    over_budget: bool
    recent_transactions: List[TransactionOut]
