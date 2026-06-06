// backend/models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  role:      { type: String, required: true },
  cat:       { type: String, enum: ['board','leadership','research'], default: 'board' },
  bio:       { type: String, required: true },
  expertise: [{ type: String, trim: true }],
  photo:     { type: String },   // base64 or CDN URL
  order:     { type: Number, default: 0 },
  ts:        { type: Number, default: () => Date.now() },
}, { timestamps: true });

TeamSchema.index({ cat: 1, order: 1 });

module.exports = mongoose.model('Team', TeamSchema);
