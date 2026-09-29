"""
AIIA TrialSphere - Synthetic Data Seeder
Generates realistic clinical trial data for demonstration.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.models import (
    User, UserRole, Study, StudyStatus, RiskLevel, Site, StudySite,
    Participant, Visit, AdverseEvent, IECApproval, CTRIRecord,
    MonitoringVisit, ProtocolDeviation, DataQuery, Alert, AuditLog
)
from app.auth import get_password_hash
from app.utils import compute_hash
from datetime import datetime, timedelta
import random
import hashlib

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("🌱 Seeding AIIA TrialSphere database...")

# ─── USERS ────────────────────────────────────────────────────────────────────
users_data = [
    {"name": "Dr. Rajesh Kumar", "email": "admin@aiia.gov.in", "role": UserRole.ADMIN, "pw": "Admin@123"},
    {"name": "Dr. Priya Sharma", "email": "pi1@aiia.gov.in", "role": UserRole.PI, "pw": "PI@1234"},
    {"name": "Dr. Amit Singh", "email": "pi2@aiia.gov.in", "role": UserRole.PI, "pw": "PI@1234"},
    {"name": "Dr. Sunita Verma", "email": "pi3@aiia.gov.in", "role": UserRole.PI, "pw": "PI@1234"},
    {"name": "Ms. Kavya Reddy", "email": "coord1@aiia.gov.in", "role": UserRole.STUDY_COORDINATOR, "pw": "Coord@123"},
    {"name": "Mr. Rohit Gupta", "email": "coord2@aiia.gov.in", "role": UserRole.STUDY_COORDINATOR, "pw": "Coord@123"},
    {"name": "Ms. Anita Patel", "email": "monitor@aiia.gov.in", "role": UserRole.MONITOR, "pw": "Monitor@123"},
    {"name": "Dr. Vikram Das", "email": "pv@aiia.gov.in", "role": UserRole.PHARMACOVIGILANCE, "pw": "PV@1234"},
    {"name": "Dr. Meena Joshi", "email": "ethics@aiia.gov.in", "role": UserRole.ETHICS_COMMITTEE, "pw": "Ethics@123"},
    {"name": "Mr. Suresh Nair", "email": "mgmt@aiia.gov.in", "role": UserRole.MANAGEMENT, "pw": "Mgmt@123"},
]

users = []
for ud in users_data:
    existing = db.query(User).filter(User.email == ud["email"]).first()
    if not existing:
        u = User(name=ud["name"], email=ud["email"], role=ud["role"],
                 hashed_password=get_password_hash(ud["pw"]))
        db.add(u)
        db.flush()
        users.append(u)
    else:
        users.append(existing)
db.commit()
print(f"  ✓ {len(users)} users created")

# ─── SITES ────────────────────────────────────────────────────────────────────
sites_data = [
    {"name": "AIIA New Delhi", "location": "New Delhi"},
    {"name": "AIIA Jaipur", "location": "Jaipur"},
    {"name": "AIIA Bhopal", "location": "Bhopal"},
    {"name": "AIIA Pune", "location": "Pune"},
    {"name": "AIIA Chennai", "location": "Chennai"},
    {"name": "AIIA Kolkata", "location": "Kolkata"},
    {"name": "AIIA Hyderabad", "location": "Hyderabad"},
    {"name": "AIIA Lucknow", "location": "Lucknow"},
    {"name": "AIIA Bengaluru", "location": "Bengaluru"},
    {"name": "AIIA Ahmedabad", "location": "Ahmedabad"},
    {"name": "AIIA Nagpur", "location": "Nagpur"},
    {"name": "AIIA Patna", "location": "Patna"},
    {"name": "AIIA Chandigarh", "location": "Chandigarh"},
    {"name": "AIIA Thiruvananthapuram", "location": "Thiruvananthapuram"},
    {"name": "AIIA Guwahati", "location": "Guwahati"},
    {"name": "AIIA Bhubaneswar", "location": "Bhubaneswar"},
    {"name": "AIIA Varanasi", "location": "Varanasi"},
    {"name": "AIIA Shimla", "location": "Shimla"},
    {"name": "AIIA Srinagar", "location": "Srinagar"},
    {"name": "AIIA Gandhinagar", "location": "Gandhinagar"},
]
pi_users = [u for u in users if u.role == UserRole.PI]
sites = []
for sd in sites_data:
    existing = db.query(Site).filter(Site.name == sd["name"]).first()
    if not existing:
        s = Site(name=sd["name"], location=sd["location"],
                 pi_id=random.choice(pi_users).id if pi_users else None)
        db.add(s)
        db.flush()
        sites.append(s)
    else:
        sites.append(existing)
db.commit()
print(f"  ✓ {len(sites)} sites created")

# ─── STUDIES ──────────────────────────────────────────────────────────────────
ayurvedic_interventions = [
    ("Triphala Churna for Metabolic Syndrome", "Metabolic", 500),
    ("Ashwagandha in Type-2 Diabetes Management", "Endocrinology", 300),
    ("Brahmi Formulation for Cognitive Function", "Neurology", 250),
    ("Guduchi for Immune Enhancement in HIV", "Immunology", 200),
    ("Shatavari for Female Reproductive Health", "Gynecology", 400),
    ("Haritaki for Chronic Constipation", "Gastroenterology", 180),
    ("Neem Extract in Dermatological Conditions", "Dermatology", 220),
    ("Turmeric Protocol for Inflammatory Arthritis", "Rheumatology", 350),
    ("Pushkarmool for Respiratory Conditions", "Pulmonology", 150),
    ("Kutki for Hepatoprotective Activity", "Hepatology", 260),
    ("Manjistha for Renal Function", "Nephrology", 190),
    ("Arjuna Bark for Cardiac Health", "Cardiology", 320),
    ("Vidanga for Antihelminthic Activity", "Parasitology", 140),
    ("Yashtimadhu for Peptic Ulcer Disease", "Gastroenterology", 280),
    ("Bala for Musculoskeletal Disorders", "Orthopedics", 210),
    ("Shankhpushpi for Anxiety Disorders", "Psychiatry", 300),
    ("Amalaki for Antioxidant Activity", "Preventive Medicine", 450),
    ("Punarnava for Edema Management", "Nephrology", 170),
    ("Chitraka for Digestive Disorders", "Gastroenterology", 130),
    ("Vacha for Cognitive Enhancement in Elderly", "Geriatrics", 240),
    ("Trikatu for Obesity Management", "Endocrinology", 380),
    ("Jatamansi for Sleep Disorders", "Neurology", 200),
    ("Vidari for Sports Performance", "Sports Medicine", 160),
    ("Haridra for Wound Healing", "Surgery", 220),
    ("Guggulu for Dyslipidemia", "Cardiology", 290),
    ("Sarpagandha for Hypertension Management", "Cardiology", 310),
    ("Bibhitaki for COPD Management", "Pulmonology", 175),
    ("Pippali for Bioavailability Enhancement", "Pharmacology", 120),
    ("Devadaru for Fever Management", "General Medicine", 200),
    ("Gokshura for Male Reproductive Health", "Urology", 250),
    ("Musta for Menstrual Disorders", "Gynecology", 180),
    ("Daru Haridra for Diabetic Neuropathy", "Neurology", 230),
    ("Katuki for Autoimmune Hepatitis", "Hepatology", 140),
    ("Nagarmotha for Irritable Bowel Syndrome", "Gastroenterology", 270),
    ("Tagar for Post-Traumatic Stress", "Psychiatry", 160),
    ("Chandan for Urinary Tract Infection", "Urology", 200),
    ("Kesar for Depression Management", "Psychiatry", 185),
    ("Lodhra for Polycystic Ovary Syndrome", "Gynecology", 240),
    ("Ela for Cardioprotective Effects", "Cardiology", 195),
    ("Patha for Antimicrobial Activity", "Infectious Disease", 150),
    ("Dhamasa for Liver Fibrosis", "Hepatology", 170),
    ("Kapikachhu for Parkinson's Disease", "Neurology", 160),
    ("Bilva for Dysentery Management", "Gastroenterology", 130),
    ("Tejpatra for Diabetes Management", "Endocrinology", 220),
    ("Ativisha for Cholera Management", "Infectious Disease", 100),
    ("Kutaja for Amoebic Dysentery", "Infectious Disease", 140),
    ("Bhringaraj for Alopecia Treatment", "Dermatology", 200),
    ("Til Taila for Osteoarthritis (Panchakarma)", "Rheumatology", 180),
    ("Padmaka for Skin Pigmentation Disorders", "Dermatology", 160),
    ("Vasa for Acute Bronchitis Management", "Pulmonology", 220),
]

study_statuses = [
    StudyStatus.ENROLLMENT,
    StudyStatus.ENROLLMENT,
    StudyStatus.ENROLLMENT,
    StudyStatus.RECRUITMENT_STARTED,
    StudyStatus.RECRUITMENT_STARTED,
    StudyStatus.FOLLOW_UP,
    StudyStatus.IEC_APPROVED,
    StudyStatus.CTRI_REGISTERED,
    StudyStatus.SITE_ACTIVATED,
    StudyStatus.DATA_CLEANING,
]

risk_levels = [RiskLevel.LOW, RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
phases = ["Phase I", "Phase II", "Phase II", "Phase II", "Phase III", "Phase III", "Phase IV", "Observational"]

studies = []
now = datetime.utcnow()
for i, (title, area, target) in enumerate(ayurvedic_interventions):
    code = f"AIIA-AYU-2026-{str(i+1).zfill(3)}"
    existing = db.query(Study).filter(Study.study_code == code).first()
    if existing:
        studies.append(existing)
        continue

    start = now - timedelta(days=random.randint(90, 720))
    end = start + timedelta(days=random.randint(365, 900))
    status = random.choice(study_statuses)
    risk = random.choice(risk_levels)
    enrolled = int(target * random.uniform(0.3, 0.98)) if status in [StudyStatus.ENROLLMENT, StudyStatus.FOLLOW_UP, StudyStatus.DATA_CLEANING] else int(target * random.uniform(0, 0.4))

    s = Study(
        study_code=code,
        title=title,
        study_type="Interventional" if i % 7 != 0 else "Observational",
        phase=random.choice(phases),
        status=status,
        target_enrollment=target,
        current_enrollment=enrolled,
        start_date=start,
        expected_completion=end,
        therapeutic_area=area,
        risk_level=risk,
        risk_score=random.uniform(5, 85) if risk != RiskLevel.LOW else random.uniform(5, 25),
        pi_id=random.choice(pi_users).id if pi_users else None,
        description=f"A clinical study evaluating the efficacy and safety of {title.split(' for ')[0].strip()} in {area} conditions according to AYUSH guidelines.",
    )
    db.add(s)
    db.flush()
    studies.append(s)

    # Assign 2-5 sites
    n_sites = random.randint(2, 5)
    selected_sites = random.sample(sites, min(n_sites, len(sites)))
    for site in selected_sites:
        site_target = target // n_sites
        site_enrolled = int(site_target * random.uniform(0.2, 1.1))
        ss = StudySite(
            study_id=s.id,
            site_id=site.id,
            activation_date=start + timedelta(days=30),
            target_patients=site_target,
            enrolled_patients=min(site_enrolled, site_target),
            screen_failures=random.randint(0, site_enrolled // 5 + 1),
            protocol_deviations=random.randint(0, 8),
            open_queries=random.randint(0, 15),
            last_monitoring_date=now - timedelta(days=random.randint(10, 120)),
            next_monitoring_date=now + timedelta(days=random.randint(-10, 90)),
            status="ACTIVE",
        )
        db.add(ss)

db.commit()
print(f"  ✓ {len(studies)} studies created")

# ─── PARTICIPANTS ─────────────────────────────────────────────────────────────
active_studies = [s for s in studies if s.status in [StudyStatus.ENROLLMENT, StudyStatus.FOLLOW_UP, StudyStatus.DATA_CLEANING, StudyStatus.RECRUITMENT_STARTED]]
participant_statuses = ["ENROLLED", "ENROLLED", "ENROLLED", "SCREENED", "COMPLETED", "WITHDRAWN"]
arms = ["ARM-A", "ARM-B", "ARM-C"]
visits_seq = ["SCREENING", "V1", "V2", "V3", "V4", "V5", "V6", "FINAL"]

existing_participants = db.query(Participant).count()
participants_created = 0
all_participants = []

if existing_participants < 100:
    for study in active_studies[:20]:
        n = min(study.current_enrollment, 60)
        for j in range(n):
            code = f"PT-AIIA-{study.id:03d}{j:04d}"
            screening = study.start_date + timedelta(days=random.randint(10, 300)) if study.start_date else now - timedelta(days=200)
            p = Participant(
                participant_code=code,
                study_id=study.id,
                site_id=random.choice(sites).id,
                screening_date=screening,
                enrollment_date=screening + timedelta(days=random.randint(3, 14)),
                status=random.choice(participant_statuses),
                randomization_arm=random.choice(arms),
                current_visit=random.choice(visits_seq[1:]),
            )
            db.add(p)
            db.flush()
            all_participants.append(p)
            participants_created += 1

            # Create some visits
            for vi, vt in enumerate(visits_seq[:random.randint(2, 8)]):
                v = Visit(
                    participant_id=p.id,
                    visit_type=vt,
                    visit_date=screening + timedelta(days=vi * 30 + random.randint(-3, 3)),
                    status="COMPLETED" if vi < 5 else "SCHEDULED",
                )
                db.add(v)

    db.commit()
print(f"  ✓ {participants_created} participants + visits created")

# ─── ADVERSE EVENTS ────────────────────────────────────────────────────────────
ae_descriptions = [
    ("Nausea and vomiting", "MILD", "NON_SERIOUS", False),
    ("Elevated liver enzymes (ALT >3x ULN)", "SEVERE", "SERIOUS", True),
    ("Skin rash (Grade 2)", "MODERATE", "NON_SERIOUS", False),
    ("Diarrhea (Grade 1)", "MILD", "NON_SERIOUS", False),
    ("Severe abdominal pain requiring hospitalization", "SEVERE", "SERIOUS", True),
    ("Headache", "MILD", "NON_SERIOUS", False),
    ("Hypotension requiring IV fluids", "SEVERE", "SERIOUS", True),
    ("Mild dizziness", "MILD", "NON_SERIOUS", False),
    ("Anaphylactic reaction", "LIFE_THREATENING", "SERIOUS", True),
    ("Fatigue (Grade 2)", "MODERATE", "NON_SERIOUS", False),
    ("Peripheral edema", "MODERATE", "NON_SERIOUS", False),
    ("Cardiac arrhythmia", "SEVERE", "SERIOUS", True),
    ("Insomnia", "MILD", "NON_SERIOUS", False),
    ("Myalgia", "MODERATE", "NON_SERIOUS", False),
    ("Renal insufficiency requiring intervention", "SEVERE", "SERIOUS", True),
    ("Constipation (Grade 1)", "MILD", "NON_SERIOUS", False),
    ("Thrombocytopenia (Grade 3)", "SEVERE", "SERIOUS", True),
    ("Mild elevated blood pressure", "MILD", "NON_SERIOUS", False),
    ("Allergic dermatitis", "MODERATE", "NON_SERIOUS", False),
    ("Bronchospasm requiring emergency treatment", "LIFE_THREATENING", "SERIOUS", True),
]

ae_statuses = ["NEW", "UNDER_REVIEW", "CAUSALITY_ASSESSED", "SUBMITTED", "CLOSED"]
causalities = ["UNRELATED", "UNLIKELY", "POSSIBLE", "PROBABLE", "DEFINITE"]
outcomes = ["RESOLVED", "RESOLVING", "RESOLVED_WITH_SEQUELAE", "ONGOING", "FATAL"]

all_aes = []
if db.query(AdverseEvent).count() < 10:
    prev_hash = ""
    for i in range(500):
        desc, severity, seriousness, is_sae = random.choice(ae_descriptions)
        study = random.choice(active_studies[:15])
        participant = db.query(Participant).filter(Participant.study_id == study.id).first()
        onset = now - timedelta(days=random.randint(1, 300))
        deadline = onset + timedelta(days=7 if is_sae else 30)
        status_choices = ae_statuses if not is_sae else ["NEW", "UNDER_REVIEW", "CAUSALITY_ASSESSED", "SUBMITTED"]
        ae_status = random.choice(status_choices)

        ae_data = {
            "ae_code": f"AE-AIIA-{i+1:04d}",
            "severity": severity,
            "seriousness": seriousness,
            "status": ae_status,
        }
        h = compute_hash(ae_data, prev_hash)

        ae = AdverseEvent(
            ae_code=f"AE-AIIA-{i+1:04d}",
            participant_id=participant.id if participant else None,
            study_id=study.id,
            event_description=desc,
            severity=severity,
            seriousness=seriousness,
            is_sae=is_sae,
            causality=random.choice(causalities),
            outcome=random.choice(outcomes),
            onset_date=onset,
            reporting_deadline=deadline,
            status=ae_status,
            submitted_at=now - timedelta(days=random.randint(1, 10)) if ae_status == "SUBMITTED" else None,
            previous_hash=prev_hash,
            hash_value=h,
        )
        db.add(ae)
        db.flush()
        all_aes.append(ae)
        prev_hash = h

    db.commit()
print(f"  ✓ 500 adverse events created (includes SAEs)")

# ─── IEC APPROVALS ────────────────────────────────────────────────────────────
committees = ["Ethics Committee, AIIA New Delhi", "IEC, AIIA Jaipur", "Ethics Board, AIIA Pune", "IEC Central, AIIA Bhopal"]
if db.query(IECApproval).count() < 5:
    for study in studies[:40]:
        approval_date = study.start_date + timedelta(days=random.randint(-120, -30)) if study.start_date else now - timedelta(days=180)
        expiry = approval_date + timedelta(days=random.randint(365, 730))
        iec = IECApproval(
            study_id=study.id,
            approval_number=f"IEC/{study.study_code}/{approval_date.year}",
            approval_date=approval_date,
            expiry_date=expiry,
            status="APPROVED" if expiry > now else "EXPIRED",
            committee_name=random.choice(committees),
            amendment_number=random.randint(0, 3),
        )
        db.add(iec)
    db.commit()
print("  ✓ IEC approvals created")

# ─── CTRI RECORDS ─────────────────────────────────────────────────────────────
if db.query(CTRIRecord).count() < 5:
    for study in studies[:40]:
        reg_date = study.start_date + timedelta(days=random.randint(-90, 0)) if study.start_date else now - timedelta(days=200)
        ctri = CTRIRecord(
            study_id=study.id,
            registration_number=f"CTRI/2026/{str(study.id).zfill(7)}",
            registration_date=reg_date,
            next_update_due=now + timedelta(days=random.randint(-10, 120)),
            status="REGISTERED",
        )
        db.add(ctri)
    db.commit()
print("  ✓ CTRI records created")

# ─── MONITORING VISITS ────────────────────────────────────────────────────────
if db.query(MonitoringVisit).count() < 5:
    monitor_user = next((u for u in users if u.role == UserRole.MONITOR), None)
    for study in studies[:30]:
        for vtype in ["INITIATION", "ROUTINE", "ROUTINE"]:
            planned = now + timedelta(days=random.randint(-60, 90))
            actual = planned if planned < now and random.random() > 0.3 else None
            mv = MonitoringVisit(
                study_id=study.id,
                site_id=random.choice(sites).id,
                visit_type=vtype,
                planned_date=planned,
                actual_date=actual,
                status="COMPLETED" if actual else "PLANNED",
                monitor_id=monitor_user.id if monitor_user else None,
                findings="No critical findings" if actual else None,
            )
            db.add(mv)
    db.commit()
print("  ✓ Monitoring visits created")

# ─── ALERTS ───────────────────────────────────────────────────────────────────
alert_templates = [
    # (type, severity, title_fn, message_fn)
    ("RECRUITMENT", "WARNING", lambda s: f"Recruitment Lag – {s.study_code}",
     lambda s: f"Study {s.study_code} is {int((1-(s.current_enrollment/s.target_enrollment))*100) if s.target_enrollment else 0}% below enrollment target. Immediate site action required."),
    ("RECRUITMENT", "CRITICAL", lambda s: f"Critical Enrollment Gap – {s.study_code}",
     lambda s: f"Only {s.current_enrollment}/{s.target_enrollment} participants enrolled. Risk of study timeline breach."),
    ("SAFETY", "CRITICAL", lambda s: f"Overdue SAE Report – {s.study_code}",
     lambda s: f"SAE reporting deadline breached for {s.study_code}. Regulatory submission required immediately."),
    ("COMPLIANCE", "WARNING", lambda s: f"IEC Approval Expiring – {s.study_code}",
     lambda s: f"Ethics committee approval for {s.study_code} expires within 30 days. Initiate renewal process."),
    ("COMPLIANCE", "WARNING", lambda s: f"CTRI Update Due – {s.study_code}",
     lambda s: f"Annual CTRI update for {s.study_code} is due. Submit updated information to CTRI portal."),
    ("MONITORING", "WARNING", lambda s: f"Monitoring Visit Overdue – {s.study_code}",
     lambda s: f"Scheduled monitoring visit for {s.study_code} is overdue. Site visit required."),
    ("DATA_QUALITY", "WARNING", lambda s: f"Data Quality Issues – {s.study_code}",
     lambda s: f"Data quality score for {s.study_code} below threshold. {random.randint(5,20)} open queries pending resolution."),
]

if db.query(Alert).count() < 10:
    for study in random.sample(studies, min(30, len(studies))):
        n_alerts = random.randint(1, 3)
        for _ in range(n_alerts):
            tpl = random.choice(alert_templates)
            a = Alert(
                study_id=study.id,
                alert_type=tpl[0],
                severity=tpl[1],
                title=tpl[2](study),
                message=tpl[3](study),
                status="OPEN",
            )
            db.add(a)
    db.commit()
print("  ✓ Alerts created")

# ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
audit_actions = [
    ("STUDY", "APPROVE_PROTOCOL", "DRAFT", "APPROVED"),
    ("ADVERSE_EVENT", "UPDATE_STATUS", "NEW", "UNDER_REVIEW"),
    ("ADVERSE_EVENT", "UPDATE_STATUS", "UNDER_REVIEW", "SUBMITTED"),
    ("IEC_APPROVAL", "SUBMIT", "PENDING", "SUBMITTED"),
    ("IEC_APPROVAL", "APPROVE", "SUBMITTED", "APPROVED"),
    ("PARTICIPANT", "ENROLL", "SCREENED", "ENROLLED"),
    ("PARTICIPANT", "WITHDRAW", "ENROLLED", "WITHDRAWN"),
    ("STUDY", "LOCK_DATABASE", "DATA_CLEANING", "DATABASE_LOCK"),
    ("MONITORING_VISIT", "COMPLETE", "PLANNED", "COMPLETED"),
]

if db.query(AuditLog).count() < 10:
    prev_hash = ""
    for i, (entity_type, action, old_val, new_val) in enumerate(audit_actions * 15):
        user = random.choice(users)
        ts = now - timedelta(hours=random.randint(0, 720))
        study = random.choice(studies)
        log_data = {
            "user_id": user.id,
            "entity_type": entity_type,
            "entity_id": study.study_code,
            "action": action,
            "old_value": old_val,
            "new_value": new_val,
            "timestamp": ts.isoformat(),
        }
        h = compute_hash(log_data, prev_hash)
        al = AuditLog(
            user_id=user.id,
            user_name=user.name,
            entity_type=entity_type,
            entity_id=study.study_code,
            action=action,
            old_value=old_val,
            new_value=new_val,
            timestamp=ts,
            previous_hash=prev_hash,
            hash_value=h,
        )
        db.add(al)
        prev_hash = h
    db.commit()
print("  ✓ Audit log chain created")

print("\n✅ AIIA TrialSphere database seeded successfully!")
print("\n📋 Demo Credentials:")
print("   Admin:       admin@aiia.gov.in / Admin@123")
print("   PI:          pi1@aiia.gov.in / PI@1234")
print("   Coordinator: coord1@aiia.gov.in / Coord@123")
print("   Monitor:     monitor@aiia.gov.in / Monitor@123")
print("   PV Officer:  pv@aiia.gov.in / PV@1234")
print("   Management:  mgmt@aiia.gov.in / Mgmt@123")
print("\n🌐 API: http://localhost:8000/docs")
