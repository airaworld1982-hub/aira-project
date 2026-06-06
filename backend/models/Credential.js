// backend/models/Credential.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const CredentialSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  type:           { type: String, enum: ['classroom','conference','recordings'], required: true },
  userid:         { type: String, required: true, trim: true },
  passHash:       { type: String, required: true },   // bcrypt hash
  expiry:         { type: String, enum: ['session','24h','7d','30d','permanent'], default: 'session' },
  maxAttempts:    { type: Number, default: 5 },
  failedAttempts: { type: Number, default: 0 },
  locked:         { type: Boolean, default: false },
  active:         { type: Boolean, default: true },
  expired:        { type: Boolean, default: false },
  notes:          { type: String },
  lastUsed:       { type: String },
  created:        { type: String },
  createdTs:      { type: Number, default: () => Date.now() },
}, { timestamps: true });

CredentialSchema.index({ type: 1, userid: 1 }, { unique: true });

// Hash password before save
CredentialSchema.pre('save', async function (next) {
  if (!this.isModified('passHash')) return next();
  // passHash is already a bcrypt hash from the route, pass through
  next();
});

CredentialSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.passHash);
};

module.exports = mongoose.model('Credential', CredentialSchema);
