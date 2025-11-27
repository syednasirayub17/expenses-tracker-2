// Load environment variables FIRST before any imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import googleSheets from './services/googleSheets';

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

// Initialize Google Sheets structure
googleSheets.initializeSheetStructure().catch(err =>
  console.error('Failed to initialize Google Sheets:', err)
);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://expenses-tracker-2-one.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Expenses Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
