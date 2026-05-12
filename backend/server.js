const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const server = http.createServer(app);

// 1. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 2. Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());

// 3. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api', globalLimiter);
}

// 4. Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again after an hour'
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/signup', authLimiter);
}

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://smart-surplus-food-dispatcher.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});
app.set('io', io);
require('./rtc/socket')(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://smart-surplus-food-dispatcher.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' })); // Body size limit for security

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Start Background Workers
if (process.env.NODE_ENV !== 'test') {
  require('./workers/donationWorker');
  require('./workers/volunteerWorker');
}


// Background Cleanup: Stale Volunteer Sessions (every 5 mins)
const VolunteerSession = require('./models/VolunteerSession');
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      const count = await VolunteerSession.cleanupStaleSessions(10); // 10 min threshold
      if (count.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${count.modifiedCount} stale volunteer sessions`);
      }
    } catch (err) {
      console.error('❌ Session cleanup error:', err);
    }
  }, 5 * 60 * 1000);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`\n🚀 FoodBridge Backend running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
  });
}

module.exports = { app, server };
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
