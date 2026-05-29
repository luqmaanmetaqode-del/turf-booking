#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:5001/api';
const EXTERNAL_API = 'https://turfx.metaqode.co.in/api';

async function checkHealth() {
  console.log('🏥 TurfX Backend Health Check');
  console.log('================================');
  
  let allGood = true;

  // 1. Check MongoDB Connection
  try {
    console.log('📊 Checking MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB: Connected');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ MongoDB: Failed -', err.message);
    allGood = false;
  }

  // 2. Check Local Server
  try {
    console.log('🖥️  Checking local server (localhost:5001)...');
    const response = await axios.get(`${API_BASE}/auth/register-password`, {
      validateStatus: () => true // Accept any status code
    });
    if (response.status === 404 || response.status === 405) {
      console.log('✅ Local Server: Running (endpoint accessible)');
    } else {
      console.log(`✅ Local Server: Running (status: ${response.status})`);
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('❌ Local Server: Not running (connection refused)');
      allGood = false;
    } else {
      console.log('❌ Local Server: Error -', err.message);
      allGood = false;
    }
  }

  // 3. Check External API (Production)
  try {
    console.log('🌐 Checking external API (turfx.metaqode.co.in)...');
    const response = await axios.get(`${EXTERNAL_API}/auth/register-password`, {
      validateStatus: () => true,
      timeout: 5000
    });
    if (response.status === 404 || response.status === 405) {
      console.log('✅ External API: Running (endpoint accessible)');
    } else {
      console.log(`✅ External API: Running (status: ${response.status})`);
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.response?.status === 502) {
      console.log('❌ External API: Backend not running (502 Bad Gateway)');
      console.log('   → This is the main issue causing login/signup failures');
      allGood = false;
    } else {
      console.log('❌ External API: Error -', err.message);
      allGood = false;
    }
  }

  // 4. Test Auth Endpoints (if local server is running)
  try {
    console.log('🔐 Testing authentication endpoints...');
    
    // Test registration
    const testPhone = '+91' + Math.floor(Math.random() * 9000000000 + 1000000000);
    const regResponse = await axios.post(`${API_BASE}/auth/register-password`, {
      name: 'Health Check User',
      phone: testPhone,
      password: 'test123456',
      email: 'healthcheck@test.com'
    });
    
    if (regResponse.status === 201) {
      console.log('✅ Registration: Working');
      
      // Test login
      const loginResponse = await axios.post(`${API_BASE}/auth/password-login`, {
        phone: testPhone,
        password: 'test123456'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Login: Working');
      } else {
        console.log('❌ Login: Failed');
        allGood = false;
      }
    } else {
      console.log('❌ Registration: Failed');
      allGood = false;
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.log('⚠️  Auth Test: Skipped (server not running)');
    } else {
      console.log('❌ Auth Test: Error -', err.response?.data?.msg || err.message);
    }
  }

  console.log('\n================================');
  if (allGood) {
    console.log('🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('⚠️  Issues detected. Check the errors above.');
    console.log('\n💡 Quick fixes:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Or use PM2: ./start-server-pm2.sh');
    console.log('   3. Check MongoDB connection in .env file');
    process.exit(1);
  }
}

checkHealth().catch(err => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});