"""
AIIA TrialSphere — Railway Startup Script
Auto-seeds the database on first boot if empty.
"""
import os
import sys
import subprocess

def check_and_seed():
    """Run seed.py only if the database is empty (first boot)."""
    db_path = "trialsphere.db"
    
    # Check if DB file exists and has data
    if os.path.exists(db_path) and os.path.getsize(db_path) > 10000:
        print("✓ Database already seeded, skipping seed.")
        return
    
    print("🌱 First boot detected — seeding database with synthetic data...")
    try:
        subprocess.run([sys.executable, "seed.py"], check=True, timeout=300)
        print("✓ Database seeded successfully!")
    except Exception as e:
        print(f"⚠ Seed failed: {e}. Starting anyway...")

if __name__ == "__main__":
    # Seed if needed
    check_and_seed()
    
    # Start the FastAPI server
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting AIIA TrialSphere API on port {port}...")
    
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1,
    )
