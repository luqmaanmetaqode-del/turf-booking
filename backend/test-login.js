const axios = require('axios');

const API = 'https://turfx.metaqode.co.in/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  // Test 1: Register a new user
  console.log('1️⃣ Testing Registration...');
  try {
    const regResponse = await axios.post(`${API}/auth/register-password`, {
      name: 'Test User',
      phone: '+919876543210',
      password: 'test123456',
      email: 'test@example.com'
    });
    console.log('✅ Registration successful:', regResponse.status);
    console.log('📝 User created:', regResponse.data.user.name);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.msg?.includes('already exists')) {
      console.log('ℹ️ User already exists, continuing with login test...');
    } else {
      console.log('❌ Registration failed:', err.response?.status, err.response?.data?.msg || err.message);
    }
  }

  // Test 2: Login with the user
  console.log('\n2️⃣ Testing User Login...');
  try {
    const loginResponse = await axios.post(`${API}/auth/password-login`, {
      phone: '+919876543210',
      password: 'test123456'
    });
    console.log('✅ User login successful:', loginResponse.status);
    console.log('👤 User role:', loginResponse.data.user.role);
    console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
  } catch (err) {
    console.log('❌ User login failed:', err.response?.status, err.response?.data?.msg || err.message);
  }

  // Test 3: Test partner login (if partner exists)
  console.log('\n3️⃣ Testing Partner Login...');
  try {
    const partnerResponse = await axios.post(`${API}/auth/password-login`, {
      phone: '+919876543211', // Different number for partner
      password: 'partner123'
    });
    console.log('✅ Partner login successful:', partnerResponse.status);
    console.log('👤 Partner role:', partnerResponse.data.user.role);
  } catch (err) {
    console.log('❌ Partner login failed:', err.response?.status, err.response?.data?.msg || err.message);
    console.log('ℹ️ This is expected if no partner account exists');
  }

  // Test 4: Test wrong credentials
  console.log('\n4️⃣ Testing Wrong Credentials...');
  try {
    await axios.post(`${API}/auth/password-login`, {
      phone: '+919876543210',
      password: 'wrongpassword'
    });
    console.log('❌ Security issue: Wrong password accepted!');
  } catch (err) {
    if (err.response?.status === 400) {
      console.log('✅ Security working: Wrong password rejected');
    } else {
      console.log('❓ Unexpected error:', err.response?.status, err.response?.data?.msg);
    }
  }

  console.log('\n🏁 Login tests completed!');
}

testLogin().catch(console.error);