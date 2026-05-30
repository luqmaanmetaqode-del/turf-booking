const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check users with and without passwords
    const allUsers = await User.find({}).select('name phone role password');
    
    console.log('\n🔐 Password Status for All Users:');
    console.log('='.repeat(60));
    
    let usersWithPassword = 0;
    let usersWithoutPassword = 0;
    
    allUsers.forEach((user, index) => {
      const hasPassword = user.password && user.password.length > 0;
      const status = hasPassword ? '✅ HAS PASSWORD' : '❌ NO PASSWORD';
      
      console.log(`${index + 1}. ${user.name || 'No Name'} (${user.phone})`);
      console.log(`   Role: ${user.role} | Status: ${status}`);
      
      if (hasPassword) {
        usersWithPassword++;
      } else {
        usersWithoutPassword++;
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`✅ Users with passwords: ${usersWithPassword}`);
    console.log(`❌ Users without passwords: ${usersWithoutPassword}`);
    
    if (usersWithoutPassword > 0) {
      console.log('\n⚠️  ISSUE FOUND: Some users cannot login because they have no password!');
      console.log('💡 Solution: These users need to use "Forgot Password" to set a password.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPasswords();