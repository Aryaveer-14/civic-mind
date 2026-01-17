@echo off
echo.
echo ========================================
echo   STOPPING FIRESTORE EMULATOR
echo ========================================
echo.
echo This will gracefully stop the emulator and export your data.
echo.
pause

echo Sending shutdown signal to emulator...
echo.

REM Find the emulator process on port 8082
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8082" ^| findstr "LISTENING"') do (
    echo Found emulator process: %%a
    echo Sending Ctrl+C signal...
    taskkill /PID %%a /FI "WINDOWTITLE eq Firestore Emulator*"
    echo.
    echo Waiting for export to complete...
    timeout /t 8
    echo.
    echo Checking export...
    if exist ".emulator-data\firestore_export" (
        echo ✅ Export successful! Data saved to .emulator-data
        dir /s .emulator-data
    ) else (
        echo ⚠️  Export may not have completed. Check emulator window for messages.
    )
)

echo.
pause
