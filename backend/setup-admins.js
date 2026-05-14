require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const admins = [
  { name: 'Zakir Usmani',              phone: '+919980998199', password: 'Meta@2026' },
  { name: 'Luqmaan Usmani',            phone: '+917019615646', password: 'Meta@2026' },
  { name: 'Monisha Gangadhareshwar',   phone: '+918618691273', password: 'Meta@2026' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  for (const admin of admins) {
    const existing = await db.collection('users').findOne({ phone: admin.phone });
    const hashed = await bcrypt.hash(admin.password, 10);

    if (existing) {
      await db.collection('users').updateOne(
        { phone: admin.phone },
        { $set: { name: admin.name, password: hashed, role: 'admin', updatedAt: new Date() } }
      );
      console.log(`✅ Updated → ${admin.name} (${admin.phone}) → role: admin`);
    } else {
      await db.collection('users').insertOne({
        name: admin.name,
        phone: admin.phone,
        password: hashed,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Created → ${admin.name} (${admin.phone}) → role: admin`);
    }
  }

  console.log('\n✅ All admin accounts ready!');
  console.log('Login at: http://localhost:3000/admin/login');
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
