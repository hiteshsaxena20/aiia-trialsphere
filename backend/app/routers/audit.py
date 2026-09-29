from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.models import AuditLog, User
from app.auth import get_current_user
from app.utils import compute_hash

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("")
async def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(AuditLog)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        q = q.filter(AuditLog.entity_id == entity_id)
    total = q.count()
    logs = q.order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_name": log.user_name,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "previous_hash": log.previous_hash,
            "hash_value": log.hash_value,
            "is_tampered": log.is_tampered,
        })
    return {"total": total, "logs": result}


@router.get("/verify")
async def verify_audit_chain(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify the integrity of the audit hash chain."""
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    tampered_ids = []
    for log in logs:
        expected = compute_hash({
            "user_id": log.user_id,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "timestamp": str(log.timestamp),
        }, log.previous_hash or "")
        if expected != log.hash_value:
            tampered_ids.append(log.id)
            log.is_tampered = True

    if tampered_ids:
        db.commit()

    return {
        "total_records": len(logs),
        "integrity": "COMPROMISED" if tampered_ids else "VERIFIED",
        "tampered_records": tampered_ids,
        "message": f"Chain integrity {'VIOLATED' if tampered_ids else 'verified'}. {len(tampered_ids)} tampered record(s)." if tampered_ids else "All audit records are intact.",
    }


@router.post("/tamper-demo/{log_id}")
async def simulate_tamper(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """DEMO ONLY: Simulate tampering a record to demonstrate detection."""
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    original_value = log.new_value
    log.new_value = f"TAMPERED_{log.new_value}"  # Simulate modification
    db.commit()

    return {
        "message": "Record tampered (demo). Run /verify to detect.",
        "log_id": log_id,
        "original_value": original_value,
        "tampered_value": log.new_value,
    }
