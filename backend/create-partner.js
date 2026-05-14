require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/turfx';

async function create() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const phone = process.env.SEED_OWNER_PHONE || '+917019615646';
    const password = process.env.SEED_OWNER_PASSWORD || 'password123';
    const role = 'owner';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findOneAndUpdate(
      { phone },
      {
        name: process.env.SEED_OWNER_NAME || 'Admin Partner',
        email: process.env.SEED_OWNER_EMAIL || 'partner@turfx.local',
        password: hashedPassword,
        role,
      },
      { upsert: true, new: true }
    );

    console.log('Success! Partner account created/updated.');
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${password}`);
    console.log("Go to /partner/login, select 'Password', and use these details.");

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

create();
