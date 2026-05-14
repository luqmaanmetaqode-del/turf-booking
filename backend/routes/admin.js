const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Turf = require('../models/Turf');

// Middleware: admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  next();
};

// GET /api/admin/revenue — Full platform revenue breakdown
router.get('/revenue', auth, adminOnly, async (req, res) => {
  try {
    const PLATFORM_FEE = 25;       // flat ₹25 per booking
    const GST_RATE = 0.18;         // 18% GST on platform fee
    const GST_PER_BOOKING = Math.round(PLATFORM_FEE * GST_RATE); // ₹5 (rounded)
    const TOTAL_FEE_PER_BOOKING = PLATFORM_FEE + GST_PER_BOOKING; // ₹30

    // Fetch all confirmed bookings with user + turf info
    const bookings = await Booking.find({ status: 'confirmed' })
      .populate('user_id', 'name phone email')
      .populate('turf_id', 'name location owner_id')
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalGMV = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0); // Gross Merchandise Value
    const totalPlatformFee = totalBookings * PLATFORM_FEE;
    const totalGST = totalBookings * GST_PER_BOOKING;
    const totalRevenue = totalBookings * TOTAL_FEE_PER_BOOKING;

    // Monthly breakdown
    const monthlyMap = {};
    bookings.forEach(b => {
      const d = new Date(b.createdAt || b.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, bookings: 0, gmv: 0, platformFee: 0, gst: 0, revenue: 0 };
      }
      monthlyMap[key].bookings += 1;
      monthlyMap[key].gmv += b.total_price || 0;
      monthlyMap[key].platformFee += PLATFORM_FEE;
      monthlyMap[key].gst += GST_PER_BOOKING;
      monthlyMap[key].revenue += TOTAL_FEE_PER_BOOKING;
    });

    const monthly = Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));

    // Per-turf breakdown
    const turfMap = {};
    bookings.forEach(b => {
      const turfId = b.turf_id?._id?.toString() || 'unknown';
      const turfName = b.turf_id?.name || 'Unknown Turf';
      if (!turfMap[turfId]) {
        turfMap[turfId] = { turfId, turfName, bookings: 0, gmv: 0, platformFee: 0, gst: 0, revenue: 0 };
      }
      turfMap[turfId].bookings += 1;
      turfMap[turfId].gmv += b.total_price || 0;
      turfMap[turfId].platformFee += PLATFORM_FEE;
      turfMap[turfId].gst += GST_PER_BOOKING;
      turfMap[turfId].revenue += TOTAL_FEE_PER_BOOKING;
    });

    const perTurf = Object.values(turfMap).sort((a, b) => b.revenue - a.revenue);

    // Recent transactions (last 20)
    const recentTransactions = bookings.slice(0, 20).map(b => ({
      bookingId: b._id,
      bookingRef: b._id.toString().slice(-6).toUpperCase(),
      userName: b.user_id?.name || 'Unknown',
      userPhone: b.user_id?.phone || '—',
      turfName: b.turf_id?.name || 'Unknown',
      date: b.date,
      timeSlot: b.time_slot,
      courtAmount: (b.total_price || 0) - TOTAL_FEE_PER_BOOKING,
      platformFee: PLATFORM_FEE,
      gst: GST_PER_BOOKING,
      totalPaid: b.total_price || 0,
      createdAt: b.createdAt,
    }));

    // User stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await User.countDocuments({ role: 'owner' });
    const totalTurfs = await Turf.countDocuments({});

    res.json({
      summary: {
        totalBookings,
        totalGMV,
        totalPlatformFee,
        totalGST,
        totalRevenue,
        totalUsers,
        totalPartners,
        totalTurfs,
        platformFeePerBooking: PLATFORM_FEE,
        gstPerBooking: GST_PER_BOOKING,
        totalFeePerBooking: TOTAL_FEE_PER_BOOKING,
      },
      monthly,
      perTurf,
      recentTransactions,
    });
  } catch (err) {
    console.error('Admin revenue error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/admin/users — All users list
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -otpExpiry').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
