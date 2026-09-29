from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.models import Study, Alert, AdverseEvent, Participant, IECApproval, CTRIRecord, MonitoringVisit, StudySite, AuditLog
from app.auth import get_current_user
from app.models.models import User
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_studies = db.query(Study).count()
    active_studies = db.query(Study).filter(Study.status.in_(["ENROLLMENT", "RECRUITMENT_STARTED", "FOLLOW_UP", "SITE_ACTIVATED"])).count()
    total_participants = db.query(Participant).filter(Participant.status == "ENROLLED").count()
    total_sae = db.query(AdverseEvent).filter(AdverseEvent.is_sae == True).count()
    total_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()
    total_ae = db.query(AdverseEvent).count()

    # Risk distribution
    low_risk = db.query(Study).filter(Study.risk_level == "LOW").count()
    medium_risk = db.query(Study).filter(Study.risk_level == "MEDIUM").count()
    high_risk = db.query(Study).filter(Study.risk_level == "HIGH").count()
    critical_risk = db.query(Study).filter(Study.risk_level == "CRITICAL").count()

    # Safety stats
    open_sae = db.query(AdverseEvent).filter(AdverseEvent.is_sae == True, AdverseEvent.status.in_(["NEW", "UNDER_REVIEW", "PENDING"])).count()
    now = datetime.utcnow()
    overdue_sae = db.query(AdverseEvent).filter(
        AdverseEvent.is_sae == True,
        AdverseEvent.status != "SUBMITTED",
        AdverseEvent.status != "CLOSED",
        AdverseEvent.reporting_deadline < now
    ).count()

    # Compliance
    iec_due = db.query(IECApproval).filter(
        IECApproval.expiry_date < now + timedelta(days=60),
        IECApproval.expiry_date > now,
        IECApproval.status == "APPROVED"
    ).count()
    ctri_due = db.query(CTRIRecord).filter(
        CTRIRecord.next_update_due < now + timedelta(days=30),
        CTRIRecord.next_update_due > now
    ).count()
    monitoring_due = db.query(MonitoringVisit).filter(
        MonitoringVisit.planned_date < now,
        MonitoringVisit.status == "PLANNED"
    ).count()

    # Enrollment performance
    studies = db.query(Study).all()
    total_target = sum(s.target_enrollment for s in studies if s.target_enrollment)
    total_enrolled = sum(s.current_enrollment for s in studies if s.current_enrollment)
    enrollment_pct = round((total_enrolled / total_target * 100) if total_target > 0 else 0, 1)

    # Alert breakdown by type
    recruitment_alerts = db.query(Alert).filter(Alert.alert_type == "RECRUITMENT", Alert.status == "OPEN").count()
    safety_alerts = db.query(Alert).filter(Alert.alert_type == "SAFETY", Alert.status == "OPEN").count()
    compliance_alerts = db.query(Alert).filter(Alert.alert_type == "COMPLIANCE", Alert.status == "OPEN").count()
    dq_alerts = db.query(Alert).filter(Alert.alert_type == "DATA_QUALITY", Alert.status == "OPEN").count()

    return {
        "kpis": {
            "total_studies": total_studies,
            "active_studies": active_studies,
            "total_participants": total_participants,
            "total_ae": total_ae,
            "total_sae": total_sae,
            "open_sae": open_sae,
            "overdue_sae": overdue_sae,
            "total_alerts": total_alerts,
            "enrollment_pct": enrollment_pct,
            "total_enrolled": total_enrolled,
            "total_target": total_target,
        },
        "risk_distribution": {
            "LOW": low_risk,
            "MEDIUM": medium_risk,
            "HIGH": high_risk,
            "CRITICAL": critical_risk,
        },
        "safety": {
            "total_ae": total_ae,
            "total_sae": total_sae,
            "open_sae": open_sae,
            "overdue_sae": overdue_sae,
        },
        "compliance": {
            "iec_due": iec_due,
            "ctri_due": ctri_due,
            "monitoring_due": monitoring_due,
        },
        "alerts_breakdown": {
            "RECRUITMENT": recruitment_alerts,
            "SAFETY": safety_alerts,
            "COMPLIANCE": compliance_alerts,
            "DATA_QUALITY": dq_alerts,
        }
    }


@router.get("/enrollment-trend")
async def get_enrollment_trend(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    studies = db.query(Study).limit(10).all()
    result = []
    for s in studies:
        pct = round((s.current_enrollment / s.target_enrollment * 100) if s.target_enrollment else 0, 1)
        result.append({
            "study_code": s.study_code,
            "target": s.target_enrollment,
            "enrolled": s.current_enrollment,
            "pct": pct,
            "status": s.status,
            "risk": s.risk_level,
        })
    return result


@router.get("/recent-alerts")
async def get_recent_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alerts = db.query(Alert).filter(Alert.status == "OPEN").order_by(Alert.created_at.desc()).limit(10).all()
    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "study_id": a.study_id,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result
