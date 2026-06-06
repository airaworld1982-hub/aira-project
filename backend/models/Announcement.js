// backend/models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  priority: { type: String, enum: ['urgent','important','normal'], default: 'normal' },
  atype:    { type: String, enum: ['general','event','training','vacancy','publication','award'], default: 'general' },
  date:     { type: String },
  content:  { type: String, required: true },
  link:     { type: String },
  hidden:   { type: Boolean, default: false },
  ts:       { type: Number, default: () => Date.now() },
}, { timestamps: true });

AnnouncementSchema.index({ hidden: 1, atype: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
