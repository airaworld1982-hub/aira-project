// backend/routes/about.js
const express = require('express');
const About   = require('../models/About');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getOrCreate = async () => {
  let doc = await About.findOne({ _singleton: 'about' });
  if (!doc) doc = await About.create({ _singleton: 'about' });
  return doc;
};

// GET /api/about  — public
router.get('/', async (req, res) => {
  try {
    const about = await getOrCreate();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/about/mission
router.put('/mission', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.mission = req.body.mission || about.mission;
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/about/history
router.post('/history', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.history.push({ ...req.body, ts: Date.now() });
    about.history.sort((a, b) => a.year - b.year);
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/about/history/:entryId
router.delete('/history/:entryId', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.history = about.history.filter(h => String(h._id) !== req.params.entryId);
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/about/missioncards
router.post('/missioncards', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.missionCards.push({ ...req.body, ts: Date.now() });
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/about/missioncards/:id
router.delete('/missioncards/:id', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.missionCards = about.missionCards.filter(c => String(c._id) !== req.params.id);
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/about/values
router.post('/values', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.values.push({ ...req.body, ts: Date.now() });
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/about/values/:id
router.delete('/values/:id', protect, async (req, res) => {
  try {
    const about = await getOrCreate();
    about.values = about.values.filter(v => String(v._id) !== req.params.id);
    await about.save();
    res.json({ success: true, data: about });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
