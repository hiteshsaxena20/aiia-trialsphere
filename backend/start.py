"""
AIIA TrialSphere — Railway/Production Startup Script
Auto-seeds the database on first boot, then starts uvicorn.
"""
import os
import sys
import subprocess


def check_and_seed():
    """Seed only if SQLite DB is missing or empty."""
    db_path = "trialsphere.db"
    try:
        size = os.path.getsize(db_path) if os.path.exists(db_path) else 0
        if size < 10000:
            print("🌱 First boot — seeding synthetic data...")
            result = subprocess.run(
                [sys.executable, "seed.py"],
                check=True,
                timeout=300,
                capture_output=False
            )
            print("✓ Seed complete.")
        else:
            print(f"✓ DB already seeded ({size} bytes), skipping.")
    except Exception as e:
        print(f"⚠ Seed error (non-fatal): {e}")


if __name__ == "__main__":
    check_and_seed()

    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting AIIA TrialSphere on 0.0.0.0:{port}")

    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info",
    )
