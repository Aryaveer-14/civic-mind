# 📍 How to Get Your Railway Deployment Link

## After You Deploy to Railway...

### Method 1: From Project Dashboard

1. Go to **https://railway.app/dashboard**
2. You'll see your projects listed
3. Click on **"civic-mind"** project (or whatever name Railway gave it)
4. You'll see your service(s) listed
5. Click on the service box

### Method 2: From Service View

Once you're in your service:

```
┌─────────────────────────────────────────┐
│  Railway Dashboard                      │
│                                         │
│  civic-mind  ←  Your Project            │
│  └── civic-backend  ←  Your Service     │
│                                         │
│  [Deployments] [Variables] [Settings]  │
└─────────────────────────────────────────┘
```

### Finding Your URL - Option A: Settings Tab

1. Click **"Settings"** tab (top of page)
2. Scroll down to **"Networking"** section
3. Look for **"Domains"**
4. You'll see something like:

```
Domains
└── https://civic-mind-production.up.railway.app
    └── Generated Domain ✓
```

**This is your deployment URL!** 🎉

### Finding Your URL - Option B: Deployments Tab

1. Click **"Deployments"** tab
2. Look at the latest successful deployment (green checkmark)
3. The URL is often shown next to the deployment status

### If You DON'T See a Domain:

1. Go to **Settings** tab
2. Find **"Networking"** section  
3. Click **"Generate Domain"** button
4. Railway will create a public URL for you
5. Wait 10-20 seconds for DNS to propagate

---

## 🔗 Your URL Will Look Like This:

### Format 1 (Project-based):
```
https://civic-mind-production.up.railway.app
```

### Format 2 (Random):
```
https://xxxx-yyyy-production-zzzz.up.railway.app
```

### Format 3 (Service-based):
```
https://civic-backend-production.up.railway.app
```

---

## 📋 What to Do With Your URL

Once you have it (e.g., `https://civic-mind-production.up.railway.app`):

### Test Your Endpoints:

```bash
# Backend status
https://your-url.up.railway.app/

# Health check
https://your-url.up.railway.app/health

# Auth page
https://your-url.up.railway.app/auth.html

# Report page
https://your-url.up.railway.app/working.html

# Dashboard
https://your-url.up.railway.app/dashboard.html
```

### Share These Links:

- **Users:** `https://your-url.up.railway.app/auth.html`
- **Report Issues:** `https://your-url.up.railway.app/working.html`

---

## 🎯 Quick Visual Guide

```
Railway Dashboard
    ↓
Your Projects List
    ↓
Click "civic-mind" project
    ↓
Click service box
    ↓
Click "Settings" tab
    ↓
Scroll to "Networking" or "Domains"
    ↓
Copy your URL! 🎉
```

---

## ⚡ Pro Tips

1. **Bookmark Your URL** - Save it in a text file or bookmark it
2. **Copy from Browser** - Once deployed, just copy from your browser address bar
3. **Environment Variable** - Railway also sets this in `RAILWAY_PUBLIC_DOMAIN` env var
4. **Custom Domain** - You can add your own domain later (like civicmind.com)

---

## 🔄 URL Changes?

Your Railway URL **won't change** unless you:
- Delete and recreate the service
- Remove and regenerate the domain

**It's permanent and stable!** ✓

---

## ❓ Troubleshooting

### "I don't see any URL"
→ Go to Settings → Networking → Click "Generate Domain"

### "Domain generation failed"
→ Wait a minute and try again
→ Check if Railway is having issues (status.railway.app)

### "URL returns 404"
→ Check Deployments tab - make sure deployment succeeded
→ View logs to see if there are errors

### "App is slow to load"
→ Normal on first load (app wakes from sleep)
→ Free tier apps sleep after 15 minutes of inactivity

---

## 📱 Example URL in Action

If your URL is: `https://civic-mind-production.up.railway.app`

Then your pages are at:
- Home: `https://civic-mind-production.up.railway.app/`
- Auth: `https://civic-mind-production.up.railway.app/auth.html`
- Working: `https://civic-mind-production.up.railway.app/working.html`
- Dashboard: `https://civic-mind-production.up.railway.app/dashboard.html`
- API: `https://civic-mind-production.up.railway.app/analyze`

**That's it! Your app is live! 🚀**

---

## 💡 Remember

**Your Railway URL = Your Project's Public Address**

It's like your website address. Share it with anyone, and they can access your CivicMind app from anywhere in the world! 🌍
