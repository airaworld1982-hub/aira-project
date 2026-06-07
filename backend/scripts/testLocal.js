// Test local backend connection
// Run: node backend/scripts/testLocal.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function testAll() {
  console.log('\n🧪 AIRA Local Backend Test');
  console.log('═══════════════════════════════════');

  // 1. Check .env
  console.log('\n📋 Environment Variables:');
  console.log('  NODE_ENV      :', process.env.NODE_ENV || '❌ MISSING');
  console.log('  PORT          :', process.env.PORT || '❌ MISSING');
  console.log('  MONGODB_URI   :', process.env.MONGODB_URI ? '✅ Set' : '❌ MISSING');
  console.log('  JWT_SECRET    :', process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING');
  console.log('  ADMIN_USERNAME:', process.env.ADMIN_USERNAME || '❌ MISSING');
  console.log('  ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ MISSING');

  if (!process.env.MONGODB_URI) {
    console.log('\n❌ ERROR: MONGODB_URI not set!');
    console.log('   Make sure backend/.env file exists with real values.');
    process.exit(1);
  }

  // 2. MongoDB connection
  console.log('\n🔌 Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('  ✅ MongoDB connected!');
    console.log('  Host:', mongoose.connection.host);
    console.log('  DB  :', mongoose.connection.name);
  } catch (err) {
    console.log('  ❌ MongoDB failed:', err.message);
    process.exit(1);
  }

  // 3. Check Admin exists
  console.log('\n👤 Checking admin user...');
  const Admin = require('../models/Admin');
  const admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
  if (admin) {
    console.log('  ✅ Admin found:', admin.username);
    // Test password
    const pwOk = await admin.matchPassword(process.env.ADMIN_PASSWORD || 'aira2020@@');
    console.log('  Password match:', pwOk ? '✅ OK' : '❌ WRONG PASSWORD');
  } else {
    console.log('  ⚠️  No admin found - will be created on server start');
  }

  // 4. Check Credentials
  console.log('\n🔑 Checking session credentials...');
  const Credential = require('../models/Credential');
  const creds = await Credential.find({});
  if (creds.length === 0) {
    console.log('  ❌ NO CREDENTIALS FOUND!');
    console.log('  Run: node backend/scripts/seedCredentials.js');
  } else {
    console.log(`  ✅ Found ${creds.length} credentials:`);
    for (const c of creds) {
      const statusOk = c.active && !c.locked;
      console.log(`    [${c.type.padEnd(12)}] userid: ${c.userid.padEnd(22)} status: ${statusOk ? '✅ Active' : '❌ ' + (c.locked ? 'LOCKED' : 'Inactive')}`);
    }
  }

  // 5. Test verify logic manually
  console.log('\n🔐 Testing credential verify logic...');
  const testCases = [
    { type: 'classroom',  userid: 'aira@classroom',  password: 'class2025' },
    { type: 'conference', userid: 'aira@conference', password: 'conf2025'  },
    { type: 'recordings', userid: 'student@aira',    password: 'aira2025'  },
  ];
  for (const tc of testCases) {
    const cred = await Credential.findOne({ type: tc.type, userid: tc.userid });
    if (!cred) {
      console.log(`  ❌ [${tc.type}] ${tc.userid} — NOT FOUND in DB`);
      continue;
    }
    if (cred.locked) { console.log(`  🔒 [${tc.type}] ${tc.userid} — LOCKED`); continue; }
    const ok = await require('bcryptjs').compare(tc.password, cred.passHash);
    console.log(`  ${ok ? '✅' : '❌'} [${tc.type}] ${tc.userid} / ${tc.password} — ${ok ? 'PASSWORD OK' : 'WRONG PASSWORD'}`);
  }

  console.log('\n═══════════════════════════════════');
  console.log('  Test complete! Start server with:');
  console.log('  cd backend && npm run dev');
  console.log('  Then open: http://127.0.0.1:5500');
  console.log('═══════════════════════════════════\n');

  await mongoose.disconnect();
}

testAll().catch(err => { console.error('Fatal:', err); process.exit(1); });
