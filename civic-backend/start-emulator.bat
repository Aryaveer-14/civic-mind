@echo off
echo ========================================
echo Starting Firestore Emulator with Data Persistence
echo ========================================
echo.
echo IMPORTANT: To save data, press Ctrl+C ONCE when stopping.
echo Wait for "Export complete" message before closing.
echo.
echo Data will be saved to: .emulator-data
echo.
pause
npx firebase emulators:start --only firestore --import ./.emulator-data --export-on-exit
