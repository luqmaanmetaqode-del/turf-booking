const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/turfx';

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop the problematic email index if it exists
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('Successfully dropped stale email index');
    } catch (e) {
      console.log('Index email_1 not found or already dropped');
    }

    // Also drop all other indexes except _id to be safe
    // try {
    //   await mongoose.connection.collection('users').dropIndexes();
    //   console.log('Dropped all indexes for clean start');
    // } catch (e) {}

    console.log('Fix complete. You can now restart the server.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fix();
