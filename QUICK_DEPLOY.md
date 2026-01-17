# 🚀 Quick Deploy to Railway

## 5-Minute Setup

### Step 1: Push to GitHub (if not already)
```powershell
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway
1. Go to **[railway.app](https://railway.app)** (sign in with GitHub)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: **Aryaveer-14/CivicMind**
5. Wait for build to complete (~2 minutes)

### Step 3: Add Environment Variables
In Railway dashboard, click your project → **Variables** tab → Add:

```
GEMINI_API_KEY = your_gemini_api_key_here
NODE_ENV = production
```

Click **Deploy** to restart with new variables.

### Step 4: Get Your URL
- Copy your Railway URL (looks like: `civicmind-production-abc123.up.railway.app`)
- Test it: Open in browser → Should see `{"message":"Civic Backend API Running"}`

### Step 5: Deploy Frontend
**Netlify (Recommended):**
1. Go to [netlify.com](https://netlify.com)
2. Import your GitHub repo
3. Settings:
   - Build: `npm run build`
   - Directory: `dist`
   - Variable: `VITE_API_URL` = `https://your-railway-url`

**Done!** 🎉

---

## Your App URLs
- **Backend (Railway)**: `https://your-railway-url`
- **Frontend (Netlify)**: `https://your-app.netlify.app`

## Test It
```powershell
# Test backend
curl https://your-railway-url/health

# Test analysis
curl -X POST https://your-railway-url/analyze `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"Test complaint\"}'
```

## Troubleshooting
- **500 Error**: Check GEMINI_API_KEY is set in Railway Variables
- **CORS Error**: Update frontend VITE_API_URL to match Railway URL
- **App Sleeping**: Railway free tier sleeps after inactivity (wakes on request)

## Full Documentation
- **Detailed Guide**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**Questions?** Check Railway logs in dashboard or create GitHub issue.
