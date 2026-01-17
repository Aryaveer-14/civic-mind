# 🚀 Deploy to Railway in 5 Minutes

## 📋 Pre-Deployment Checklist

✅ Code is committed to GitHub  
✅ Have a Railway account (sign up at railway.app)  
✅ Have your Gemini API key ready  

---

## 🎯 Deployment Steps

### 1️⃣ Push to GitHub (if not done)

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### 2️⃣ Deploy on Railway

**Go to: https://railway.app**

1. Click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select **"Aryaveer-14/civic-mind"**
4. Wait for deployment (2-3 minutes)

### 3️⃣ Add Environment Variables

Click your service → **"Variables"** tab → Add:

```
GEMINI_API_KEY = your_api_key_here
NODE_ENV = production
```

(Optional for SMS: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)

### 4️⃣ Get Your URL

**In Railway Dashboard:**
- Click your service
- Go to **"Settings"** tab
- Find **"Networking"** or **"Domains"** section
- If no domain shown, click **"Generate Domain"**
- Copy your URL: `https://xxxxx.up.railway.app`

### 5️⃣ Access Your App

Your app is live at: **`https://xxxxx.up.railway.app`**

Test it:
- `https://xxxxx.up.railway.app/` - Backend status
- `https://xxxxx.up.railway.app/health` - Health check
- `https://xxxxx.up.railway.app/auth.html` - Register/Login
- `https://xxxxx.up.railway.app/working.html` - Report issues

---

## 🎉 You're Done!

**Your CivicMind app is now live and accessible worldwide!**

### How to Find Your URL Later:
1. Go to **railway.app/dashboard**
2. Click your project name
3. Click your service
4. Look in **Settings → Networking** for your domain

### Your Deployment URL Format:
```
https://civic-mind-production.up.railway.app
```
or
```
https://[random-name].up.railway.app
```

**Save this URL - it's your live app link!** 🌐

---

## 📱 Share Your App

Once deployed, you can share these links:

- **Auth:** `https://your-url.up.railway.app/auth.html`
- **Report Issues:** `https://your-url.up.railway.app/working.html`
- **Dashboard:** `https://your-url.up.railway.app/dashboard.html`

---

## ⚠️ Important Notes

- **Free Tier:** $5/month in credits
- **Sleep Mode:** App sleeps after 15min inactivity (first load may be slow)
- **Data:** Using in-memory storage (add Firestore for persistence)
- **Logs:** View in Railway Dashboard → Deployments → View Logs

---

## 🔧 If Something Goes Wrong

### Can't Find URL?
→ Settings → Networking → "Generate Domain"

### Deployment Failed?
→ Check Deployments tab for error logs
→ Ensure GEMINI_API_KEY is set in Variables

### App Not Loading?
→ Check logs in Deployments section
→ Verify the domain is generated

---

## 🎯 Quick Reference

| Action | Location |
|--------|----------|
| View URL | Settings → Networking |
| Add Variables | Variables Tab |
| Check Logs | Deployments → View Logs |
| Redeploy | Deployments → Deploy Latest |

**Railway Dashboard:** https://railway.app/dashboard

---

## ✨ Optional: Custom Domain

Want a custom domain like `civicmind.com`?

1. Go to Settings → Networking
2. Click "Custom Domain"
3. Enter your domain
4. Update DNS records as shown

---

**Need Help?** Check Railway docs at https://docs.railway.app
