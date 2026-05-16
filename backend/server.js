const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');
const admin = require('firebase-admin');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput, preventXSS } = require('./middleware/sanitize');

try {
  const serviceAccount = require('./firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin Initialized');
} catch (err) {
  console.log('Firebase Admin not initialized: firebase-service-account.json missing or invalid');
}

const app = express();

// Security middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://turfx.metaqode.co.in', 'https://www.turfx.metaqode.co.in']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '150mb' })); // Increased limit for base64 images and videos
app.use(express.urlencoded({ limit: '150mb', extended: true }));
app.use(sanitizeInput); // Prevent NoSQL injection
app.use(preventXSS); // Prevent XSS attacks
app.use('/api/', apiLimiter); // Rate limiting

// Create upload directories if they don't exist
const uploadDirs = ['uploads/kyc', 'uploads/reviews', 'uploads/turfs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/turfs', require('./routes/turfs'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/support', require('./routes/support'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/slot-locking', require('./routes/slot-locking'));
app.use('/api/payouts', require('./routes/payouts'));

// Cleanup expired slot locks every 5 minutes
setInterval(async () => {
  try {
    const Slot = require('./models/Slot');
    const now = new Date();
    const result = await Slot.updateMany(
      { is_locked: true, locked_until: { $lt: now } },
      { $set: { is_locked: false, locked_by: null, locked_until: null } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🔓 Cleaned up ${result.modifiedCount} expired slot locks`);
    }
  } catch (err) {
    console.error('Error cleaning up expired locks:', err);
  }
}, 5 * 60 * 1000); // Every 5 minutes

// Initialize automated payout scheduler
const payoutService = require('./services/payoutService');
payoutService.scheduleWeeklyPayouts();

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
