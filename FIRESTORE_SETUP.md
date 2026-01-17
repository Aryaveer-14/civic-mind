# Civic System - Setup Guide for Firestore

## Current Status
✅ Backend is running and ready to accept complaints  
⚠️ Java is NOT installed (required for Firestore Emulator)  
💾 Backend is using **in-memory storage** (data resets on server restart)

## Option 1: Use In-Memory Storage (No Setup Required) ✅
The backend is already configured to work without Firestore. It will store complaints in memory.

**Pros:**
- No additional setup needed
- Works immediately

**Cons:**
- Data is lost when server restarts
- No persistence

**To use this:**
1. Backend is already running on `http://localhost:5000`
2. Start frontend: `npm run dev`
3. Open `http://localhost:5173` and submit complaints

---

## Option 2: Install Java + Firestore Emulator (Recommended for Production)

### Step 1: Install Java
1. Download Java JDK from: https://www.oracle.com/java/technologies/downloads/
2. Choose "Java SE 21" (LTS version)
3. Install to default location
4. Restart your terminal/PowerShell

### Step 2: Verify Java Installation
```powershell
java -version
```
Should show: `java version "XX.XX.XX"`

### Step 3: Start Firestore Emulator
```powershell
cd C:\Users\aryav\Desktop\civic-frontend\civic-backend
npx firebase emulators:start --only firestore
```

This will start:
- **Firestore Emulator** on `localhost:8082`
- **Firestore UI** on `http://localhost:4000` (view your data in browser)

### Step 4: Start Backend (in new terminal)
```powershell
cd C:\Users\aryav\Desktop\civic-frontend\civic-backend
npm start
```

### Step 5: Start Frontend (in new terminal)
```powershell
cd C:\Users\aryav\Desktop\civic-frontend
npm run dev
```

---

## Running All Services

### Using Batch File (Windows)
```powershell
.\START_ALL.bat
```
This will guide you through starting services.

### Manual Method (3 Terminals Required)

**Terminal 1 - Firestore Emulator:**
```powershell
cd C:\Users\aryav\Desktop\civic-frontend\civic-backend
npx firebase emulators:start --only firestore
```

**Terminal 2 - Backend:**
```powershell
cd C:\Users\aryav\Desktop\civic-frontend\civic-backend
npm start
```

**Terminal 3 - Frontend:**
```powershell
cd C:\Users\aryav\Desktop\civic-frontend
npm run dev
```

---

## Service Endpoints

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Ready |
| Backend API | http://localhost:5000 | ✅ Running |
| Firestore Emulator | localhost:8082 | ⏳ Optional |
| Firestore UI | http://localhost:4000 | ⏳ Optional |

---

## Testing Without Firestore
Even without Firestore, you can:
1. Submit complaints with text and/or photos
2. Get AI analysis from Gemini
3. Submit feedback
4. View statistics (for current session only)

All data is stored in server memory until it restarts.

---

## Troubleshooting

### Error: "Could not spawn java"
- Java is not installed or not in PATH
- Solution: Install Java and restart PowerShell

### Error: "Firebase config not found"
- This is just a warning, emulator will still start

### Complaints not saving
- Check backend terminal for error messages
- Ensure backend is running on port 5000
- Check frontend console (F12) for API errors

### Firestore Emulator won't start
- Make sure Java is properly installed
- Try: `npx firebase --version` (should work)
- Check firewall isn't blocking port 8082
