// backend/routes/services.js
const express  = require('express');
const Service  = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const svcs = await Service.find({ hidden: false }).sort({ order: 1, ts: -1 }).lean();
    res.json({ success: true, data: svcs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const svc = await Service.create({ ...req.body, ts: Date.now() });
    res.status(201).json({ success: true, data: svc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const svc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!svc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: svc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
