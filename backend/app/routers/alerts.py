from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.models import Alert, Study, User
from app.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertResolve(BaseModel):
    resolution_notes: Optional[str] = None


@router.get("")
async def list_alerts(
    skip: int = 0,
    limit: int = 50,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = "OPEN",
    study_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Alert)
    if alert_type:
        q = q.filter(Alert.alert_type == alert_type)
    if severity:
        q = q.filter(Alert.severity == severity)
    if status:
        q = q.filter(Alert.status == status)
    if study_id:
        q = q.filter(Alert.study_id == study_id)

    total = q.count()
    alerts = q.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "study_id": a.study_id,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
        })
    return {"total": total, "alerts": result}


@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    body: AlertResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "RESOLVED"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.id
    db.commit()
    return {"message": "Alert resolved", "id": alert_id}


@router.get("/summary")
async def alerts_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    open_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()
    critical = db.query(Alert).filter(Alert.status == "OPEN", Alert.severity == "CRITICAL").count()
    warning = db.query(Alert).filter(Alert.status == "OPEN", Alert.severity == "WARNING").count()

    by_type = {}
    for t in ["RECRUITMENT", "SAFETY", "COMPLIANCE", "DATA_QUALITY", "MONITORING"]:
        by_type[t] = db.query(Alert).filter(Alert.alert_type == t, Alert.status == "OPEN").count()

    return {
        "open_alerts": open_alerts,
        "critical": critical,
        "warning": warning,
        "by_type": by_type,
    }
