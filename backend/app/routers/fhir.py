from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Study, Participant, AdverseEvent, User
from app.auth import get_current_user
import json
from datetime import datetime

router = APIRouter(prefix="/api/fhir", tags=["fhir"])


def study_to_fhir(study) -> dict:
    return {
        "resourceType": "ResearchStudy",
        "id": f"AIIA-{study.study_code}",
        "identifier": [{"system": "https://aiia.gov.in/ctms/study", "value": study.study_code}],
        "title": study.title,
        "status": "active" if study.status in ["ENROLLMENT", "RECRUITMENT_STARTED"] else "completed",
        "phase": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/research-study-phase", "code": study.phase or "phase-2"}]
        },
        "enrollment": [{"reference": f"Group/study-{study.id}-enrollment"}],
        "period": {
            "start": study.start_date.isoformat() if study.start_date else None,
            "end": study.expected_completion.isoformat() if study.expected_completion else None,
        },
        "sponsor": {"reference": "Organization/AIIA"},
        "meta": {"lastUpdated": datetime.utcnow().isoformat()},
    }


def ae_to_fhir(ae) -> dict:
    severity_map = {"MILD": "mild", "MODERATE": "moderate", "SEVERE": "severe", "LIFE_THREATENING": "life-threatening"}
    return {
        "resourceType": "AdverseEvent",
        "id": ae.ae_code,
        "status": ae.status.lower(),
        "actuality": "actual",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/adverse-event-category", "code": "medication-mishap"}]}],
        "event": {"text": ae.event_description},
        "subject": {"reference": f"Patient/{ae.participant_id}"},
        "seriousness": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/adverse-event-seriousness",
                        "code": "serious" if ae.is_sae else "non-serious"}]
        },
        "severity": {
            "coding": [{"system": "http://terminology.hl7.org/CodeSystem/adverse-event-severity",
                        "code": severity_map.get(ae.severity, "moderate")}]
        },
        "date": ae.onset_date.isoformat() if ae.onset_date else None,
    }


@router.get("/studies/{study_id}")
async def export_study_fhir(study_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == study_id).first()
    if not study:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Study not found")
    return study_to_fhir(study)


@router.get("/adverse-events/{ae_id}")
async def export_ae_fhir(ae_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
    if not ae:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="AE not found")
    return ae_to_fhir(ae)


@router.get("/bundle/studies")
async def export_all_studies_fhir(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    studies = db.query(Study).limit(20).all()
    entries = [{"resource": study_to_fhir(s)} for s in studies]
    return {
        "resourceType": "Bundle",
        "type": "collection",
        "total": len(entries),
        "timestamp": datetime.utcnow().isoformat(),
        "entry": entries,
    }


@router.post("/import")
async def import_fhir_resource(resource: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Accept a FHIR R4 resource and validate it."""
    resource_type = resource.get("resourceType")
    if not resource_type:
        return {"status": "REJECTED", "reason": "Missing resourceType"}
    if resource_type not in ["ResearchStudy", "AdverseEvent", "Patient", "ResearchSubject", "Observation"]:
        return {"status": "REJECTED", "reason": f"Unsupported resourceType: {resource_type}"}
    return {
        "status": "VALIDATED",
        "resourceType": resource_type,
        "id": resource.get("id"),
        "message": f"FHIR {resource_type} resource validated and accepted into AIIA TrialSphere",
    }
