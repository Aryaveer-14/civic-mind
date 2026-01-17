# Civic Complaint System - Setup & Running Guide

## Project Structure
```
civic-frontend/
├── civic-backend/          # Express backend on port 5000
│   ├── index.js
│   ├── package.json
│   ├── .env                # Contains GEMINI_API_KEY
│   └── uploads/            # For file uploads
├── src/                    # React frontend (Vite) on port 5173
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
└── ...
```

## Prerequisites
- Node.js (v16+)
- npm or yarn
- GEMINI_API_KEY (already configured in `civic-backend/.env`)

## Installation

### 1. Install Frontend Dependencies
```bash
cd c:\Users\aryav\Desktop\civic-frontend
npm install
```

### 2. Install Backend Dependencies
```bash
cd civic-backend
npm install
```

## Running the Application

### Option 1: Run Both Together (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd c:\Users\aryav\Desktop\civic-frontend\civic-backend
npm start
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd c:\Users\aryav\Desktop\civic-frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Option 2: Run Backend with Firebase Emulator
If you want to test with local Firestore:
```bash
cd civic-backend
npm run emulator
```

## API Endpoints (Backend on port 5000)

- **POST** `/analyze` - Submit complaint with text/image
  - Frontend sends to: `http://localhost:5000/analyze`
  
- **POST** `/feedback` - Submit feedback on results
  - Frontend sends to: `http://localhost:5000/feedback`
  
- **GET** `/stats` - Get complaint statistics
  - Frontend fetches from: `http://localhost:5000/stats`

## Configuration

### Frontend Configuration
- **API Base URL**: `http://localhost:5000` (hardcoded in App.jsx)
- **Dev Server**: `http://localhost:5173` (via Vite)

### Backend Configuration
- **Port**: 5000
- **CORS**: Enabled for all origins
- **Firestore Emulator**: localhost:8082 (if using emulator)
- **Gemini API Key**: Loaded from `civic-backend/.env`

## Troubleshooting

### "Backend not reachable" error
- Ensure backend is running on port 5000
- Check that `npm start` is running in the civic-backend folder
- Verify CORS is enabled (it is by default)

### Image upload not working
- Ensure `civic-backend/uploads/` folder exists
- Check file size is under 10MB limit

### Gemini API errors
- Verify GEMINI_API_KEY is set in `civic-backend/.env`
- Check you have API quota remaining

## Development Notes
- Frontend: Vite + React, hot reload enabled
- Backend: Express with CORS, Firestore (emulator or real)
- AI: Google Gemini Pro for complaint analysis
- File uploads: Multer middleware handles image/document uploads
