// ═══════════════════════════════════════════════════════════════
// AIRA – Axon Infotech Research Academy
// Production Backend Server — Nepal VPS Edition
// Node.js + Express + MongoDB
// ═══════════════════════════════════════════════════════════════

'use strict';
require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const fs         = require('fs');
const connectDB  = require('./config/db');
const Admin      = require('./models/Admin');

// ── Connect MongoDB ────────────────────────────────────────────
connectDB();

const app = express();

// ── Trust proxy (Nginx reverse proxy) ─────────────────────────
app.set('trust proxy', 1);

// ── Security Headers ───────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,   // handled by Nginx
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://airaworld.org',
    'https://www.airaworld.org',
    'http://localhost:3001',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.airaworld.org');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));   // 25MB for base64 photos
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Write access logs to file in production
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const accessLog = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLog }));
} else {
  app.use(morgan('dev'));
}

// ── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/about',         require('./routes/about'));
app.use('/api/team',          require('./routes/team'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/services',      require('./routes/services'));
app.use('/api/blogs',         require('./routes/blogs'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/media',         require('./routes/media'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/credentials',   require('./routes/credentials'));
app.use('/api/stats',         require('./routes/stats'));

// Pusher / Signal routes
const signalRouter = require('./routes/signal');
app.use('/api/signal', signalRouter);
app.post('/api/pusher-auth', (req, res) => {
  req.url = '/pusher-auth';
  signalRouter(req, res, () => res.status(404).json({ success: false, message: 'Not found' }));
});

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'OK',
    version: '3.0.0',
    env:     process.env.NODE_ENV,
    uptime:  Math.floor(process.uptime()) + 's',
    ts:      Date.now(),
  });
});

// ── Serve Frontend ─────────────────────────────────────────────
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));
// SPA fallback — all non-API routes → index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack || err.message);
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error' : err.message;
  res.status(status).json({ success: false, message });
});

// ── Bootstrap Default Admin ────────────────────────────────────
const bootstrapAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const exists   = await Admin.findOne({ username });
    if (!exists) {
      await Admin.create({
        username,
        password: process.env.ADMIN_PASSWORD || 'ChangeMe2025!',
        email:    process.env.ADMIN_EMAIL    || 'admin@airaworld.org',
        role:     'superadmin',
      });
      console.log('✅ Default admin created — change password immediately!');
    }
  } catch (err) {
    console.error('⚠️  Admin bootstrap error:', err.message);
  }
};

// ── Start Server ───────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 3001;
app.listen(PORT, '0.0.0.0', async () => {
  await bootstrapAdmin();
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 AIRA API Server Started');
  console.log(`  📡 Port    : ${PORT}`);
  console.log(`  🌍 Mode    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🏠 Domain  : ${process.env.FRONTEND_URL || 'http://localhost:' + PORT}`);
  console.log('═══════════════════════════════════════════');
  console.log('');
});

// ── Graceful Shutdown ──────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

module.exports = app;
