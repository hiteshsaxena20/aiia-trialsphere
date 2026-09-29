# AIIA TrialSphere 🏥⚗

> **Integrated Clinical Trial Management & Pharmacovigilance Platform**  
> Built for AIIA (All India Institute of Ayurveda) — SIH 2026 Submission

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TEAM-INFEROUS/aiia-trialsphere)

---

## 🎯 What Problem Does It Solve?

AIIA manages clinical trials across multiple sites, ethics committees, CTRI, and pharmacovigilance systems — all siloed. Leadership cannot easily answer:

- How are all our clinical trials performing right now?
- Which site has poor recruitment?
- Which SAE needs reporting today?
- Which ethics approval is about to expire?

**AIIA TrialSphere** consolidates everything into one platform.

---

## 🚀 Live Demo

| | URL |
|--|--|
| **Frontend** | https://aiia-trialsphere.vercel.app |
| **API Docs** | https://aiia-trialsphere.vercel.app/api/docs |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aiia.gov.in | Admin@123 |
| PI | pi1@aiia.gov.in | PI@1234 |
| Coordinator | coord1@aiia.gov.in | Coord@123 |
| PV Officer | pv@aiia.gov.in | PV@1234 |
| Management | mgmt@aiia.gov.in | Mgmt@123 |

---

## 🏗️ Architecture

```
                  ┌──────────────────────────┐
                  │   React + TypeScript     │
                  │   (Vite, Recharts)       │
                  └────────────┬─────────────┘
                               │  HTTPS / REST
                  ┌────────────▼─────────────┐
                  │   FastAPI + SQLAlchemy   │
                  │   JWT Auth + RBAC        │
                  └────────────┬─────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         Study Engine    Safety Engine    Compliance
         Enrollment      AE/SAE/PV        IEC/CTRI
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                      Data Quality Engine
                               ▼
                       Risk/Alert Engine
                               ▼
                    SHA-256 Audit Ledger
                    (Tamper Detection)
```

---

## 📦 Modules

| # | Module | Features |
|---|--------|----------|
| 1 | **Clinical Trial Management** | Study lifecycle (12 stages), enrollment tracking, risk scoring |
| 2 | **Site Management** | Multi-site dashboard, recruitment lag detection |
| 3 | **Participant Registry** | De-identified participant tracking, visit schedules |
| 4 | **Pharmacovigilance** | AE/SAE workflow, causality, regulatory deadlines |
| 5 | **Compliance & Ethics** | IEC approvals, CTRI registration, monitoring visits |
| 6 | **Executive Dashboard** | Real-time KPIs, enrollment charts, risk distribution |
| 7 | **Audit Ledger** | SHA-256 hash chain, tamper detection, electronic signatures |
| 8 | **Interoperability** | FHIR R4 export/import, CDISC SDTM/ADaM export |

---

## 🔐 Security Features

- JWT authentication (RS256)
- Role-Based Access Control (8 roles: Admin, PI, Coordinator, Monitor, Ethics, PV, Management, Regulator)
- SHA-256 hash chain audit trail — tamper-evident
- Password hashing (sha256_crypt)
- CORS protection

---

## 🔗 FHIR R4 Interoperability

Supported FHIR resource types:
- `ResearchStudy` — exports clinical studies
- `AdverseEvent` — exports AE/SAE records
- `Patient` — de-identified participant demographics
- `ResearchSubject` — enrollment records
- `Observation` — clinical measurements

---

## 📊 Synthetic Dataset

- 50 Ayurvedic intervention studies
- 20 sites across India (Delhi, Jaipur, Bhopal, Pune, Chennai...)
- 1,174 de-identified participants
- 500 adverse events (including SAEs)
- Full audit log with hash chain

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom dark design system) |
| Backend | Python 3.10 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + passlib |
| Database | SQLite (local) / PostgreSQL (production) |
| Deployment | Vercel (frontend + serverless API) |

---

## 🏃 Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+

### Quick Start

```bash
# Clone
git clone https://github.com/TEAM-INFEROUS/aiia-trialsphere
cd aiia-trialsphere

# Backend
cd backend
pip install -r ../requirements.txt
python seed.py
python -m uvicorn app.main:app --port 8000 --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Or double-click **`start.bat`** on Windows.

### URLs
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

---

## 📁 Project Structure

```
aiia-trialsphere/
├── frontend/              # React + TypeScript
│   └── src/
│       ├── pages/         # 9 page components
│       ├── api.ts         # Axios client
│       ├── AuthContext    # JWT auth state
│       ├── Sidebar        # Navigation
│       └── index.css      # Design system
├── backend/               # FastAPI
│   └── app/
│       ├── main.py        # App entry
│       ├── auth.py        # JWT + RBAC
│       ├── models/        # ORM models (15 tables)
│       ├── routers/       # 9 API routers
│       └── utils.py       # Hash chain + risk scoring
├── api/
│   └── index.py           # Vercel serverless handler
├── vercel.json            # Vercel deployment config
├── requirements.txt       # Python dependencies
└── start.bat              # Windows one-click launcher
```

---

## 🎬 Key Demo Scenarios

### 1. Tamper Detection (Audit Ledger)
1. Go to **Audit Ledger** tab
2. Click **"Simulate Tampering"**
3. Click **"Verify Chain"**
4. → Red banner: `INTEGRITY VIOLATION DETECTED`

### 2. Recruitment Risk Alert
- Study Portfolio → Red bars for lagging studies
- Click study → See per-site breakdown with ⚠ warnings

### 3. SAE Workflow
- Pharmacovigilance → Change AE status via dropdown
- Every transition creates a hash-chained audit entry

### 4. FHIR Export
- Interoperability → Load Bundle → All 50 studies as FHIR R4 JSON

---

## 📄 License

MIT — Built by Team Inferous for SIH 2026

---

*AIIA TrialSphere is a prototype system using 100% synthetic data. No real patient data is stored or processed.*
