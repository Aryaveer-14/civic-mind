# Railway Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code pushed to GitHub (`Aryaveer-14/CivicMind`)
- [ ] Railway account created
- [ ] Google Gemini API key ready
- [ ] (Optional) Twilio credentials ready

## ✅ Railway Configuration

### 1. Create Project
- [ ] Log into Railway dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `Aryaveer-14/CivicMind`

### 2. Set Environment Variables

Go to your Railway project → **Variables** tab:

**Required:**
```
GEMINI_API_KEY = your_actual_gemini_key
NODE_ENV = production
```

**Optional (SMS):**
```
TWILIO_ACCOUNT_SID = your_twilio_sid
TWILIO_AUTH_TOKEN = your_twilio_token
TWILIO_PHONE_NUMBER = your_twilio_number
```

**Optional (Firestore):**
```
FIREBASE_SERVICE_ACCOUNT = {"type":"service_account",...}
```

### 3. Verify Deployment
- [ ] Check deployment logs (should see "✅ Civic backend running")
- [ ] Note your Railway URL (e.g., `https://civicmind-production.up.railway.app`)

### 4. Test Endpoints

**Root endpoint:**
```bash
curl https://your-app.railway.app/
# Should return: {"message":"Civic Backend API Running","status":"healthy"}
```

**Health check:**
```bash
curl https://your-app.railway.app/health
# Should return service status
```

**Analysis endpoint:**
```bash
curl -X POST https://your-app.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Broken street light at Main Street"}'
```

## ✅ Frontend Deployment

### Option 1: Netlify
- [ ] Go to netlify.com
- [ ] Import from GitHub
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Add environment variable: `VITE_API_URL=https://your-railway-url`

### Option 2: Vercel
- [ ] Go to vercel.com
- [ ] Import from GitHub
- [ ] Framework: Vite (auto-detected)
- [ ] Add environment variable: `VITE_API_URL=https://your-railway-url`

## ✅ Post-Deployment

- [ ] Test full user flow (register → create complaint → view dashboard)
- [ ] Check Railway logs for any errors
- [ ] Monitor first few requests
- [ ] (Optional) Set up custom domain
- [ ] (Optional) Enable Railway health checks

## 📊 Monitoring

**Railway Dashboard:**
- Deployments → View logs
- Metrics → CPU/Memory usage
- Settings → Set up alerts

**Key Metrics to Watch:**
- Response time
- Error rate
- Memory usage
- Request count

## 🔧 Troubleshooting

**App crashes immediately:**
- Check environment variables are set
- View logs for specific error
- Ensure GEMINI_API_KEY is valid

**CORS errors:**
- Already configured with `app.use(cors())`
- If issues persist, check frontend URL

**Data not persisting:**
- Using in-memory storage (expected without Firestore)
- To enable persistence: add FIREBASE_SERVICE_ACCOUNT

**SMS not working:**
- Check Twilio credentials
- App will log to console if Twilio disabled

## 💰 Cost Management

**Free Tier:**
- $5 credit/month
- Good for testing and low traffic

**Estimated Costs:**
- Low traffic: $5-10/month
- Medium traffic: $15-25/month
- High traffic: $30-50/month

**To reduce costs:**
- Use Railway's sleep mode for dev environments
- Optimize response sizes
- Use CDN for static assets (frontend on Netlify/Vercel)

## 📝 Next Steps

1. Monitor first 24 hours of deployment
2. Set up error tracking (optional: Sentry)
3. Configure custom domain
4. Set up backup/restore for Firestore
5. Implement rate limiting if needed
6. Add analytics

---

**Need help?** Check [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed guide.
