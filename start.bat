@echo off
echo Starting Splitwise Receipt API System...
echo.

echo Starting Backend (FastAPI)...
start "Backend" cmd /k "cd /d backend && fastapi-env\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend (Next.js)...
start "Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both services are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press any key to continue...
pause > nul