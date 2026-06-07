// backend/routes/auth.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin   = require('../models/Admin');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

// POST /api/auth/login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token: signToken(admin._id),
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/auth/me  (verify token)
router.get('/me', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
