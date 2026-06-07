// backend/routes/messages.js
const express  = require('express');
const { body, validationResult } = require('express-validator');
const Message  = require('../models/Message');
const { protect } = require('../middleware/auth');

const router  = express.Router();
const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

// POST /api/messages  — public (contact form)
router.post('/', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const msg = await Message.create({ ...req.body, date: dateStr(), ts: Date.now() });
    res.status(201).json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/messages  — admin
router.get('/', protect, async (req, res) => {
  try {
    const msgs = await Message.find().sort({ ts: -1 }).lean();
    res.json({ success: true, data: msgs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/messages/:id  — admin (update status/response)
router.put('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/messages/:id  — admin
router.delete('/:id', protect, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
