// backend/models/Media.js
const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  cat:     { type: String, enum: ['photo','event','research','team','document'], default: 'photo' },
  url:     { type: String, required: true },
  caption: { type: String },
  date:    { type: String },
  ts:      { type: Number, default: () => Date.now() },
}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);
