from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import IECApproval, CTRIRecord, MonitoringVisit, Alert, Study, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/iec-approvals")
async def list_iec_approvals(
    study_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(IECApproval).options(joinedload(IECApproval.study))
    if study_id:
        q = q.filter(IECApproval.study_id == study_id)
    approvals = q.all()
    now = datetime.utcnow()
    result = []
    for a in approvals:
        days_to_expiry = None
        urgency = "OK"
        if a.expiry_date:
            delta = (a.expiry_date - now).days
            days_to_expiry = delta
            if delta < 0:
                urgency = "EXPIRED"
            elif delta <= 7:
                urgency = "CRITICAL"
            elif delta <= 30:
                urgency = "WARNING"
            elif delta <= 60:
                urgency = "ATTENTION"

        result.append({
            "id": a.id,
            "study_id": a.study_id,
            "study_code": a.study.study_code if a.study else None,
            "study_title": a.study.title if a.study else None,
            "approval_number": a.approval_number,
            "committee_name": a.committee_name,
            "approval_date": a.approval_date.isoformat() if a.approval_date else None,
            "expiry_date": a.expiry_date.isoformat() if a.expiry_date else None,
            "days_to_expiry": days_to_expiry,
            "urgency": urgency,
            "status": a.status,
            "amendment_number": a.amendment_number,
        })
    return {"total": len(result), "approvals": result}


@router.get("/ctri-records")
async def list_ctri_records(
    study_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(CTRIRecord).options(joinedload(CTRIRecord.study))
    if study_id:
        q = q.filter(CTRIRecord.study_id == study_id)
    records = q.all()
    now = datetime.utcnow()
    result = []
    for r in records:
        days_to_update = None
        urgency = "OK"
        if r.next_update_due:
            delta = (r.next_update_due - now).days
            days_to_update = delta
            if delta < 0:
                urgency = "OVERDUE"
            elif delta <= 7:
                urgency = "CRITICAL"
            elif delta <= 30:
                urgency = "WARNING"

        result.append({
            "id": r.id,
            "study_id": r.study_id,
            "study_code": r.study.study_code if r.study else None,
            "registration_number": r.registration_number,
            "registration_date": r.registration_date.isoformat() if r.registration_date else None,
            "next_update_due": r.next_update_due.isoformat() if r.next_update_due else None,
            "days_to_update": days_to_update,
            "urgency": urgency,
            "status": r.status,
        })
    return {"total": len(result), "records": result}


@router.get("/monitoring-visits")
async def list_monitoring_visits(
    study_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(MonitoringVisit).options(
        joinedload(MonitoringVisit.study),
        joinedload(MonitoringVisit.site),
        joinedload(MonitoringVisit.monitor)
    )
    if study_id:
        q = q.filter(MonitoringVisit.study_id == study_id)
    if status:
        q = q.filter(MonitoringVisit.status == status)
    visits = q.all()
    now = datetime.utcnow()
    result = []
    for v in visits:
        is_overdue = (v.planned_date and v.planned_date < now and v.status == "PLANNED")
        result.append({
            "id": v.id,
            "study_code": v.study.study_code if v.study else None,
            "site_name": v.site.name if v.site else None,
            "visit_type": v.visit_type,
            "planned_date": v.planned_date.isoformat() if v.planned_date else None,
            "actual_date": v.actual_date.isoformat() if v.actual_date else None,
            "status": v.status,
            "monitor_name": v.monitor.name if v.monitor else None,
            "is_overdue": is_overdue,
            "findings": v.findings,
        })
    return {"total": len(result), "visits": result}


@router.get("/dashboard")
async def compliance_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    iec_expiring = db.query(IECApproval).filter(
        IECApproval.expiry_date > now,
        IECApproval.expiry_date < now + timedelta(days=90)
    ).count()
    iec_expired = db.query(IECApproval).filter(IECApproval.expiry_date < now).count()
    ctri_overdue = db.query(CTRIRecord).filter(CTRIRecord.next_update_due < now).count()
    monitoring_overdue = db.query(MonitoringVisit).filter(
        MonitoringVisit.planned_date < now,
        MonitoringVisit.status == "PLANNED"
    ).count()
    return {
        "iec_expiring_90d": iec_expiring,
        "iec_expired": iec_expired,
        "ctri_overdue": ctri_overdue,
        "monitoring_overdue": monitoring_overdue,
    }
