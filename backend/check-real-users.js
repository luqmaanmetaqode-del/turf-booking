const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkRealUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all real users (not test accounts)
    const users = await User.find({}).select('name phone email role createdAt');
    
    console.log(`\n📊 Total users in database: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    console.log('\n👥 Real Users in Database:');
    console.log('='.repeat(60));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   📱 Phone: ${user.phone}`);
      console.log(`   📧 Email: ${user.email || 'No Email'}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt?.toLocaleDateString() || 'Unknown'}`);
      console.log('');
    });

    // Check for users without passwords
    const usersWithoutPassword = await User.find({ 
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    }).select('name phone role');

    if (usersWithoutPassword.length > 0) {
      console.log('⚠️  Users without passwords (cannot login):');
      usersWithoutPassword.forEach(user => {
        console.log(`   - ${user.name} (${user.phone}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkRealUsers();