require('dotenv').config();
const mongoose = require('mongoose');
const Turf = require('./models/Turf');

const MONGO_URI = process.env.MONGO_URI;

async function testAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected!');

    console.log('\n📊 Testing GET /api/turfs endpoint logic...');
    
    // Simulate the GET /api/turfs request
    const filter = { isActive: true };
    const turfs = await Turf.find(filter);
    
    console.log(`\n✅ Found ${turfs.length} active turfs`);
    
    if (turfs.length === 0) {
      console.log('\n⚠️  No active turfs found!');
      console.log('Checking all turfs (including inactive)...');
      
      const allTurfs = await Turf.find({});
      console.log(`Total turfs in database: ${allTurfs.length}`);
      
      if (allTurfs.length === 0) {
        console.log('\n❌ Database is empty! Run: node seed-data.js');
      } else {
        console.log('\n📋 All turfs:');
        allTurfs.forEach(t => {
          console.log(`  - ${t.name}: isActive = ${t.isActive}`);
        });
      }
    } else {
      console.log('\n📋 Active turfs:');
      turfs.forEach(t => {
        console.log(`  - ${t.name} (${t.location}, ${t.city})`);
      });
    }

    console.log('\n✅ API test completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

testAPI();
