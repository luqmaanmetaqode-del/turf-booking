/**
 * Run this script ONCE to drop the old sparse/unique indexes
 * Usage: node fix-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    const indexesToDrop = ['email_1', 'googleUid_1', 'phone_1'];

    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (e) {
        if (e.code === 27) {
          console.log(`ℹ️  Index ${indexName} does not exist (already clean)`);
        } else {
          console.log(`⚠️  Could not drop ${indexName}:`, e.message);
        }
      }
    }

    const newIndexes = await collection.indexes();
    console.log('\nFinal indexes:');
    newIndexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

    console.log('\n✅ Done! Restart your backend server now.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
