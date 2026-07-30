from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/business", tags=["business"])


@router.get("", response_model=List[schemas.BusinessOut])
def list_my_businesses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Business)
        .filter(models.Business.owner_id == current_user.id)
        .order_by(models.Business.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.BusinessOut)
def create_business(
    payload: schemas.BusinessCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    business = models.Business(
        university_id=current_user.university_id,
        owner_id=current_user.id,
        name=payload.name,
        category=payload.category,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


def _get_owned_business(db: Session, business_id: str, user: models.User) -> models.Business:
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business or business.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Business not found")
    return business


@router.get("/{business_id}/entries", response_model=List[schemas.BizEntryOut])
def list_entries(
    business_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_business(db, business_id, current_user)
    return (
        db.query(models.BizEntry)
        .filter(models.BizEntry.business_id == business_id)
        .order_by(models.BizEntry.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/{business_id}/entries", response_model=schemas.BizEntryOut)
def add_entry(
    business_id: str,
    payload: schemas.BizEntryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_business(db, business_id, current_user)
    if payload.type not in ("sale", "expense"):
        raise HTTPException(status_code=400, detail="type must be 'sale' or 'expense'")

    entry = models.BizEntry(
        business_id=business_id,
        type=payload.type,
        amount=payload.amount,
        item=payload.item,
        note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{business_id}/income-statement", response_model=schemas.IncomeStatement)
def income_statement(
    business_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_business(db, business_id, current_user)
    entries = db.query(models.BizEntry).filter(models.BizEntry.business_id == business_id).all()

    total_sales = sum(e.amount for e in entries if e.type == models.BizEntryType.sale)
    total_expenses = sum(e.amount for e in entries if e.type == models.BizEntryType.expense)

    return {
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "net_profit": total_sales - total_expenses,
        "entry_count": len(entries),
    }
