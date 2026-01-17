@echo off
echo ========================================
echo Civic Complaint System - Startup Script
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Java is not installed or not in PATH
    echo.
    echo To enable Firestore Emulator, you need to:
    echo 1. Install Java from: https://www.oracle.com/java/technologies/downloads/
    echo 2. Add Java bin folder to Windows PATH
    echo 3. Restart this script
    echo.
    echo For now, the backend will use in-memory storage (data resets on restart)
    echo.
    echo Starting backend with in-memory database...
    timeout /t 3
    call npm run dev
    exit /b
)

echo ✅ Java detected
echo.
echo Choose what to start:
echo 1 = Start Firestore Emulator + Backend
echo 2 = Start Backend only (in-memory mode)
echo 3 = Start Frontend only
echo 4 = Start Everything (Firestore + Backend + Frontend - requires 2 terminals)
echo.
set /p choice="Enter choice (1-4): "

cd civic-backend

if "%choice%"=="1" (
    echo Starting Firestore Emulator and Backend...
    echo This will open in the same terminal
    call npx firebase emulators:start --only firestore --import .\.emulator-data --export-on-exit
) else if "%choice%"=="2" (
    echo Starting Backend (in-memory mode)...
    call npm start
) else if "%choice%"=="3" (
    cd ..
    echo Starting Frontend at http://localhost:5173
    call npm run dev
) else if "%choice%"=="4" (
    echo.
    echo ============================================================
    echo IMPORTANT: Data Persistence Instructions
    echo ============================================================
    echo When you want to stop the services:
    echo 1. Press Ctrl+C ONCE in the Firestore Emulator window
    echo 2. Wait for "Export complete" message
    echo 3. Then you can close all windows
    echo.
    echo This ensures your data is saved to .emulator-data folder
    echo ============================================================
    echo.
    pause
    echo.
    echo Starting Firestore Emulator in Terminal 1...
    start "Firestore Emulator" cmd /k "cd civic-backend && npx firebase emulators:start --only firestore --import .\.emulator-data --export-on-exit"
    timeout /t 5
    echo.
    echo Starting Backend in Terminal 2...
    start "Backend" cmd /k "cd civic-backend && npm start"
    timeout /t 3
    echo.
    echo Starting Frontend in Terminal 3...
    start "Frontend" cmd /k "npm run dev"
    echo.
    echo ✅ All services should be starting...
    echo Frontend: http://localhost:5173
    echo Backend: http://localhost:5000
    echo Firestore UI: http://localhost:4002
    echo.
    echo Remember: Ctrl+C ONCE in Firestore window to save data!
) else (
    echo Invalid choice
)
