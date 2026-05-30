const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetUserPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Set simple passwords for your main users
    const userUpdates = [
      { phone: '+917019615646', password: '123456', name: 'Admin Partner' },
      { phone: '+918431322578', password: '123456', name: 'Anees usmani' },
      { phone: '+918088305936', password: '123456', name: 'Poorvika R' },
      { phone: '+918618691273', password: '123456', name: 'poorvika' },
      { phone: '+917899886601', password: '123456', name: 'rayyan usmani' },
      { phone: '+919481004419', password: '123456', name: 'USMANIYA INERNATIONAL' },
      { phone: '+917899316996', password: '123456', name: 'kumar govind' },
      { phone: '+919980998199', password: '123456', name: 'zakir usmani' },
      { phone: '+919902966785', password: '123456', name: 'ZAKIR USMANI' },
      { phone: '+917798576858', password: '123456', name: 'ZAKIR USMANI' }
    ];

    console.log('🔐 Resetting passwords to "123456" for all users...\n');

    for (const userData of userUpdates) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const result = await User.updateOne(
          { phone: userData.phone },
          { 
            password: hashedPassword,
            // Clear any OTP data
            $unset: { otp: 1, otpExpiry: 1 }
          }
        );

        if (result.matchedCount > 0) {
          console.log(`✅ ${userData.name} (${userData.phone}) - Password reset to: ${userData.password}`);
        } else {
          console.log(`❌ ${userData.name} (${userData.phone}) - User not found`);
        }
      } catch (error) {
        console.log(`❌ ${userData.name} (${userData.phone}) - Error: ${error.message}`);
      }
    }

    console.log('\n🎯 All users can now login with password: 123456');
    console.log('\n📝 Test Login:');
    console.log('• Partner: +917019615646 / 123456');
    console.log('• User: +918431322578 / 123456');
    console.log('\n🌐 Login URLs:');
    console.log('• User Login: https://turfx.metaqode.co.in/login');
    console.log('• Partner Login: https://turfx.metaqode.co.in/partner/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

resetUserPasswords();