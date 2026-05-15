require('dotenv').config();
const mongoose = require('mongoose');
const Turf = require('./models/Turf');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/turfx';

async function checkTurfs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allTurfs = await Turf.find({});
    console.log(`\n📊 Total turfs in database: ${allTurfs.length}`);

    if (allTurfs.length === 0) {
      console.log('\n❌ No turfs found in database!');
      console.log('Run: node seed-data.js to create sample turfs');
    } else {
      console.log('\n📋 Turfs list:');
      allTurfs.forEach((turf, index) => {
        console.log(`\n${index + 1}. ${turf.name}`);
        console.log(`   Location: ${turf.location}, ${turf.city}`);
        console.log(`   Sport: ${turf.sport}`);
        console.log(`   Price: ₹${turf.price_per_hour}/hour`);
        console.log(`   Active: ${turf.isActive ? '✅ Yes' : '❌ No'}`);
        console.log(`   Owner ID: ${turf.owner_id}`);
      });

      const activeTurfs = allTurfs.filter(t => t.isActive);
      console.log(`\n✅ Active turfs: ${activeTurfs.length}`);
      console.log(`❌ Inactive turfs: ${allTurfs.length - activeTurfs.length}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkTurfs();
