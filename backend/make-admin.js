require('dotenv').config();
const mongoose = require('mongoose');

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Show all users first
  const users = await db.collection('users').find({}).toArray();
  console.log('=== ALL USERS ===');
  users.forEach(u => console.log(`  ${u._id} | ${u.name || '(no name)'} | ${u.phone || '(no phone)'} | role: ${u.role}`));

  // Make the phone number an admin — change this to YOUR phone
  const targetPhone = process.argv[2];
  if (!targetPhone) {
    console.log('\nUsage: node make-admin.js +919980998199');
    console.log('Pass your phone number as argument');
    process.exit(0);
  }

  const result = await db.collection('users').updateOne(
    { phone: targetPhone },
    { $set: { role: 'admin' } }
  );

  if (result.matchedCount === 0) {
    console.log(`\n❌ No user found with phone: ${targetPhone}`);
  } else {
    console.log(`\n✅ Role updated to "admin" for phone: ${targetPhone}`);
  }

  // Show updated list
  const updated = await db.collection('users').findOne({ phone: targetPhone });
  if (updated) console.log(`   Name: ${updated.name}, Role: ${updated.role}`);

  process.exit(0);
}

makeAdmin().catch(e => { console.error(e.message); process.exit(1); });
