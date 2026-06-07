// backend/models/Project.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  pstatus:      { type: String, enum: ['current','past'], default: 'current' },
  method:       { type: String },
  timeline:     { type: String },
  partners:     { type: String },
  impact:       { type: String },
  emoji:        { type: String, default: '🚀' },
  desc:         { type: String, required: true },
  achievements: [{ type: String }],
  tags:         [{ type: String, trim: true }],
  hidden:       { type: Boolean, default: false },
  date:         { type: String },
  ts:           { type: Number, default: () => Date.now() },
}, { timestamps: true });

ProjectSchema.index({ pstatus: 1, hidden: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
