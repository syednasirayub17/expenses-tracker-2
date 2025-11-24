# 🚀 Deployment Guide

## Overview
This guide covers deploying the Expenses Tracker application to production.

## Prerequisites
- GitHub account
- Render account (backend)
- Vercel account (frontend)
- MongoDB Atlas account (database)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up / Login
3. Create new project: "Expenses Tracker"
4. Create free cluster (M0)
5. Choose region: Mumbai (ap-south-1)

### 1.2 Create Database User
1. Go to **Database Access**
2. Click **Add New Database User**
3. Username: `nasir_admin`
4. Password: `ExpenseTracker2025`
5. Role: **Atlas admin**
6. Click **Add User**

### 1.3 Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Add: `0.0.0.0/0` (allow from anywhere)
4. Click **Confirm**

### 1.4 Get Connection String
1. Click **Connect** on your cluster
2. Choose **Drivers**
3. Copy connection string:
```
mongodb+srv://nasir_admin:ExpenseTracker2025@expenses-tracker.xuryigt.mongodb.net/expenses-tracker?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render

### 2.1 Sign Up
1. Go to https://render.com
2. Click **Sign Up**
3. Choose **GitHub**
4. Authorize Render

### 2.2 Create Web Service
1. Click **New +** → **Web Service**
2. Connect repository: `expenses-tracker-2`
3. Click **Connect**

### 2.3 Configure Service
```
Name: expenses-tracker-api
Region: Singapore
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

### 2.4 Environment Variables
Add these in Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://nasir_admin:ExpenseTracker2025@expenses-tracker.xuryigt.mongodb.net/expenses-tracker?retryWrites=true&w=majority
JWT_SECRET=nasir_expenses_tracker_super_secret_key_2025_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=*
GOOGLE_SHEETS_SPREADSHEET_ID=1lkFE_Cqsb3NCKG0AJgMK5QI3110ML_6MdguXOrth4xU
GOOGLE_SERVICE_ACCOUNT_EMAIL=expenses-tracker-service@expenses-tracker-478817.iam.gserviceaccount.com
```

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait 2-3 minutes for deployment
3. Your API will be live at: `https://expenses-tracker-api-a7ni.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Sign Up
1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **GitHub**
4. Authorize Vercel

### 3.2 Import Project
1. Click **Add New Project**
2. Select repository: `expenses-tracker-2`
3. Click **Import**

### 3.3 Configure Project
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.4 Environment Variables
Add in Vercel dashboard:
```env
VITE_API_URL=https://expenses-tracker-api-a7ni.onrender.com
```

### 3.5 Deploy
1. Click **Deploy**
2. Wait 1-2 minutes
3. Your app will be live at: `https://expenses-tracker-2-one.vercel.app`

---

## Step 4: Configure Android App

### 4.1 Update Environment
Create `.env` in project root:
```env
VITE_API_URL=https://expenses-tracker-api-a7ni.onrender.com
```

### 4.2 Update Capacitor Config
File: `capacitor.config.ts`
```typescript
const config: CapacitorConfig = {
  appId: 'com.expenses.tracker',
  appName: 'Expenses Tracker',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'https://expenses-tracker-api-a7ni.onrender.com',
      'https://expenses-tracker-2-one.vercel.app'
    ]
  }
};
```

### 4.3 Build APK
```bash
# Build frontend
npm run build

# Sync to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug
```

### 4.4 APK Location
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 5: Verify Deployment

### 5.1 Test Backend
```bash
curl https://expenses-tracker-api-a7ni.onrender.com/
# Should return: {"message":"Expenses Tracker API is running"}
```

### 5.2 Test Frontend
1. Open: https://expenses-tracker-2-one.vercel.app
2. Create account
3. Add data
4. Verify data persists

### 5.3 Test Cross-Device Sync
1. Login on web
2. Add data
3. Login on Android with same credentials
4. Verify data syncs

---

## Step 6: Optional - Keep Backend Always Running

### Use UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Sign up
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://expenses-tracker-api-a7ni.onrender.com/`
   - Interval: 5 minutes
4. Backend will never sleep!

---

## Deployment Checklist

### Backend (Render)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Render account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] API responding correctly

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible
- [ ] Routes working (vercel.json)

### Android
- [ ] Capacitor config updated
- [ ] Frontend built
- [ ] Synced to Android
- [ ] APK built successfully
- [ ] APK tested on device

---

## Troubleshooting

### Backend Build Failed
- Check `server/package.json` has all dependencies
- Verify TypeScript is in dependencies (not devDependencies)
- Check build logs in Render dashboard

### Frontend 404 Errors
- Ensure `vercel.json` exists
- Redeploy after adding vercel.json
- Clear browser cache

### Android App Can't Connect
- Verify API URL in `.env`
- Check `capacitor.config.ts` has correct URLs
- Rebuild APK after changes

---

## Auto-Deploy Setup

### GitHub Integration
Both Render and Vercel auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Render and Vercel will auto-deploy
```

---

## Production URLs

**Frontend**: https://expenses-tracker-2-one.vercel.app
**Backend API**: https://expenses-tracker-api-a7ni.onrender.com
**Admin Panel**: https://expenses-tracker-2-one.vercel.app/admin/login

---

## Security Notes

1. **Never commit `.env` files**
2. **Use strong JWT secrets in production**
3. **Rotate secrets regularly**
4. **Enable HTTPS only**
5. **Set up rate limiting**
6. **Monitor for suspicious activity**

---

**Deployment Complete!** 🎉

Your app is now live and accessible from anywhere in the world!
