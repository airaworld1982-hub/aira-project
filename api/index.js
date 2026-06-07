// api/index.js
// ═══════════════════════════════════════════════════
// Vercel Serverless Entry Point
// All /api/* requests are handled here
// This file bridges Vercel's serverless functions
// to the Express app in backend/server.js
// ═══════════════════════════════════════════════════

require('dotenv').config();
const app = require('../backend/server');

module.exports = app;
