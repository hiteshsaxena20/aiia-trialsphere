from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PI = "PI"
    STUDY_COORDINATOR = "STUDY_COORDINATOR"
    MONITOR = "MONITOR"
    ETHICS_COMMITTEE = "ETHICS_COMMITTEE"
    PHARMACOVIGILANCE = "PHARMACOVIGILANCE"
    MANAGEMENT = "MANAGEMENT"
    REGULATOR = "REGULATOR"


class StudyStatus(str, enum.Enum):
    PROTOCOL_CREATED = "PROTOCOL_CREATED"
    IEC_SUBMISSION = "IEC_SUBMISSION"
    IEC_APPROVED = "IEC_APPROVED"
    CTRI_REGISTERED = "CTRI_REGISTERED"
    SITE_ACTIVATED = "SITE_ACTIVATED"
    RECRUITMENT_STARTED = "RECRUITMENT_STARTED"
    ENROLLMENT = "ENROLLMENT"
    RANDOMIZATION = "RANDOMIZATION"
    FOLLOW_UP = "FOLLOW_UP"
    DATA_CLEANING = "DATA_CLEANING"
    DATABASE_LOCK = "DATABASE_LOCK"
    STUDY_CLOSEOUT = "STUDY_CLOSEOUT"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.STUDY_COORDINATOR)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Study(Base):
    __tablename__ = "studies"
    id = Column(Integer, primary_key=True, index=True)
    study_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    study_type = Column(String(50), default="Interventional")
    phase = Column(String(20))
    status = Column(SAEnum(StudyStatus), default=StudyStatus.PROTOCOL_CREATED)
    target_enrollment = Column(Integer, default=0)
    current_enrollment = Column(Integer, default=0)
    start_date = Column(DateTime)
    expected_completion = Column(DateTime)
    pi_id = Column(Integer, ForeignKey("users.id"))
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    risk_score = Column(Float, default=0.0)
    therapeutic_area = Column(String(100))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    pi = relationship("User", foreign_keys=[pi_id])
    study_sites = relationship("StudySite", back_populates="study")
    participants = relationship("Participant", back_populates="study")
    adverse_events = relationship("AdverseEvent", back_populates="study")
    iec_approvals = relationship("IECApproval", back_populates="study")
    ctri_records = relationship("CTRIRecord", back_populates="study")
    alerts = relationship("Alert", back_populates="study")
    monitoring_visits = relationship("MonitoringVisit", back_populates="study")
    protocol_deviations = relationship("ProtocolDeviation", back_populates="study")


class Site(Base):
    __tablename__ = "sites"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(100))
    pi_id = Column(Integer, ForeignKey("users.id"))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    is_active = Column(Boolean, default=True)

    pi = relationship("User", foreign_keys=[pi_id])
    study_sites = relationship("StudySite", back_populates="site")


class StudySite(Base):
    __tablename__ = "study_sites"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    activation_date = Column(DateTime)
    target_patients = Column(Integer, default=0)
    enrolled_patients = Column(Integer, default=0)
    screen_failures = Column(Integer, default=0)
    protocol_deviations = Column(Integer, default=0)
    open_queries = Column(Integer, default=0)
    last_monitoring_date = Column(DateTime)
    next_monitoring_date = Column(DateTime)
    status = Column(String(20), default="ACTIVE")

    study = relationship("Study", back_populates="study_sites")
    site = relationship("Site", back_populates="study_sites")


class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, index=True)
    participant_code = Column(String(30), unique=True, index=True, nullable=False)
    study_id = Column(Integer, ForeignKey("studies.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    screening_date = Column(DateTime)
    enrollment_date = Column(DateTime)
    status = Column(String(30), default="SCREENED")
    randomization_arm = Column(String(20))
    current_visit = Column(String(10))
    is_withdrawn = Column(Boolean, default=False)
    withdrawal_reason = Column(String(200))

    study = relationship("Study", back_populates="participants")
    site = relationship("Site")
    visits = relationship("Visit", back_populates="participant")
    adverse_events = relationship("AdverseEvent", back_populates="participant")


class Visit(Base):
    __tablename__ = "visits"
    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"))
    visit_type = Column(String(30))
    visit_date = Column(DateTime)
    status = Column(String(20), default="SCHEDULED")
    notes = Column(Text)

    participant = relationship("Participant", back_populates="visits")


class AdverseEvent(Base):
    __tablename__ = "adverse_events"
    id = Column(Integer, primary_key=True, index=True)
    ae_code = Column(String(20), unique=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"))
    study_id = Column(Integer, ForeignKey("studies.id"))
    event_description = Column(Text)
    severity = Column(String(20))  # MILD, MODERATE, SEVERE, LIFE_THREATENING
    seriousness = Column(String(20))  # SERIOUS, NON_SERIOUS
    is_sae = Column(Boolean, default=False)
    causality = Column(String(30))  # RELATED, UNRELATED, POSSIBLE, PROBABLE
    outcome = Column(String(30))
    onset_date = Column(DateTime)
    resolution_date = Column(DateTime)
    status = Column(String(30), default="NEW")
    reporting_deadline = Column(DateTime)
    submitted_at = Column(DateTime)
    medical_reviewer_id = Column(Integer, ForeignKey("users.id"))
    hash_value = Column(String(100))
    previous_hash = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participant = relationship("Participant", back_populates="adverse_events")
    study = relationship("Study", back_populates="adverse_events")
    medical_reviewer = relationship("User", foreign_keys=[medical_reviewer_id])


class IECApproval(Base):
    __tablename__ = "iec_approvals"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    approval_number = Column(String(50))
    approval_date = Column(DateTime)
    expiry_date = Column(DateTime)
    status = Column(String(30), default="PENDING")
    committee_name = Column(String(100))
    amendment_number = Column(Integer, default=0)
    document_ref = Column(String(100))

    study = relationship("Study", back_populates="iec_approvals")


class CTRIRecord(Base):
    __tablename__ = "ctri_records"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    registration_number = Column(String(50))
    registration_date = Column(DateTime)
    next_update_due = Column(DateTime)
    status = Column(String(30), default="PENDING")

    study = relationship("Study", back_populates="ctri_records")


class MonitoringVisit(Base):
    __tablename__ = "monitoring_visits"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    visit_type = Column(String(30))  # INITIATION, ROUTINE, CLOSE_OUT
    planned_date = Column(DateTime)
    actual_date = Column(DateTime)
    status = Column(String(20), default="PLANNED")
    monitor_id = Column(Integer, ForeignKey("users.id"))
    findings = Column(Text)

    study = relationship("Study", back_populates="monitoring_visits")
    site = relationship("Site")
    monitor = relationship("User", foreign_keys=[monitor_id])


class ProtocolDeviation(Base):
    __tablename__ = "protocol_deviations"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    deviation_type = Column(String(50))
    description = Column(Text)
    severity = Column(String(20))
    status = Column(String(20), default="OPEN")
    identified_date = Column(DateTime)
    resolved_date = Column(DateTime)

    study = relationship("Study", back_populates="protocol_deviations")


class DataQuery(Base):
    __tablename__ = "data_queries"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    query_type = Column(String(30))
    description = Column(Text)
    status = Column(String(20), default="OPEN")
    raised_date = Column(DateTime, default=datetime.utcnow)
    resolved_date = Column(DateTime)


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"), nullable=True)
    alert_type = Column(String(30))  # RECRUITMENT, SAFETY, COMPLIANCE, DATA_QUALITY, MONITORING
    severity = Column(String(20))    # INFO, WARNING, CRITICAL
    title = Column(String(200))
    message = Column(Text)
    status = Column(String(20), default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    study = relationship("Study", back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100))
    entity_type = Column(String(50))
    entity_id = Column(String(50))
    action = Column(String(50))
    old_value = Column(Text)
    new_value = Column(Text)
    ip_address = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    previous_hash = Column(String(100))
    hash_value = Column(String(100))
    is_tampered = Column(Boolean, default=False)
