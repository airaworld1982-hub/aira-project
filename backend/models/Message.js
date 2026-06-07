// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true },
  subject: { type: String, default: '(no subject)' },
  message: { type: String, required: true },
  date:    { type: String },
  ts:      { type: Number, default: () => Date.now() },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
