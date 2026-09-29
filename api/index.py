"""
AIIA TrialSphere — Vercel Serverless Entry Point
Wraps the FastAPI app for Vercel Python runtime.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
from mangum import Mangum

# Vercel needs a ASGI handler
handler = Mangum(app, lifespan="off")
