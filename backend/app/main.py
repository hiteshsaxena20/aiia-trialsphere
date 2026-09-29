from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, dashboard, studies, safety, compliance, audit, alerts, participants, fhir

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIIA TrialSphere API",
    description="Integrated Clinical Trial Management & Pharmacovigilance Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(studies.router)
app.include_router(safety.router)
app.include_router(compliance.router)
app.include_router(audit.router)
app.include_router(alerts.router)
app.include_router(participants.router)
app.include_router(fhir.router)


@app.get("/")
async def root():
    return {
        "platform": "AIIA TrialSphere",
        "version": "1.0.0",
        "description": "Integrated Clinical Trial Management & Pharmacovigilance Platform",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "platform": "AIIA TrialSphere"}
