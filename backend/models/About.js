// backend/models/About.js
const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'about', unique: true },  // only one doc
  mission:    { type: String, default: '' },
  history: [{
    year:  { type: String },
    title: { type: String },
    desc:  { type: String },
    ts:    { type: Number, default: () => Date.now() },
  }],
  missionCards: [{
    icon:  { type: String, default: '🎯' },
    title: { type: String },
    desc:  { type: String },
    ts:    { type: Number, default: () => Date.now() },
  }],
  values: [{
    icon: { type: String, default: '💎' },
    name: { type: String },
    desc: { type: String },
    ts:   { type: Number, default: () => Date.now() },
  }],
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
