from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.models import AdverseEvent, Participant, Study, User, AuditLog
from app.auth import get_current_user
from app.utils import compute_hash

router = APIRouter(prefix="/api/safety", tags=["safety"])


class AEUpdate(BaseModel):
    status: str
    causality: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None


@router.get("/adverse-events")
async def list_adverse_events(
    skip: int = 0,
    limit: int = 50,
    study_id: Optional[int] = None,
    is_sae: Optional[bool] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(AdverseEvent).options(
        joinedload(AdverseEvent.study),
        joinedload(AdverseEvent.participant)
    )
    if study_id:
        q = q.filter(AdverseEvent.study_id == study_id)
    if is_sae is not None:
        q = q.filter(AdverseEvent.is_sae == is_sae)
    if status:
        q = q.filter(AdverseEvent.status == status)

    total = q.count()
    events = q.order_by(AdverseEvent.created_at.desc()).offset(skip).limit(limit).all()

    now = datetime.utcnow()
    result = []
    for ae in events:
        days_to_deadline = None
        is_overdue = False
        if ae.reporting_deadline:
            delta = (ae.reporting_deadline - now).days
            days_to_deadline = delta
            is_overdue = delta < 0 and ae.status not in ["SUBMITTED", "CLOSED"]

        result.append({
            "id": ae.id,
            "ae_code": ae.ae_code,
            "study_code": ae.study.study_code if ae.study else None,
            "participant_code": ae.participant.participant_code if ae.participant else None,
            "event_description": ae.event_description,
            "severity": ae.severity,
            "seriousness": ae.seriousness,
            "is_sae": ae.is_sae,
            "causality": ae.causality,
            "outcome": ae.outcome,
            "status": ae.status,
            "onset_date": ae.onset_date.isoformat() if ae.onset_date else None,
            "reporting_deadline": ae.reporting_deadline.isoformat() if ae.reporting_deadline else None,
            "days_to_deadline": days_to_deadline,
            "is_overdue": is_overdue,
            "hash_value": ae.hash_value,
            "created_at": ae.created_at.isoformat() if ae.created_at else None,
        })
    return {"total": total, "events": result}


@router.get("/adverse-events/{ae_id}")
async def get_adverse_event(ae_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
    if not ae:
        raise HTTPException(status_code=404, detail="Adverse event not found")
    return ae


@router.put("/adverse-events/{ae_id}/status")
async def update_ae_status(
    ae_id: int,
    update: AEUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
    if not ae:
        raise HTTPException(status_code=404, detail="Not found")

    old_status = ae.status
    old_hash = ae.hash_value

    ae.status = update.status
    if update.causality:
        ae.causality = update.causality
    if update.outcome:
        ae.outcome = update.outcome
    if update.status == "SUBMITTED":
        ae.submitted_at = datetime.utcnow()

    ae.updated_at = datetime.utcnow()

    # Recompute hash for tamper detection
    new_hash = compute_hash({
        "ae_code": ae.ae_code,
        "status": ae.status,
        "causality": ae.causality,
        "outcome": ae.outcome,
    }, ae.previous_hash or "")
    ae.hash_value = new_hash

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        entity_type="ADVERSE_EVENT",
        entity_id=ae.ae_code,
        action=f"UPDATE_STATUS",
        old_value=old_status,
        new_value=update.status,
    )
    # Chain audit hash
    last_audit = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = last_audit.hash_value if last_audit else ""
    audit_hash = compute_hash({
        "user_id": current_user.id,
        "entity_type": "ADVERSE_EVENT",
        "entity_id": ae.ae_code,
        "action": "UPDATE_STATUS",
        "old_value": old_status,
        "new_value": update.status,
        "timestamp": audit.timestamp.isoformat() if audit.timestamp else "",
    }, prev_hash)
    audit.previous_hash = prev_hash
    audit.hash_value = audit_hash

    db.add(audit)
    db.commit()
    return {"message": "AE status updated", "new_hash": new_hash, "ae_code": ae.ae_code}


@router.get("/summary")
async def get_safety_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    total_ae = db.query(AdverseEvent).count()
    total_sae = db.query(AdverseEvent).filter(AdverseEvent.is_sae == True).count()
    open_events = db.query(AdverseEvent).filter(AdverseEvent.status.in_(["NEW", "UNDER_REVIEW", "PENDING"])).count()
    overdue = db.query(AdverseEvent).filter(
        AdverseEvent.reporting_deadline < now,
        AdverseEvent.status.notin_(["SUBMITTED", "CLOSED"])
    ).count()

    severity_breakdown = {}
    for sev in ["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"]:
        severity_breakdown[sev] = db.query(AdverseEvent).filter(AdverseEvent.severity == sev).count()

    return {
        "total_ae": total_ae,
        "total_sae": total_sae,
        "open_events": open_events,
        "overdue": overdue,
        "severity_breakdown": severity_breakdown,
    }
