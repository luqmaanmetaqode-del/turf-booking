const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createTestAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test user account
    const userPassword = await bcrypt.hash('user123', 10);
    const testUser = {
      name: 'Test User',
      phone: '+919876543210',
      email: 'testuser@example.com',
      password: userPassword,
      role: 'user'
    };

    // Create test partner account
    const partnerPassword = await bcrypt.hash('partner123', 10);
    const testPartner = {
      name: 'Test Partner',
      phone: '+919876543211',
      email: 'testpartner@example.com',
      password: partnerPassword,
      role: 'owner'
    };

    // Create test admin account
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testAdmin = {
      name: 'Test Admin',
      phone: '+919876543212',
      email: 'testadmin@example.com',
      password: adminPassword,
      role: 'admin'
    };

    // Insert or update accounts
    for (const account of [testUser, testPartner, testAdmin]) {
      const existing = await User.findOne({ phone: account.phone });
      if (existing) {
        await User.updateOne({ phone: account.phone }, account);
        console.log(`🔄 Updated ${account.role}: ${account.phone}`);
      } else {
        await User.create(account);
        console.log(`✅ Created ${account.role}: ${account.phone}`);
      }
    }

    console.log('\n🎯 Test Accounts Created/Updated:');
    console.log('👤 User Login: +919876543210 / user123');
    console.log('🏢 Partner Login: +919876543211 / partner123');
    console.log('👑 Admin Login: +919876543212 / admin123');

    console.log('\n📝 Test these on your website:');
    console.log('• User: https://turfx.metaqode.co.in/login');
    console.log('• Partner: https://turfx.metaqode.co.in/partner/login');
    console.log('• Admin: https://turfx.metaqode.co.in/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestAccounts();