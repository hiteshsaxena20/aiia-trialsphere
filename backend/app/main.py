from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import Base, engine
from app.routers import auth, dashboard, studies, safety, compliance, audit, alerts, participants, fhir
import os
import subprocess
import sys


def auto_seed_if_empty():
    """Seed the DB on first boot in Railway (SQLite only)."""
    from sqlalchemy import inspect
    from app.database import engine as db_engine
    try:
        insp = inspect(db_engine)
        tables = insp.get_table_names()
        if "users" not in tables or db_engine.execute("SELECT COUNT(*) FROM users").scalar() == 0:
            print("🌱 Auto-seeding database...")
            seed_path = os.path.join(os.path.dirname(__file__), "..", "seed.py")
            subprocess.run([sys.executable, seed_path], check=True, timeout=300)
    except Exception as e:
        print(f"Seed check skipped: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown (nothing needed)


app = FastAPI(
    title="AIIA TrialSphere API",
    description="Integrated Clinical Trial Management & Pharmacovigilance Platform",
    version="1.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://aiia-trialsphere.vercel.app",
    "https://aiia-trialsphere-hitesh-5340.vercel.app",
    # Allow all vercel preview URLs for this project
    "https://*.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Open for demo; tighten in production
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
