# Firestore Emulator Data Persistence Guide

## Current Situation
- Emulator is running with `--export-on-exit` flag
- Data is stored in memory while running
- Export happens ONLY on graceful shutdown

## How to Save Your Data (IMPORTANT!)

### When Stopping Services:

1. **Go to the Firestore Emulator window** (the PowerShell window that says "Firestore Emulator")

2. **Press Ctrl+C ONCE** (not multiple times!)

3. **Wait for these messages:**
   ```
   i  Automatically exporting data using --export-on-exit "./.emulator-data"
   i  Exporting data to: C:\Users\aryav\Desktop\civic-frontend\civic-backend\.emulator-data
   ✔  Export complete
   ```

4. **Only then close the window**

### Next Time You Start:
- Your data will be automatically imported from `.emulator-data`
- You'll see: `i  firestore: Importing data from ...`
- All users, complaints, suggestions will be restored

## Verify Data is Saved

Check if export worked:
```powershell
Get-ChildItem C:\Users\aryav\Desktop\civic-frontend\civic-backend\.emulator-data -Recurse
```

You should see files like:
- `firestore_export.overall_export_metadata`
- Folders with your collection data

## Test User Available Now

If you restart before saving, use this test account:
- Email: `test@civic.com`
- Name: Test User
- Locality: Sector 21

## Troubleshooting

### Data not importing?
- Make sure `.emulator-data/firestore_export` folder exists
- Check for `firestore_export.overall_export_metadata` file

### Emulator won't start?
- Port 8082 might be in use
- Kill process: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8082).OwningProcess | Stop-Process -Force`

### Want to reset data?
```powershell
Remove-Item C:\Users\aryav\Desktop\civic-frontend\civic-backend\.emulator-data\* -Recurse -Force
```
