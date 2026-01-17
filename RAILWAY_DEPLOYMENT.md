# Railway Deployment Guide for CivicMind

## Prerequisites
- GitHub account with your repository: `Aryaveer-14/CivicMind`
- Railway account (sign up at [railway.app](https://railway.app))
- Google API key for Gemini
- (Optional) Twilio credentials for SMS

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```powershell
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Create Railway Project

### Option A: Via Railway Dashboard (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select repository: **Aryaveer-14/CivicMind**
6. Railway will automatically detect your configuration

### Option B: Via Railway CLI
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub
railway link

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway Dashboard, go to your project → **Variables** tab and add:

### Required Variables

```env
# Google Gemini API (Required for analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Port (Railway provides this automatically)
PORT=3000

# Node Environment
NODE_ENV=production
```

### Optional Variables (SMS functionality)

```env
# Twilio (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Firebase Configuration (if using production Firestore)

If you want to use production Firestore instead of emulator:

1. Download your Firebase service account JSON from Firebase Console
2. Copy the entire JSON content
3. In Railway, add variable `FIREBASE_SERVICE_ACCOUNT` with the JSON as value

**OR** set individual fields:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## Step 4: Update Backend for Production

Your backend is already configured to handle production deployment. The key features:

- ✅ Uses `process.env.PORT` (Railway auto-assigns this)
- ✅ Falls back to in-memory storage if Firestore unavailable
- ✅ Gracefully handles missing Twilio credentials
- ✅ CORS enabled for frontend connections

## Step 5: Deploy Frontend

Since Railway is best for backend APIs, deploy your frontend separately:

### Option 1: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Import your GitHub repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variable: `VITE_API_URL=https://your-railway-app.railway.app`

### Option 2: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Framework: Vite
4. Environment variable: `VITE_API_URL=https://your-railway-app.railway.app`

## Step 6: Connect Frontend to Backend

After deployment, you'll get a Railway URL like:
`https://civicmind-production.up.railway.app`

Update your frontend API calls to use this URL:

In [src/api.js](src/api.js), update:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-railway-app.railway.app';
```

Then redeploy frontend with environment variable:
```env
VITE_API_URL=https://your-railway-app.railway.app
```

## Step 7: Verify Deployment

### Test Backend
Visit your Railway URL in browser:
```
https://your-railway-app.railway.app/
```

Should return: `{"message": "Civic Backend API Running"}`

### Test Analysis Endpoint
```powershell
curl -X POST https://your-railway-app.railway.app/analyze `
  -H "Content-Type: application/json" `
  -d '{"text": "Broken street light at Main Street"}'
```

## Monitoring & Logs

### View Logs
In Railway dashboard:
- Click on your project
- Go to **Deployments** tab
- Click on active deployment
- View logs in real-time

### Health Check
Railway automatically monitors your app and restarts on failure (configured in railway.json)

## Troubleshooting

### Port Issues
Railway automatically sets `PORT` environment variable. Your app uses:
```javascript
const PORT = process.env.PORT || 5000;
```
This should work automatically.

### CORS Errors
If frontend can't connect, ensure CORS is enabled (already done):
```javascript
app.use(cors());
```

### Environment Variables Not Loading
- Check Railway dashboard Variables tab
- Ensure no typos in variable names
- Redeploy after adding variables

### Firestore Connection
Without production Firestore, app uses in-memory storage (data is lost on restart).
To persist data, set up Firebase production or use Railway PostgreSQL.

## Cost Estimate

Railway pricing:
- **Free tier**: $5 credit/month (good for testing)
- **Pro plan**: $20/month (production apps)
- Pay for actual usage (CPU/RAM/Network)

Expected usage for CivicMind:
- Small to medium traffic: $5-15/month
- High traffic: $20-50/month

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Netlify/Vercel
3. ✅ Configure environment variables
4. ✅ Test all endpoints
5. Consider setting up production Firestore
6. Set up custom domain (optional)
7. Enable monitoring/alerts

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: Create issues in GitHub repo

---

**Your Railway configuration is ready! Just connect to GitHub and deploy.** 🚀
