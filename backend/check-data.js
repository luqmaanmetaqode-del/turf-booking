require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  console.log('=== ALL USERS ===');
  const users = await db.collection('users').find({}).toArray();
  users.forEach(u => console.log(JSON.stringify({ _id: u._id, name: u.name, phone: u.phone, role: u.role })));

  console.log('\n=== ALL TURFS (with owner_id) ===');
  const turfs = await db.collection('turves').find({}).toArray();
  turfs.forEach(t => console.log(JSON.stringify({ _id: t._id, name: t.name, owner_id: t.owner_id || 'MISSING' })));

  process.exit(0);
}

check().catch(e => { console.error(e.message); process.exit(1); });
