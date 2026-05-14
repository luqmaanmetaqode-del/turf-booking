const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// POST /api/auth/register-password — Register with phone + password
router.post('/register-password', async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;

    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({ msg: 'Phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists
    const existing = await User.findOne({ phone: phone.toString() });
    if (existing) {
      return res.status(400).json({ msg: 'An account with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user object
    const userData = {
      name: name || '',
      phone: phone.toString(),
      password: hashedPassword,
      role: role || 'user',
    };

    // Only set email if provided (avoid null unique index issues)
    if (email && email.trim() !== '') {
      userData.email = email.trim().toLowerCase();
    }

    // Create user using new + save to avoid any hook issues
    const user = new User(userData);
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('=== REGISTER ERROR ===');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);

    // Handle duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({ msg: `An account with this ${field} already exists` });
    }

    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
});

// POST /api/auth/password-login — Login with phone + password
router.post('/password-login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ msg: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone: phone.toString() });
    if (!user) {
      return res.status(400).json({ msg: 'No account found with this phone number' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'This account has no password set. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// POST /api/auth/update-profile — Update name
router.post('/update-profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select('-password -otp -otpExpiry');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update profile' });
  }
});

module.exports = router;
