# 💰 Expenses Tracker

A full-stack expense tracking application with smart features, built with React, TypeScript, Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Smart Features](#smart-features)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- 💳 **Multi-Account Management**: Track bank accounts, credit cards, loans, and cash
- 📊 **Transaction Tracking**: Record income, expenses, and transfers
- 📈 **Budget Management**: Set and monitor budgets by category
- 🎯 **Savings Goals**: Track progress towards financial goals
- 📱 **Mobile App**: Android app using Capacitor
- 🔐 **Secure Authentication**: JWT-based auth with bcrypt password hashing
- 📤 **Data Export**: Export reports to CSV/PDF
- 📊 **Visual Reports**: Charts and graphs for spending analysis

### 🆕 Advanced Features

#### 📈 Investment Tracking
- **Multi-Asset Support**: Track stocks, mutual funds, cryptocurrency, and gold
- **Portfolio Summary**: Real-time portfolio value with profit/loss calculations
- **Gold Price Tracking**: Per-gram gold price with historical data
- **Investment Analytics**: Gain/loss percentage by asset type
- **Platform Integration**: Track investments across Zerodha, Groww, etc.

#### 👥 Shared Wallets
- **Family & Friends**: Create shared wallets for groups
- **Smart Expense Splitting**: Equal, custom, or percentage-based splits
- **Invite System**: Unique invite codes for easy member addition
- **Settlement Optimization**: Minimizes transactions between members
- **Balance Tracking**: Real-time who-owes-whom calculations
- **Use Cases**: Family expenses, trip planning, roommate bills

#### 💰 Enhanced Loan Tracker
- **EMI Calculator**: Accurate EMI calculations with interest breakdown
- **Prepayment Analysis**: Calculate impact of prepayments (reduce EMI vs tenure)
- **Amortization Schedule**: Month-by-month payment breakdown
- **Multiple Loan Types**: Personal, home, car, education, business loans
- **Next EMI Tracking**: Upcoming payment reminders

#### 🔐 Security & Activity Logs
- **Activity Tracking**: Login, logout, and account changes
- **Device Detection**: Track device type and browser
- **IP Geolocation**: See login locations
- **Failed Login Alerts**: Monitor unauthorized access attempts
- **Active Sessions**: View and manage active sessions
- **2FA Ready**: Two-factor authentication infrastructure

### Smart Features (No AI APIs Required!)
- ✨ **Smart Category Suggestions**: Auto-suggests categories based on transaction descriptions
- 💡 **Spending Insights**: Monthly comparisons, budget alerts, and trend analysis
- 📊 **Analytics Dashboard**: Real-time spending breakdown by category
- 🎯 **Budget Recommendations**: Smart budget suggestions based on spending history
- 🔍 **Unusual Spending Detection**: Alerts when spending patterns change significantly

### Integrations
- 📊 **Google Sheets Sync**: Auto-sync data to Google Sheets (optional)
- ☁️ **Cloud Backup**: Automated backups to Google Drive

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Context API** for state management
- **CSS3** for styling
- **Capacitor** for mobile app

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google APIs** for Sheets integration

### DevOps
- **Vercel** for frontend deployment
- **Render** for backend deployment
- **GitHub Actions** for CI/CD

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local or Atlas)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/syednasirayub17/expenses-tracker-2.git
cd expenses-tracker-2
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
cd ..
```

---

## 🔐 Environment Variables

### Frontend (.env)

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

### Backend (server/.env)

Create a `.env` file in the `server` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/expenses-tracker
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expenses-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Sheets (Optional)
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🏃 Running the Application

### Development Mode

#### 1. Start MongoDB (if running locally)
```bash
mongod
```

#### 2. Start Backend Server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

#### 3. Start Frontend (in a new terminal)
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Build

#### Frontend
```bash
npm run build
npm run preview
```

#### Backend
```bash
cd server
npm run build
npm start
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-api.onrender.com`)

4. **Deploy**
   - Vercel will auto-deploy on every push to `main`

### Backend (Render)

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure Settings**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - Add all variables from `server/.env`
   - Use MongoDB Atlas URI for production

4. **Deploy**
   - Render will auto-deploy on every push

### Android App

```bash
# Build the app
npm run build:android

# Run on device/emulator
cd android
./gradlew assembleDebug

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Accounts

#### Get Bank Accounts
```http
GET /api/accounts/bank
Authorization: Bearer <token>
```

#### Create Transaction
```http
POST /api/accounts/transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 50.00,
  "category": "Food",
  "type": "expense",
  "date": "2025-11-30"
}
```

### 🆕 Investments

#### Get Portfolio Summary
```http
GET /api/investments/portfolio
Authorization: Bearer <token>
```

#### Add Investment
```http
POST /api/investments
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "stock",
  "name": "Reliance Industries",
  "symbol": "RELIANCE",
  "quantity": 10,
  "buyPrice": 2500,
  "currentPrice": 2650,
  "buyDate": "2025-01-15",
  "platform": "Zerodha"
}
```

#### Get Gold Price
```http
GET /api/investments/gold/price
Authorization: Bearer <token>
```

### 🆕 Shared Wallets

#### Create Wallet
```http
POST /api/wallets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Family Expenses",
  "description": "Shared wallet for family",
  "type": "family"
}
```

#### Join Wallet
```http
POST /api/wallets/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteCode": "ABC123"
}
```

#### Add Shared Expense
```http
POST /api/wallets/:walletId/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Dinner",
  "amount": 1500,
  "category": "Food",
  "type": "expense",
  "splitType": "equal"
}
```

#### Get Balances & Settlements
```http
GET /api/wallets/:walletId/balances
Authorization: Bearer <token>
```

### 🆕 Activity Logs

#### Get Activity Logs
```http
GET /api/activity/logs?limit=50&skip=0
Authorization: Bearer <token>
```

#### Get Active Sessions
```http
GET /api/activity/sessions
Authorization: Bearer <token>
```

### Smart Features

#### Get Spending Insights
```http
GET /api/smart/insights
Authorization: Bearer <token>
```

#### Suggest Category
```http
POST /api/smart/suggest-category
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "coffee at starbucks"
}
```

---

## 📁 Project Structure

```
expenses-tracker-2/
├── src/                      # Frontend source
│   ├── components/          # React components
│   ├── context/            # Context providers
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── server/                  # Backend source
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   └── dist/               # Compiled JS (gitignored)
├── android/                 # Android app (Capacitor)
├── public/                  # Static assets
└── .env                     # Environment variables
```

---

## 🧠 Smart Features

### How Smart Category Suggestions Work

1. **Keyword Matching**: Common merchants mapped to categories
   - "starbucks" → Food
   - "uber" → Transport
   - "amazon" → Shopping

2. **User Pattern Learning**: Analyzes your transaction history
   - Finds similar descriptions
   - Suggests most common category

3. **Confidence Scoring**: Shows suggestions with high confidence

### How Spending Insights Work

1. **Monthly Comparison**: Current month vs last month
2. **Budget Alerts**: Warns at 75% and 90% usage
3. **Unusual Spending**: Detects >50% increase from 3-month average
4. **Category Breakdown**: Top 5 spending categories

---

## 🐛 Known Issues & Fixes

### ✅ Fixed Issues

#### Issue: Deleted transactions reappear
**Status**: ✅ Fixed in v1.2.1
**Solution**: Updated `deleteTransaction` to call API

#### Issue: Currency showing $ instead of ₹
**Status**: ✅ Fixed in v1.2.1
**Solution**: Updated SpendingInsights to use `formatCurrency`

#### Issue: TypeScript build errors
**Status**: ✅ Fixed in v1.2.2
**Solution**: Added proper type assertions for UAParser and fetch

### ⚠️ Optional Features

#### Google Sheets Integration
**Status**: ⚠️ Optional feature
**Note**: Requires credentials.json configuration on Render
**Impact**: Non-critical, core features work without it

---

## 🆕 What's New in v1.3.0

### Investment Tracking
- ✅ Portfolio dashboard with real-time P&L
- ✅ Support for stocks, mutual funds, crypto, gold
- ✅ Gold price per gram tracking
- ⏳ External API integration (Yahoo Finance, CoinGecko) - Coming soon

### Shared Wallets
- ✅ Create and join shared wallets
- ✅ Smart expense splitting (equal/custom/percentage)
- ✅ Settlement optimization
- ⏳ Detailed transaction history view - Coming soon

### Security & Activity
- ✅ Activity logs with IP geolocation
- ✅ Device and browser detection
- ✅ Failed login tracking
- ⏳ Full 2FA with TOTP and email OTP - Coming soon

### Enhanced Loan Tracker
- ✅ EMI calculator backend
- ✅ Prepayment impact analysis
- ✅ Amortization schedule generation
- ⏳ Frontend calculator UI - Coming soon

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Syed Nasir Ayub**
- GitHub: [@syednasirayub17](https://github.com/syednasirayub17)

---

## 🙏 Acknowledgments

- Built with ❤️ using React and Node.js
- Smart features powered by rule-based algorithms
- UI inspired by modern fintech apps

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

**Made with 💰 by Syed Nasir Ayub**
