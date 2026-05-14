require('dotenv').config();
const emailService = require('./services/emailService');

// Test data
const testBooking = {
  _id: 'TEST123456789',
  total_price: 1000,
  date: new Date(),
  time_slot: '06:00-07:00'
};

const testUser = {
  name: 'Test User',
  email: 'sup.brightmindsacademy@gmail.com'
};

const testTurf = {
  name: 'Test Turf Arena',
  location: 'Koramangala',
  city: 'Bengaluru'
};

console.log('📧 Testing email service...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');

emailService.sendBookingConfirmation(testBooking, testUser, testTurf)
  .then(result => {
    if (result.success) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log('Message ID:', result.messageId);
      console.log('\n📬 Check your inbox:', testUser.email);
    } else {
      console.log('❌ EMAIL FAILED:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  });
