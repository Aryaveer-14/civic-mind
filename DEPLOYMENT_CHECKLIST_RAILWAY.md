# ✅ Railway Deployment Checklist

## Before You Start

- [ ] Code is saved and committed to GitHub
- [ ] You have a Railway account (free at railway.app)
- [ ] You have your Gemini API key ready

---

## Deployment Steps

### 1. Push to GitHub ✓
```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

- [ ] Code pushed successfully

### 2. Create Railway Project ✓

Go to: **https://railway.app**

- [ ] Logged into Railway
- [ ] Clicked "New Project"
- [ ] Selected "Deploy from GitHub repo"
- [ ] Authorized GitHub access
- [ ] Selected repository: **Aryaveer-14/civic-mind**
- [ ] Deployment started

### 3. Wait for Deployment ⏱️

Watch the deployment progress...

- [ ] Build completed (green checkmark)
- [ ] Deployment successful
- [ ] Service is running

### 4. Add Environment Variables 🔧

Click your service → Variables tab

- [ ] Added `GEMINI_API_KEY` = your_key_here
- [ ] Added `NODE_ENV` = production
- [ ] (Optional) Added Twilio credentials
- [ ] Variables saved

### 5. Generate Domain 🌐

Go to: Settings → Networking

- [ ] Found "Domains" section
- [ ] Clicked "Generate Domain" (if needed)
- [ ] Domain generated successfully
- [ ] Copied your Railway URL

### 6. Test Your Deployment 🧪

Visit your Railway URL:

- [ ] Backend responds at: `https://your-url.up.railway.app/`
- [ ] Health check works: `https://your-url.up.railway.app/health`
- [ ] Auth page loads: `https://your-url.up.railway.app/auth.html`
- [ ] Working page loads: `https://your-url.up.railway.app/working.html`
- [ ] Can register a user
- [ ] Can submit a complaint
- [ ] Everything works! 🎉

---

## 📝 Your Deployment Info

Fill this in once deployed:

**Railway Project Name:** ________________

**Railway Service Name:** ________________

**Your Deployment URL:** 
```
https://_________________________________.up.railway.app
```

**Deployment Date:** ________________

---

## 🔗 Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Your Project: `[Save link here after deployment]`
- Deployment Logs: `[Project → Deployments → View Logs]`

---

## 📱 Share These Links

Once deployed, share these with users:

- **Register/Login:** `https://your-url.up.railway.app/auth.html`
- **Report Issue:** `https://your-url.up.railway.app/working.html`
- **Dashboard:** `https://your-url.up.railway.app/dashboard.html`

---

## 🎯 Post-Deployment

- [ ] Saved Railway URL in safe place
- [ ] Tested all major features
- [ ] Shared link with team/users
- [ ] Set up monitoring (optional)
- [ ] Added custom domain (optional)

---

## ⚠️ Common Issues & Solutions

### Issue: No domain shown
**Solution:** Settings → Networking → "Generate Domain"

### Issue: Deployment failed
**Solution:** Check Deployments → View Logs for errors

### Issue: App not responding
**Solution:** Check Variables tab, ensure GEMINI_API_KEY is set

### Issue: 500 errors
**Solution:** View logs, check if backend started correctly

---

## 🎉 Deployment Complete!

**Congratulations! Your CivicMind app is now live!** 🚀

Your app is accessible worldwide at your Railway URL.

**Next Steps:**
1. ✅ Test all features
2. ✅ Share with users
3. ✅ Monitor usage in Railway dashboard
4. ✅ (Optional) Set up custom domain
5. ✅ (Optional) Enable Firestore for persistence

---

## 📚 Need Help?

- **Deployment Guide:** See QUICK_DEPLOY_RAILWAY.md
- **Finding URL:** See GET_RAILWAY_LINK.md
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway

---

**Keep this checklist handy for future deployments!** ✓
