// backend/scripts/seedCredentials.js
// Run: node backend/scripts/seedCredentials.js
// Seeds the 3 default session credentials into MongoDB

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Credential = require('../models/Credential');

const dateStr = () => new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

const DEFAULT_CREDS = [
  {
    name: 'Classroom Access',
    type: 'classroom',
    userid: 'aira@classroom',
    password: 'class2025',
    expiry: 'permanent',
    maxAttempts: 100,
    notes: 'Default classroom credential',
  },
  {
    name: 'Conference Access',
    type: 'conference',
    userid: 'aira@conference',
    password: 'conf2025',
    expiry: 'permanent',
    maxAttempts: 100,
    notes: 'Default conference credential',
  },
  {
    name: 'Student Access',
    type: 'recordings',
    userid: 'student@aira',
    password: 'aira2025',
    expiry: 'permanent',
    maxAttempts: 100,
    notes: 'Default recordings/student credential',
  },
];

async function seedCredentials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const c of DEFAULT_CREDS) {
      const existing = await Credential.findOne({ type: c.type, userid: c.userid });
      if (existing) {
        // Reset it - update password and unlock
        existing.passHash = await bcrypt.hash(c.password, 10);
        existing.locked = false;
        existing.failedAttempts = 0;
        existing.active = true;
        existing.expired = false;
        existing.expiry = c.expiry;
        existing.maxAttempts = c.maxAttempts;
        await existing.save();
        console.log(`♻️  Reset: [${c.type}] ${c.userid} / ${c.password}`);
      } else {
        const passHash = await bcrypt.hash(c.password, 10);
        await Credential.create({
          name: c.name, type: c.type, userid: c.userid,
          passHash, expiry: c.expiry, maxAttempts: c.maxAttempts,
          notes: c.notes, active: true, expired: false, locked: false,
          failedAttempts: 0, created: dateStr(), createdTs: Date.now(),
        });
        console.log(`✅ Created: [${c.type}] ${c.userid} / ${c.password}`);
      }
    }

    console.log('\n🎉 All credentials ready!');
    console.log('─────────────────────────────────────');
    DEFAULT_CREDS.forEach(c => {
      console.log(`  ${c.type.padEnd(12)} userid: ${c.userid.padEnd(20)} password: ${c.password}`);
    });
    console.log('─────────────────────────────────────');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seedCredentials();
