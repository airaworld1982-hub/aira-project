// backend/routes/media.js
const express  = require('express');
const Media    = require('../models/Media');
const { protect } = require('../middleware/auth');

const router  = express.Router();
const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

router.get('/', async (req, res) => {
  try {
    const items = await Media.find().sort({ ts: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const item = await Media.create({ ...req.body, date: dateStr(), ts: Date.now() });
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
