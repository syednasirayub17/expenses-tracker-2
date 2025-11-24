# 📚 Expenses Tracker - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Architecture](#architecture)
4. [Deployment](#deployment)
5. [API Documentation](#api-documentation)
6. [Admin Panel](#admin-panel)
7. [Android App](#android-app)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Expenses Tracker** is a full-stack expense management application with web, mobile, and admin interfaces.

### Key Features
- ✅ User authentication & authorization
- ✅ Multi-account management (Bank, Credit Card, Loans)
- ✅ Transaction tracking & categorization
- ✅ Budget management
- ✅ Investment tracking (Stocks, SIPs)
- ✅ Day book & Journal entries
- ✅ Admin panel for user management
- ✅ Google Sheets integration
- ✅ Cross-device data synchronization
- ✅ Android mobile app

### Tech Stack

**Frontend:**
- React 18.2.0
- TypeScript 5.3.3
- Vite 5.0.8
- React Router 6.20.0
- CSS3 (Custom styling)

**Backend:**
- Node.js (Express 4.18.2)
- TypeScript 5.3.3
- MongoDB (Mongoose 8.0.3)
- JWT Authentication
- Google Sheets API

**Mobile:**
- Capacitor 7.4.4
- Android (Java 21)

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🚀 Quick Start Guide

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
MongoDB (local or Atlas)
Android Studio (for mobile app)
Java 21 (for Android builds)
```

### Local Development

**1. Clone Repository**
```bash
git clone https://github.com/syednasirayub17/expenses-tracker-2.git
cd expenses-tracker-2
```

**2. Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

**3. Environment Setup**

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
```

**Backend `server/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expenses-tracker
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Google Sheets (optional)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
```

**4. Start Development Servers**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

**5. Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin/login

---

## 🏗️ Architecture

### Project Structure
```
expenses-tracker/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── BudgetManager.tsx
│   │   ├── CreditCardManager.tsx
│   │   ├── LoanManager.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   └── ...
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── AccountContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/                   # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   └── Admin/
│   │       └── AdminDashboard.tsx
│   ├── services/                # API services
│   │   ├── api.ts
│   │   └── accountApi.ts
│   └── types/                   # TypeScript types
│       └── index.ts
├── server/                       # Backend source
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── services/            # Business logic
│   │   ├── config/              # Configuration
│   │   └── server.ts            # Entry point
│   └── package.json
├── android/                      # Android app
│   ├── app/
│   └── build.gradle
├── capacitor.config.ts          # Capacitor config
├── package.json                 # Frontend dependencies
└── vercel.json                  # Vercel config
```

### Data Flow
```
User → Frontend (React) → API (Express) → Database (MongoDB)
                ↓
         Local Storage (Cache)
```

---

## 🌐 Deployment

### Live URLs

**Production:**
- Frontend: https://expenses-tracker-2-one.vercel.app
- Backend API: https://expenses-tracker-api-a7ni.onrender.com
- Admin Panel: https://expenses-tracker-2-one.vercel.app/admin/login

### Deployment Steps

**1. Backend (Render)**
```bash
# Push to GitHub
git push origin main

# Render auto-deploys from GitHub
# Environment variables set in Render dashboard
```

**2. Frontend (Vercel)**
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from GitHub
# Environment variables:
VITE_API_URL=https://expenses-tracker-api-a7ni.onrender.com
```

**3. Android APK**
```bash
# Build frontend
npm run build

# Sync to Android
npx cap sync android

# Build APK
cd android && ./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📡 API Documentation

### Base URL
```
Production: https://expenses-tracker-api-a7ni.onrender.com
Development: http://localhost:5000
```

### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: {
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: {
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

**Get Profile**
```http
GET /api/auth/profile
Authorization: Bearer {token}

Response: {
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com"
}
```

### Account Endpoints

**Get Bank Accounts**
```http
GET /api/accounts/bank
Authorization: Bearer {token}
```

**Create Bank Account**
```http
POST /api/accounts/bank
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "HDFC Savings",
  "balance": 50000,
  "type": "savings"
}
```

**Update Bank Account**
```http
PUT /api/accounts/bank/:id
Authorization: Bearer {token}
```

**Delete Bank Account**
```http
DELETE /api/accounts/bank/:id
Authorization: Bearer {token}
```

---

## 🔐 Admin Panel

### Access
**URL**: https://expenses-tracker-2-one.vercel.app/admin/login

**Credentials:**
- Username: `nasir`
- Password: `Jio@#$2025`

### Features
- View all registered users
- Search and filter users
- View user statistics
- Manage user accounts
- View system analytics

### Admin Routes
```
/admin/login          - Admin login page
/admin/dashboard      - Admin dashboard (protected)
```

---

## 📱 Android App

### APK Location
```
/Users/nasir/Documents/project/expenses-tracker/android/app/build/outputs/apk/debug/app-debug.apk
```

### Installation
1. Copy APK to Android device
2. Enable "Install from unknown sources"
3. Install APK
4. Login with your credentials

### Features
- All web features available
- Offline caching (localStorage)
- Cross-device sync
- Native Android experience

### Building APK
```bash
# 1. Build frontend
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleDebug

# 4. APK ready at:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔧 Configuration Files

### `capacitor.config.ts`
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

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

export default config;
```

### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Backend Not Responding**
- Check if Render service is running
- Wait 30 seconds (cold start on free tier)
- Verify MongoDB connection

**2. CORS Errors**
- Ensure `CLIENT_URL` is set correctly in backend
- Check API URL in frontend `.env`

**3. Android App Won't Install**
- Enable "Install from unknown sources"
- Check Android version (minimum 5.1)

**4. Data Not Syncing**
- Check internet connection
- Verify API URL is correct
- Check browser console for errors

**5. Admin Panel 404**
- Ensure `vercel.json` is deployed
- Clear browser cache
- Check Vercel deployment logs

---

## 📊 Database Schema

### User Model
```typescript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (hashed)
  role: String (default: 'user')
  createdAt: Date
  updatedAt: Date
}
```

### Account Models
- BankAccount
- CreditCard
- Loan
- Transaction
- Budget
- Investment

---

## 🔒 Security

### Authentication
- JWT tokens (7-day expiry)
- Bcrypt password hashing
- Protected routes with middleware

### Environment Variables
- Never commit `.env` files
- Use different secrets for production
- Rotate JWT secrets regularly

---

## 📈 Performance

### Frontend
- Vite for fast builds
- Code splitting
- Lazy loading
- CDN delivery (Vercel)

### Backend
- MongoDB indexing
- Efficient queries
- Response caching
- Connection pooling

---

## 🎯 Future Enhancements

- [ ] Offline mode for mobile app
- [ ] Push notifications
- [ ] Data export (PDF, Excel)
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Multi-currency support
- [ ] Dark mode
- [ ] Biometric authentication
- [ ] Google Drive backup
- [ ] Analytics dashboard

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review deployment logs
3. Check browser console
4. Verify environment variables

---

## 📄 License

ISC License

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Author**: Nasir Ayub
