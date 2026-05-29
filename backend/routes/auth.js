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

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: 'First name is required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      return res.status(400).json({ msg: 'Name must be 50 characters or less' });
    }
    if (!/^[a-zA-Z\s'.,-]{2,50}$/.test(trimmedName)) {
      return res.status(400).json({ msg: 'Name can only contain letters, spaces, and basic punctuation' });
    }

    // Check if phone already exists
    const existing = await User.findOne({ phone: phone.toString() });
    if (existing) {
      return res.status(400).json({ msg: 'An account with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user object — role is always 'user' regardless of what client sends
    const userData = {
      name: trimmedName,
      phone: phone.toString(),
      password: hashedPassword,
      role: 'user',
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

// POST /api/auth/forgot-password — Send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ msg: 'Phone number is required' });
    }

    const user = await User.findOne({ phone: phone.toString() });
    if (!user) {
      return res.status(400).json({ msg: 'No account found with this phone number' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via SMS (you can implement SMS service here)
    console.log(`Password reset OTP for ${phone}: ${otp}`);

    res.json({ msg: 'OTP sent to your phone number' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error during password reset request' });
  }
});

// POST /api/auth/reset-password — Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ msg: 'Phone, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ phone: phone.toString() });
    if (!user) {
      return res.status(400).json({ msg: 'No account found with this phone number' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ msg: 'No password reset request found. Please request a new OTP.' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error during password reset' });
  }
});

// POST /api/auth/logout — Invalidate token (client-side blacklist via short expiry signal)
router.post('/logout', auth, async (req, res) => {
  try {
    // JWTs are stateless — we signal the client to clear its token.
    // For true server-side invalidation a token blacklist (Redis) would be needed.
    // This endpoint exists so clients can call it and get a 200 confirmation.
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error during logout' });
  }
});

module.exports = router;
