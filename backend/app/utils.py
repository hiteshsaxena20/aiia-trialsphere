import hashlib
import json
from datetime import datetime


def compute_hash(data: dict, previous_hash: str = "") -> str:
    """Compute SHA-256 hash of data combined with previous hash (chain integrity)."""
    payload = json.dumps(data, sort_keys=True, default=str) + previous_hash
    return hashlib.sha256(payload.encode()).hexdigest()


def verify_audit_chain(logs: list) -> list:
    """Verify integrity of the audit hash chain. Returns list of tampered record IDs."""
    tampered = []
    for i, log in enumerate(logs):
        expected_hash = compute_hash(
            {
                "user_id": log.user_id,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "action": log.action,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "timestamp": str(log.timestamp),
            },
            log.previous_hash or ""
        )
        if expected_hash != log.hash_value:
            tampered.append(log.id)
    return tampered


def format_risk_score(score: float) -> str:
    if score < 30:
        return "LOW"
    elif score < 60:
        return "MEDIUM"
    elif score < 80:
        return "HIGH"
    else:
        return "CRITICAL"


def calculate_study_risk(study, site_data: list = None) -> dict:
    """Calculate composite risk score for a study."""
    enrollment_pct = 0
    if study.target_enrollment > 0:
        enrollment_pct = (study.current_enrollment / study.target_enrollment) * 100

    # Enrollment risk (0-100, higher = more at risk)
    if study.start_date and study.expected_completion:
        now = datetime.utcnow()
        total_days = (study.expected_completion - study.start_date).days
        elapsed_days = (now - study.start_date).days
        if total_days > 0:
            time_pct = min((elapsed_days / total_days) * 100, 100)
        else:
            time_pct = 100
        enrollment_risk = max(0, time_pct - enrollment_pct)
    else:
        enrollment_risk = max(0, 100 - enrollment_pct)

    components = {
        "enrollment": min(enrollment_risk, 100),
        "data_quality": 20.0,   # Would come from DQ engine
        "safety": 15.0,         # Would come from AE count
        "compliance": 25.0,     # Would come from IEC/CTRI status
        "protocol": 10.0,       # From protocol deviations
    }

    weights = {"enrollment": 0.30, "data_quality": 0.20, "safety": 0.20, "compliance": 0.15, "protocol": 0.15}
    overall = sum(components[k] * weights[k] for k in weights)

    return {
        "overall": round(overall, 1),
        "level": format_risk_score(overall),
        "components": {k: round(v, 1) for k, v in components.items()},
    }
