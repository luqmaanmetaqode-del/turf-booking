const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function testUserCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected!\n');

    const testData = {
      name: 'rayyan usmani',
      phone: '+919980998199',
      password: await bcrypt.hash('test123', 10),
      role: 'user',
    };

    console.log('Testing user creation with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\nAttempting to create user...\n');

    const user = await User.create(testData);

    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('Name:', user.name);
    console.log('Phone:', user.phone);
    console.log('Role:', user.role);

    // Clean up - delete the test user
    await User.deleteOne({ _id: user._id });
    console.log('\n✅ Test user deleted (cleanup)');

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error creating user:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }
    console.error('\nFull error:', err);
    await mongoose.connection.close();
  }
}

testUserCreation();
