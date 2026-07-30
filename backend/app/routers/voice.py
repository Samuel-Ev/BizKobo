from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..voice_parser import parse_transaction_text
from .sme import _get_owned_business

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/parse", response_model=schemas.VoiceParseResult)
def parse_only(
    payload: schemas.VoiceParseRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    """Parses text/speech into a proposed transaction WITHOUT saving it —
    the frontend shows this for confirmation before committing."""
    return parse_transaction_text(payload.text)


@router.post("/log", response_model=schemas.BizEntryOut)
def parse_and_log(
    payload: schemas.VoiceParseRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Parses text/speech AND commits it as a real business entry.
    Call /voice/parse first to confirm with the user, then this to save."""
    if not payload.business_id:
        raise HTTPException(status_code=400, detail="business_id is required to log an entry")

    business = _get_owned_business(db, payload.business_id, current_user)
    result = parse_transaction_text(payload.text)

    if not result["understood"]:
        raise HTTPException(status_code=422, detail=result["message"])

    entry = models.BizEntry(
        business_id=business.id,
        type=result["type"],
        amount=result["amount"],
        item=result["item"],
        source_text=payload.text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
