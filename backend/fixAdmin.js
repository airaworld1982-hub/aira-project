require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Admin.deleteMany({});
  await Admin.create({
    username: 'admin',
    password: 'aira2020@@',
    email: 'admin@airaworld.org',
    role: 'superadmin'
  });
  console.log('Admin created with password: aira2020@@');
  process.exit();
});
