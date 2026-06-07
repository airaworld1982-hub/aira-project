// backend/routes/blogs.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog    = require('../models/Blog');
const { protect } = require('../middleware/auth');

const router = express.Router();
const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

// GET /api/blogs  — public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published', hidden: false })
      .sort({ ts: -1 }).lean();
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/blogs/all  — admin (all including drafts)
router.get('/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ ts: -1 }).lean();
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/blogs  — admin
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const blog = await Blog.create({ ...req.body, date: dateStr(), ts: Date.now() });
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/blogs/:id  — admin
router.put('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/blogs/:id  — admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
