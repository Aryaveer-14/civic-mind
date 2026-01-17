# 🚀 How to Use CivicMind

## ✅ Quick Start

### Step 1: Start the Backend Server
Double-click this file:
```
civic-backend/start-server.bat
```
Or run in terminal:
```bash
cd civic-backend
node index.js
```

### Step 2: Access the Application
Open your browser and go to:

**Authentication (Register/Login):**
- **http://127.0.0.1:5000/auth.html** ⭐ (Start here to create an account!)

**Main Application:**
- **http://127.0.0.1:5000/working.html** (Report complaints)

**Dashboard:**
- **http://127.0.0.1:5000/dashboard.html** (View your complaints)

Alternative pages:
- http://127.0.0.1:5000/index.html

## 📋 Important URLs

- **Backend API:** http://127.0.0.1:5000/
- **Auth Page (Register/Login):** http://127.0.0.1:5000/auth.html
- **Working Page (Report Issues):** http://127.0.0.1:5000/working.html
- **Dashboard (Your Complaints):** http://127.0.0.1:5000/dashboard.html
- **API Endpoints:**
  - Register: http://127.0.0.1:5000/register
  - Login: http://127.0.0.1:5000/login
  - Analyze: http://127.0.0.1:5000/analyze
  - Stats: http://127.0.0.1:5000/stats

## 🔧 Troubleshooting

### "Server Disconnected" Error?
1. Make sure the backend server is running (check if the command window is open)
2. **Access via http://127.0.0.1:5000/working.html** (NOT as a file:// URL)
3. Check backend is responding: http://127.0.0.1:5000/

### Port Already in Use?
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### Backend Not Starting?
1. Install dependencies:
   ```bash
   cd civic-backend
   npm install
   ```
2. Restart the server using start-server.bat

## ⚙️ Current Configuration

- **Mode:** In-memory database (data resets on restart)
- **AI:** Fallback analysis (Gemini API key not configured)
- **SMS:** Console logging (Twilio not configured)
- **Database:** No persistence (Firestore not configured)

## 📝 To Enable Advanced Features

### 1. Gemini AI Analysis
Add to `civic-backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### 2. SMS Notifications
Add to `civic-backend/.env`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 3. Firebase/Firestore Database
Add to `civic-backend/.env`:
```
FIREBASE_SERVICE_ACCOUNT={"your":"service_account_json"}
```

---

## 🎯 Quick Access Links:
- **Auth:** http://127.0.0.1:5000/auth.html (Register/Login first!)
- **Report Issue:** http://127.0.0.1:5000/working.html
- **Dashboard:** http://127.0.0.1:5000/dashboard.html
