from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.models import Study, StudySite, Site, User, StudyStatus, RiskLevel
from app.auth import get_current_user
from app.utils import calculate_study_risk

router = APIRouter(prefix="/api/studies", tags=["studies"])


class StudyCreate(BaseModel):
    study_code: str
    title: str
    study_type: str = "Interventional"
    phase: str = "Phase II"
    target_enrollment: int = 0
    therapeutic_area: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    expected_completion: Optional[str] = None


@router.get("")
async def list_studies(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Study).options(joinedload(Study.pi))
    if status:
        q = q.filter(Study.status == status)
    if risk:
        q = q.filter(Study.risk_level == risk)
    if search:
        q = q.filter(
            Study.title.ilike(f"%{search}%") | Study.study_code.ilike(f"%{search}%")
        )
    total = q.count()
    studies = q.offset(skip).limit(limit).all()
    result = []
    for s in studies:
        site_count = db.query(StudySite).filter(StudySite.study_id == s.id).count()
        pct = round((s.current_enrollment / s.target_enrollment * 100) if s.target_enrollment else 0, 1)
        result.append({
            "id": s.id,
            "study_code": s.study_code,
            "title": s.title,
            "study_type": s.study_type,
            "phase": s.phase,
            "status": s.status,
            "target_enrollment": s.target_enrollment,
            "current_enrollment": s.current_enrollment,
            "enrollment_pct": pct,
            "risk_level": s.risk_level,
            "risk_score": s.risk_score,
            "therapeutic_area": s.therapeutic_area,
            "start_date": s.start_date.isoformat() if s.start_date else None,
            "expected_completion": s.expected_completion.isoformat() if s.expected_completion else None,
            "site_count": site_count,
            "pi_name": s.pi.name if s.pi else None,
        })
    return {"total": total, "studies": result}


@router.get("/{study_id}")
async def get_study(study_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    study = db.query(Study).options(
        joinedload(Study.pi),
        joinedload(Study.study_sites).joinedload(StudySite.site)
    ).filter(Study.id == study_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    risk_data = calculate_study_risk(study)
    sites = []
    for ss in study.study_sites:
        pct = round((ss.enrolled_patients / ss.target_patients * 100) if ss.target_patients else 0, 1)
        sites.append({
            "id": ss.id,
            "site_id": ss.site_id,
            "site_name": ss.site.name if ss.site else "N/A",
            "location": ss.site.location if ss.site else "N/A",
            "target_patients": ss.target_patients,
            "enrolled_patients": ss.enrolled_patients,
            "enrollment_pct": pct,
            "screen_failures": ss.screen_failures,
            "protocol_deviations": ss.protocol_deviations,
            "open_queries": ss.open_queries,
            "last_monitoring_date": ss.last_monitoring_date.isoformat() if ss.last_monitoring_date else None,
            "next_monitoring_date": ss.next_monitoring_date.isoformat() if ss.next_monitoring_date else None,
            "status": ss.status,
        })

    return {
        "id": study.id,
        "study_code": study.study_code,
        "title": study.title,
        "study_type": study.study_type,
        "phase": study.phase,
        "status": study.status,
        "target_enrollment": study.target_enrollment,
        "current_enrollment": study.current_enrollment,
        "enrollment_pct": round((study.current_enrollment / study.target_enrollment * 100) if study.target_enrollment else 0, 1),
        "risk_level": study.risk_level,
        "risk_score": study.risk_score,
        "risk_details": risk_data,
        "therapeutic_area": study.therapeutic_area,
        "description": study.description,
        "start_date": study.start_date.isoformat() if study.start_date else None,
        "expected_completion": study.expected_completion.isoformat() if study.expected_completion else None,
        "pi_name": study.pi.name if study.pi else None,
        "sites": sites,
    }


@router.post("")
async def create_study(
    study_data: StudyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study = Study(
        study_code=study_data.study_code,
        title=study_data.title,
        study_type=study_data.study_type,
        phase=study_data.phase,
        target_enrollment=study_data.target_enrollment,
        therapeutic_area=study_data.therapeutic_area,
        description=study_data.description,
        pi_id=current_user.id,
    )
    if study_data.start_date:
        study.start_date = datetime.fromisoformat(study_data.start_date)
    if study_data.expected_completion:
        study.expected_completion = datetime.fromisoformat(study_data.expected_completion)
    db.add(study)
    db.commit()
    db.refresh(study)
    return {"id": study.id, "study_code": study.study_code, "message": "Study created"}
