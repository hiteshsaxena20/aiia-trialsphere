from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.models import Participant, Visit, User, Study, Site
from app.auth import get_current_user

router = APIRouter(prefix="/api/participants", tags=["participants"])


@router.get("")
async def list_participants(
    skip: int = 0,
    limit: int = 50,
    study_id: Optional[int] = None,
    site_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Participant)
    if study_id:
        q = q.filter(Participant.study_id == study_id)
    if site_id:
        q = q.filter(Participant.site_id == site_id)
    if status:
        q = q.filter(Participant.status == status)

    total = q.count()
    participants = q.offset(skip).limit(limit).all()

    result = []
    for p in participants:
        result.append({
            "id": p.id,
            "participant_code": p.participant_code,
            "study_id": p.study_id,
            "site_id": p.site_id,
            "status": p.status,
            "screening_date": p.screening_date.isoformat() if p.screening_date else None,
            "enrollment_date": p.enrollment_date.isoformat() if p.enrollment_date else None,
            "randomization_arm": p.randomization_arm,
            "current_visit": p.current_visit,
            "is_withdrawn": p.is_withdrawn,
        })
    return {"total": total, "participants": result}


@router.get("/{participant_id}/visits")
async def get_participant_visits(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    visits = db.query(Visit).filter(Visit.participant_id == participant_id).order_by(Visit.visit_date).all()
    return [{"id": v.id, "visit_type": v.visit_type, "visit_date": v.visit_date.isoformat() if v.visit_date else None, "status": v.status} for v in visits]
