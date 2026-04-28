@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ==========================================
echo DACP quick start
echo ==========================================

echo.
echo [1/3] Freeing backend port 4000 if needed...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') do (
  echo Stopping process on port 4000: PID %%p
  taskkill /PID %%p /F >nul 2>&1
)

echo.
echo [2/3] Starting backend...
start "DACP Backend" cmd /k "cd /d %~dp0 && npm run server"

echo.
echo [3/3] Starting frontend...
start "DACP Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Started.
echo - Backend:  http://localhost:4000
echo - Frontend: http://localhost:5173
echo.
echo You can close this window.

endlocal
