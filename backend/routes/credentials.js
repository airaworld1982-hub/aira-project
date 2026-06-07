// backend/routes/credentials.js
const express    = require('express');
const bcrypt     = require('bcryptjs');
const Credential = require('../models/Credential');
const { protect } = require('../middleware/auth');

const router  = express.Router();
const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

// GET /api/credentials  — admin: list all
router.get('/', protect, async (req, res) => {
  try {
    const creds = await Credential.find().sort({ createdTs: -1 }).lean();
    // Never send passHash to client
    const safe = creds.map(({ passHash, ...c }) => c);
    res.json({ success: true, data: safe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/credentials  — admin: create
router.post('/', protect, async (req, res) => {
  const { name, type, userid, password, expiry, maxAttempts, notes } = req.body;
  if (!name || !type || !userid || !password) {
    return res.status(400).json({ success: false, message: 'name, type, userid, password required' });
  }
  try {
    const existing = await Credential.findOne({ type, userid });
    if (existing) return res.status(409).json({ success: false, message: 'User ID already exists for this session type' });

    const passHash = await bcrypt.hash(password, 10);
    const cred = await Credential.create({
      name, type, userid, passHash, expiry: expiry || 'session',
      maxAttempts: maxAttempts || 5, notes, created: dateStr(), createdTs: Date.now(),
    });
    const { passHash: _, ...safe } = cred.toObject();
    res.status(201).json({ success: true, data: safe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/credentials/verify  — public: verify gate credentials
router.post('/verify', async (req, res) => {
  const { type, userid, password } = req.body;
  if (!type || !userid || !password) {
    return res.status(400).json({ success: false, message: 'type, userid, password required' });
  }
  try {
    const cred = await Credential.findOne({ type, userid, active: true, expired: false });
    if (!cred) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (cred.locked) return res.status(403).json({ success: false, message: 'Credential locked' });

    const ok = await bcrypt.compare(password, cred.passHash);
    if (!ok) {
      cred.failedAttempts = (cred.failedAttempts || 0) + 1;
      if (cred.failedAttempts >= (cred.maxAttempts || 5)) cred.locked = true;
      await cred.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials', attempts: cred.failedAttempts });
    }
    cred.failedAttempts = 0;
    cred.lastUsed = dateStr();
    await cred.save();
    res.json({ success: true, name: cred.name, type: cred.type });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/credentials/:id  — admin
router.put('/:id', protect, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.password) {
      update.passHash = await bcrypt.hash(update.password, 10);
      delete update.password;
      update.failedAttempts = 0;
      update.locked = false;
    }
    delete update.passHash; // don't allow direct hash override
    if (req.body.password) update.passHash = await bcrypt.hash(req.body.password, 10);
    const cred = await Credential.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cred) return res.status(404).json({ success: false, message: 'Not found' });
    const { passHash, ...safe } = cred.toObject();
    res.json({ success: true, data: safe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/credentials/:id  — admin
router.delete('/:id', protect, async (req, res) => {
  try {
    await Credential.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
