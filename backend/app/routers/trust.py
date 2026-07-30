from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth, scoring
from ..database import get_db

router = APIRouter(prefix="/trust-score", tags=["trust-score"])


@router.get("", response_model=schemas.TrustScoreOut)
def get_trust_score(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    data = scoring.compute_trust_score(db, current_user)
    return {
        "score": data["score"],
        "max_score": data["max_score"],
        "tier": data["tier"],
        "points_this_month": max(0, data["score"] - 300 - 250),  # rough delta signal for UI
        "urgent_limit": data["urgent_limit"],
        "breakdown": data["breakdown"],
    }
