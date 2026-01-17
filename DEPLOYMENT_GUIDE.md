# CivicMind AI - Deployment Guide (Render)

This guide walks you through deploying CivicMind AI (frontend + backend) on Render.

---

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Firebase Service Account**: Download from Firebase Console → Project Settings → Service Accounts
4. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Deployment Steps

### Part 1: Deploy Backend on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Create New Web Service**:
   - Click "New +" → Select **"Web Service"**
3. **Connect Repository**:
   - Click "Connect GitHub"
   - Select your repository: `civicmind-ai`
4. **Configure Service**:
   - **Name**: `civicmind-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `master`
   - **Root Directory**: `civic-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |
   | `FIREBASE_SERVICE_ACCOUNT` | See below ⬇️ |

   **FIREBASE_SERVICE_ACCOUNT value**:
   - Get your service account JSON file from Firebase Console
   - Open it and copy the ENTIRE content
   - Paste it as ONE LINE (minified JSON)
   - Example format: `{"type":"service_account","project_id":"your-project",...}`

6. **Click "Create Web Service"**
7. **Wait for deployment** (5-10 minutes)
8. **Copy your backend URL**: e.g., `https://civicmind-backend.onrender.com`

---

### Part 2: Configure Frontend

#### Option A: Deploy as Static Site on Render

1. **Update API Endpoint in Code**:
   
   Edit `working.html` (around line 20):
   ```javascript
   window.CONFIG = {
     API_URL: 'https://civicmind-backend.onrender.com' // Replace with your backend URL
   };
   ```

2. **Build Frontend**:
   ```bash
   npm run build
   ```

3. **Deploy to Render**:
   - Go to Render Dashboard
   - Click "New +" → Select **"Static Site"**
   - Connect Repository:
     - Select your repository: `civicmind-ai`
   - Configure Service:
     - **Name**: `civicmind-frontend`
     - **Region**: Oregon (US West)
     - **Branch**: `master`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   
   - Add Environment Variables (if needed):
     | Key | Value |
     |-----|-------|
     | `VITE_API_URL` | Your backend URL (e.g., `https://civicmind-backend.onrender.com`) |

   - Click "Create Static Site"

#### Option B: Serve Frontend from Backend (Simpler!)

The backend is already configured to serve static files. Just make sure:

1. Your HTML files (`working.html`, `auth.html`, `dashboard.html`) use the correct API endpoint
2. Access your app via: `https://civicmind-backend.onrender.com/working.html`

---

## ✅ Verification

After deployment, you'll have:
- **Backend API**: `https://civicmind-backend.onrender.com`
- **Frontend App**: `https://civicmind-frontend.onrender.com` (if using Option A)
  OR access via backend: `https://civicmind-backend.onrender.com/working.html` (if using Option B)

Test your deployment:
1. Visit the frontend URL
2. Try registering a new user
3. Submit a complaint
4. Check dashboard

---

## 🔧 Troubleshooting

### Issue: "Application failed to respond"
- Check Render logs: Dashboard → Your Service → Logs
- Ensure `start` script in package.json is correct: `node index.js`
- Verify environment variables are set

### Issue: "Firestore connection failed"
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly (must be valid JSON)
- Check Firebase project permissions

### Issue: "Gemini API error"
- Verify `GEMINI_API_KEY` is valid
- Check API quota in Google Cloud Console

### Issue: "CORS errors"
- Ensure backend has CORS enabled (already configured in index.js)
- Check frontend API_URL is correct

---

## 📝 Notes

- **Free Tier**: Render free tier may sleep after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.
- **Logs**: Monitor logs in Render Dashboard → Your Service → Logs
- **Updates**: Push to GitHub → Render auto-deploys changes

---

## 🎯 Next Steps

1. Get Gemini API key (required for AI analysis)
2. Deploy backend on Render
3. Configure frontend API endpoint
4. Test registration and complaint submission

**Questions?** Check Render docs: https://render.com/docs
