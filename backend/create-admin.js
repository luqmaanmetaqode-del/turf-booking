require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Usage: node create-admin.js <phone> <password>
// Example: node create-admin.js +919999999999 admin123

async function createAdmin() {
  const phone = process.argv[2];
  const password = process.argv[3];

  if (!phone || !password) {
    console.log('Usage: node create-admin.js <phone> <password>');
    console.log('Example: node create-admin.js +919999999999 admin123');
    process.exit(0);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Check if already exists
  const existing = await db.collection('users').findOne({ phone });
  if (existing) {
    // Just upgrade role
    await db.collection('users').updateOne({ phone }, { $set: { role: 'admin' } });
    console.log(`✅ Existing user upgraded to admin: ${phone}`);
    process.exit(0);
  }

  // Create new admin
  const hashed = await bcrypt.hash(password, 10);
  await db.collection('users').insertOne({
    name: 'Admin',
    phone,
    password: hashed,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✅ Admin account created!`);
  console.log(`   Phone: ${phone}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: admin`);
  console.log(`\nLogin at: http://localhost:3000/admin/login`);
  process.exit(0);
}

createAdmin().catch(e => { console.error(e.message); process.exit(1); });
