require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const owners = await db.collection('users').find({ role: 'owner' }).toArray();
  const primaryOwner = owners[0];

  // Fix ALL turfs regardless - assign any without owner to primary owner
  const result = await db.collection('turves').updateMany(
    {},
    [{ $set: { owner_id: { $ifNull: ['$owner_id', primaryOwner._id] } } }]
  );
  console.log(`Updated ${result.modifiedCount} turfs`);

  // Verify all turfs now have owner
  const turfs = await db.collection('turves').find({}).toArray();
  console.log('\nAll turfs:');
  turfs.forEach(t => console.log(`  ${t.name} → owner: ${t.owner_id || 'STILL MISSING'}`));

  process.exit(0);
}

fix().catch(e => { console.error(e.message); process.exit(1); });
