// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  firstName:       { type: String, required: true },
  lastName:        { type: String, required: true },
  email:           { type: String, required: true },
  phone:           { type: String },
  org:             { type: String },
  country:         { type: String },
  role:            { type: String },
  inquiry:         { type: String },
  message:         { type: String, required: true },
  newsletter:      { type: Boolean, default: false },
  status:          { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  response:        { type: String },
  responseSubject: { type: String },
  respondedAt:     { type: String },
  read:            { type: Boolean, default: false },
  date:            { type: String },
  ts:              { type: Number, default: () => Date.now() },
}, { timestamps: true });

MessageSchema.index({ status: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);
