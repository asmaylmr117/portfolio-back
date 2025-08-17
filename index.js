// api/index.js - ملف خاص لـ Vercel Serverless
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import routes
const blogRoutes = require('../routes/blogRoutes');
const projectRoutes = require('../routes/projectRoutes');
const serviceRoutes = require('../routes/serviceRoutes');
const teamRoutes = require('../routes/teamRoutes');

const app = express();

// ✅ تحسين اتصال MongoDB لـ Vercel
let cachedConnection = null;

const connectDB = async () => {
  // استخدام connection caching لتجنب multiple connections
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
      // إعدادات محسنة لـ Serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5, // أقل لـ Serverless
      minPoolSize: 0,
      maxIdleTimeMS: 10000, // إغلاق سريع للاتصالات الخاملة
      connectTimeoutMS: 10000,
      bufferCommands: false, // مهم جداً لـ Serverless
    });

    cachedConnection = conn;
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// ✅ Middleware محسن لـ Vercel
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  credentials: true
}));

// Rate limiting مخفف لـ Serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // أقل لـ Serverless
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '5mb' })); // أقل لـ Serverless
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ✅ اتصال قاعدة البيانات لكل request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ✅ API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/teams', teamRoutes);

// ✅ Health check محسن
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      status: 'OK',
      message: 'Server is running on Vercel',
      database: {
        status: dbStatusText[dbStatus],
        host: mongoose.connection.host || 'Not connected',
        name: mongoose.connection.name || 'Not connected'
      },
      timestamp: new Date().toISOString(),
      serverless: true
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// ✅ Export for Vercel
module.exports = app;
