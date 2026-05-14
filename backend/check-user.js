const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected!');

    const phone = '+919980998199';
    const user = await User.findOne({ phone });

    if (user) {
      console.log('\n📱 User found with this phone number:');
      console.log('Name:', user.name);
      console.log('Phone:', user.phone);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Created:', user.createdAt);
      console.log('\n❌ This phone number is already registered!');
      console.log('\n💡 Solutions:');
      console.log('1. Use a different phone number');
      console.log('2. Login with this phone number instead');
      console.log('3. Delete this user from database (run: node delete-user.js)');
    } else {
      console.log('\n✅ No user found with phone:', phone);
      console.log('You can register with this number!');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUser();
