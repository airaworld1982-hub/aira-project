// api/index.js — Vercel Serverless Entry Point
// Note: No dotenv needed — Vercel injects env vars automatically
const app = require('../backend/server');
module.exports = app;
