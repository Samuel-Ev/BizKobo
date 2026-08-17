from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("", response_model=List[schemas.LedgerRecordOut])
def list_records(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.LedgerRecord)
        .filter(models.LedgerRecord.user_id == current_user.id)
        .order_by(models.LedgerRecord.date.desc())
        .all()
    )


@router.post("", response_model=schemas.LedgerRecordOut)
def create_record(
    payload: schemas.LedgerRecordCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if payload.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="type must be 'income' or 'expense'")

    record = models.LedgerRecord(
        user_id=current_user.id,
        description=payload.description,
        category=payload.category,
        type=payload.type,
        amount=payload.amount,
        date=payload.date or None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}")
def delete_record(
    record_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(models.LedgerRecord).filter(
        models.LedgerRecord.id == record_id, models.LedgerRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"status": "deleted"}
