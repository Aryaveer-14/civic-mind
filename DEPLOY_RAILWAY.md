# 🚀 Deploy CivicMind to Railway (Quick Guide)

## Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

## Step 2: Deploy on Railway

### Method 1: Railway Dashboard (Easiest) ⭐

1. Go to **https://railway.app** and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: **Aryaveer-14/civic-mind**
5. Railway will auto-detect your configuration and start deploying!

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## Step 3: Add Environment Variables

After deployment, go to your project in Railway:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:

### Required:
```
GEMINI_API_KEY = your_gemini_api_key_here
NODE_ENV = production
```

### Optional (for SMS):
```
TWILIO_ACCOUNT_SID = your_account_sid
TWILIO_AUTH_TOKEN = your_auth_token
TWILIO_PHONE_NUMBER = your_phone_number
```

### Optional (for Firestore):
```
FIREBASE_SERVICE_ACCOUNT = {"your": "service_account_json"}
```

## Step 4: Get Your Deployment URL

After deployment completes:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Settings"** tab
4. Scroll down to **"Networking"** or **"Domains"** section
5. You'll see your app URL like: **`https://your-app-name.up.railway.app`**

### Alternative: Generate Public Domain

If you don't see a domain:
1. In **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Railway will create a public URL for you
4. Copy this URL - this is your backend API URL!

## Step 5: Update Frontend URLs

Once you have your Railway URL (e.g., `https://civic-mind-production.up.railway.app`):

### Update these files with your Railway URL:

**In auth.html, working.html, dashboard.html:**

Find lines with:
```javascript
const backendHost = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") ? window.location.hostname : "localhost";
const API_BASE = `http://${backendHost}:5000`;
```

Replace with:
```javascript
const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://your-railway-url.up.railway.app";
```

OR better yet, serve your frontend from the same Railway backend!

## Step 6: Access Your Deployed App

Your app will be live at: **`https://your-app-name.up.railway.app`**

Test endpoints:
- **Backend Status:** `https://your-app-name.up.railway.app/`
- **Health Check:** `https://your-app-name.up.railway.app/health`
- **Auth Page:** `https://your-app-name.up.railway.app/auth.html`
- **Working Page:** `https://your-app-name.up.railway.app/working.html`

## 📝 Important Notes

### Free Tier Limits:
- Railway offers $5 free credits per month
- Your app will sleep after inactivity (first request may be slow)
- Database is in-memory by default (resets on restart)

### To Enable Persistence:
1. Add Firestore configuration (see Step 3)
2. Or add a Railway PostgreSQL database
3. Update code to use persistent storage

### To Find Your URL Anytime:
1. Go to **railway.app/dashboard**
2. Click your project
3. Click your service
4. Look for the domain in **Settings → Networking**
5. Copy the URL that looks like: `https://xxxxx.up.railway.app`

## 🔧 Troubleshooting

### Can't find the URL?
- Go to project Settings → Networking → Click "Generate Domain"

### App not working?
- Check Deployments tab for build errors
- Check Variables tab - ensure GEMINI_API_KEY is set
- View logs in the Deployments section

### Database not persisting?
- You're using in-memory storage (restarts will clear data)
- Add FIREBASE_SERVICE_ACCOUNT to use Firestore

## 🎉 That's It!

Your CivicMind app is now deployed and accessible worldwide at your Railway URL!

**Next Steps:**
1. Copy your Railway URL
2. Share it with users
3. Monitor usage in Railway dashboard
4. Add custom domain (optional, in Settings → Networking)
