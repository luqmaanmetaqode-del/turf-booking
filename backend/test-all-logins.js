const axios = require('axios');

const API = 'https://turfx.metaqode.co.in/api';

async function testAllLogins() {
  console.log('🧪 Testing All Login Types...\n');

  const accounts = [
    { type: 'User', phone: '+919876543210', password: 'user123', expectedRole: 'user' },
    { type: 'Partner', phone: '+919876543211', password: 'partner123', expectedRole: 'owner' },
    { type: 'Admin', phone: '+919876543212', password: 'admin123', expectedRole: 'admin' }
  ];

  for (const account of accounts) {
    console.log(`🔐 Testing ${account.type} Login...`);
    try {
      const response = await axios.post(`${API}/auth/password-login`, {
        phone: account.phone,
        password: account.password
      });

      if (response.status === 200) {
        const user = response.data.user;
        console.log(`✅ ${account.type} login successful!`);
        console.log(`   📱 Phone: ${user.phone}`);
        console.log(`   👤 Name: ${user.name}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   🔑 Token: ${response.data.token ? 'Received' : 'Missing'}`);
        
        if (user.role === account.expectedRole) {
          console.log(`   ✅ Role matches expected (${account.expectedRole})`);
        } else {
          console.log(`   ❌ Role mismatch! Expected: ${account.expectedRole}, Got: ${user.role}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${account.type} login failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.msg || error.message}`);
    }
    console.log(''); // Empty line for readability
  }

  console.log('🎯 Login Test Summary:');
  console.log('If all tests passed, the backend login is working correctly.');
  console.log('If login fails on the website but works here, the issue is in the frontend.');
}

testAllLogins().catch(console.error);