@echo off
echo ============================================
echo   AIIA TrialSphere - Starting Platform
echo ============================================
echo.
echo [1/2] Starting Backend API on http://localhost:8000
start "AIIA TrialSphere - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo.
echo [2/2] Starting Frontend on http://localhost:3000
timeout /t 3 /nobreak > nul
start "AIIA TrialSphere - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo ============================================
echo   Platform starting...
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Demo Login: admin@aiia.gov.in / Admin@123
echo ============================================
echo.
timeout /t 5 /nobreak > nul
start http://localhost:3000
