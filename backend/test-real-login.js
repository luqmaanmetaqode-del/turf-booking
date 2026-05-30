const axios = require('axios');

const API = 'https://turfx.metaqode.co.in/api';

async function testRealLogin() {
  console.log('🔐 Testing Real User Login...\n');

  // Test the main partner account
  console.log('1️⃣ Testing Partner Account (+917019615646)...');
  try {
    const response = await axios.post(`${API}/auth/password-login`, {
      phone: '+917019615646',
      password: 'admin123' // Try common password
    });
    console.log('✅ Partner login successful!');
    console.log(`   Name: ${response.data.user.name}`);
    console.log(`   Role: ${response.data.user.role}`);
  } catch (error) {
    console.log('❌ Partner login failed with admin123');
    console.log(`   Error: ${error.response?.data?.msg}`);
    
    // Try other common passwords
    const commonPasswords = ['partner123', '123456', 'password', 'admin', 'turfx123'];
    
    for (const pwd of commonPasswords) {
      try {
        const response = await axios.post(`${API}/auth/password-login`, {
          phone: '+917019615646',
          password: pwd
        });
        console.log(`✅ Partner login successful with password: ${pwd}`);
        console.log(`   Name: ${response.data.user.name}`);
        console.log(`   Role: ${response.data.user.role}`);
        break;
      } catch (err) {
        console.log(`❌ Failed with password: ${pwd}`);
      }
    }
  }

  console.log('\n2️⃣ Testing User Account (+918431322578)...');
  try {
    const response = await axios.post(`${API}/auth/password-login`, {
      phone: '+918431322578',
      password: 'user123'
    });
    console.log('✅ User login successful!');
    console.log(`   Name: ${response.data.user.name}`);
    console.log(`   Role: ${response.data.user.role}`);
  } catch (error) {
    console.log('❌ User login failed with user123');
    console.log(`   Error: ${error.response?.data?.msg}`);
  }

  console.log('\n💡 If all logins fail, users need to reset their passwords using forgot password feature.');
}

testRealLogin().catch(console.error);