// backend/server.js
// ═══════════════════════════════════════════════════════
// AIRA – Axon Infotech Research Academy
// Express + MongoDB Backend Server
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const connectDB    = require('./config/db');
const Admin        = require('./models/Admin');

// ── Connect Database ───────────────────────────
connectDB();

const app = express();

// ── Trust Proxy (required for Vercel) ──────────
app.set('trust proxy', 1);

// ── Security & Middleware ──────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// Allow all origins — simplest fix for Vercel deployment
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '20mb' }));   // 20MB for base64 team photos
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Rate Limiting ──────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);

// ── API Routes ─────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/blogs',         require('./routes/blogs'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/media',         require('./routes/media'));
app.use('/api/team',          require('./routes/team'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/credentials',   require('./routes/credentials'));
app.use('/api/about',         require('./routes/about'));
app.use('/api/services',      require('./routes/services'));
app.use('/api/stats',         require('./routes/stats'));
// WebRTC signaling routes
const signalRouter = require('./routes/signal');
app.use('/api/signal', signalRouter);
// Pusher auth — mounted separately so POST /api/pusher-auth hits the root handler
app.post('/api/pusher-auth', (req, res) => {
  req.url = '/pusher-auth';
  signalRouter(req, res, () => res.status(404).json({ success: false, message: 'Not found' }));
});

// ── Health Check ───────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'OK', env: process.env.NODE_ENV, ts: Date.now() })
);

// ── Serve Frontend (Production) ─────────────────
// When deployed on the same server, serve the frontend build
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ── Global Error Handler ───────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.stack || err.message);
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message;
  res.status(status).json({ success: false, message });
});

// ── Bootstrap Admin User ───────────────────────
const bootstrapAdmin = async () => {
  try {
    const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    if (!exists) {
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe2025!',
        email:    process.env.ADMIN_EMAIL    || 'admin@airaworld.org',
        role:     'superadmin',
      });
      console.log('✅ Default admin user created. Change the password immediately!');
    }
  } catch (err) {
    console.error('⚠️  Admin bootstrap error:', err.message);
  }
};

// ── Start Server ───────────────────────────────
// Only start HTTP server when run directly (npm run dev / node server.js)
// When imported by Vercel (api/index.js), just export the app
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, async () => {
    await bootstrapAdmin();
    console.log(`🚀 AIRA API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
} else {
  // Vercel / serverless: bootstrap admin on cold start
  bootstrapAdmin().catch(console.error);
}

module.exports = app;
