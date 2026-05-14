const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration...\n');
    
    const res = await axios.post('http://localhost:5001/api/auth/register-password', {
      name: 'Test User',
      phone: '+919876543210',
      password: 'test123',
      role: 'user'
    });
    
    console.log('✅ Registration successful!');
    console.log('Token:', res.data.token.substring(0, 50) + '...');
    console.log('User:', res.data.user);
  } catch (err) {
    console.log('❌ Registration failed!');
    console.log('Status:', err.response?.status);
    console.log('Error:', err.response?.data || err.message);
    
    if (err.response?.data?.error) {
      console.log('\n🔍 Detailed error:', err.response.data.error);
    }
  }
}

testRegistration();
