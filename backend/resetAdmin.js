require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
await Admin.deleteMany({});
console.log('Old admin deleted');
process.exit();
});
