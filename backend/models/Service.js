// backend/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  icon:     { type: String, default: '⚙️' },
  desc:     { type: String, required: true },
  features: [{ type: String }],
  link:     { type: String },
  order:    { type: Number, default: 0 },
  hidden:   { type: Boolean, default: false },
  ts:       { type: Number, default: () => Date.now() },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
