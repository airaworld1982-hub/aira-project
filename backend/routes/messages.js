// backend/routes/messages.js
const express  = require('express');
const Message  = require('../models/Message');
const { protect } = require('../middleware/auth');

const router  = express.Router();
const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

// POST /api/messages — public (contact form)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'name, email and message are required' });
  }
  try {
    const msg = await Message.create({
      name, email, subject: subject || '(no subject)', message,
      date: dateStr(), ts: Date.now()
    });
    res.status(201).json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/messages — admin
router.get('/', protect, async (req, res) => {
  try {
    const msgs = await Message.find().sort({ ts: -1 }).lean();
    res.json({ success: true, data: msgs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/messages/:id — admin
router.delete('/:id', protect, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
