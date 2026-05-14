const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected!');

    const phone = '+919980998199';
    const user = await User.findOne({ phone });

    if (user) {
      await User.deleteOne({ phone });
      console.log('\n✅ User deleted successfully!');
      console.log('Phone:', phone);
      console.log('\nYou can now register with this phone number.');
    } else {
      console.log('\n❌ No user found with phone:', phone);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

deleteUser();
