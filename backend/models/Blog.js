// backend/models/Blog.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  author:  { type: String, default: 'Admin' },
  cat:     { type: String, enum: ['national','international','research','policy','tech','event'], default: 'national' },
  emoji:   { type: String, default: '📝' },
  status:  { type: String, enum: ['published','draft'], default: 'published' },
  excerpt: { type: String, required: true, maxlength: 500 },
  content: { type: String },
  img:     { type: String },
  tags:    [{ type: String, trim: true }],
  pinned:  { type: Boolean, default: false },
  hidden:  { type: Boolean, default: false },
  date:    { type: String },
  ts:      { type: Number, default: () => Date.now() },
}, { timestamps: true });

BlogSchema.index({ status: 1, hidden: 1, cat: 1 });
BlogSchema.index({ title: 'text', excerpt: 'text', author: 'text' });

module.exports = mongoose.model('Blog', BlogSchema);
