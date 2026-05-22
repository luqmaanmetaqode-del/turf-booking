const express = require('express');
const Booking = require('../models/Booking');

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

const Turf = require('../models/Turf');
const Review = require('../models/Review');
const Offer = require('../models/Offer');
const Slot = require('../models/Slot');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const router = express.Router();

router.get('/dashboard', auth, ownerOnly, async (req, res) => {
  try {
    const turfs = await Turf.find({ owner_id: req.user.id });
    const turfIds = turfs.map(t => t._id);

    const bookings = await Booking.find({ turf_id: { $in: turfIds } })
      .populate('turf_id')
      .populate('user_id', 'name email phone')
      .sort({ createdAt: -1 });

    const totalEarnings = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_price, 0);

    const reviews = await Review.find({ turf_id: { $in: turfIds } })
      .populate('user_id', 'name')
      .populate('turf_id', 'name')
      .sort({ createdAt: -1 });

    const offers = await Offer.find({ turf_id: { $in: turfIds } })
      .populate('turf_id', 'name')
      .sort({ createdAt: -1 });

    const slots = await Slot.find({ turf_id: { $in: turfIds } })
      .populate('turf_id', 'name location')
      .sort({ date: 1, time_slot: 1 });

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    const today = new Date().toISOString().split('T')[0];

    // Upcoming = confirmed future bookings
    const upcomingBookings = bookings.filter(b => b.date >= today && b.status === 'confirmed');
    const upcomingBookingsCount = upcomingBookings.length;
    const totalBookings = bookings.length;

    // Pending approvals = pending status bookings
    const pendingApprovals = bookings.filter(b => b.status === 'pending');

    // Recent activity feed (last 10 events across bookings + reviews)
    const recentActivity = [];

    bookings.slice(0, 10).forEach(b => {
      if (b.status === 'confirmed') {
        recentActivity.push({
          type: 'booking',
          message: `New booking from ${b.user_id?.name || 'Player'} — ${b.turf_id?.name}, ${b.date}`,
          time: timeAgo(b.createdAt),
          createdAt: b.createdAt,
        });
      } else if (b.status === 'cancelled') {
        recentActivity.push({
          type: 'cancel',
          message: `Booking cancelled by ${b.user_id?.name || 'Player'} — ${b.turf_id?.name}, ${b.date}`,
          time: timeAgo(b.createdAt),
          createdAt: b.createdAt,
        });
      }
    });

    reviews.slice(0, 5).forEach(r => {
      recentActivity.push({
        type: 'review',
        message: `${r.rating}★ review received on ${r.turf_id?.name} from ${r.user_id?.name || 'Player'}`,
        time: timeAgo(r.createdAt),
        createdAt: r.createdAt,
      });
    });

    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Notification count: new bookings in last 24h + unread reviews in last 48h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const newBookings = bookings.filter(b => new Date(b.createdAt) > oneDayAgo).length;
    const newReviews = reviews.filter(r => new Date(r.createdAt) > twoDaysAgo).length;
    const notificationCount = newBookings + newReviews;

    res.json({ 
      turfs, 
      bookings, 
      reviews,
      offers,
      slots,
      avgRating,
      totalEarnings, 
      totalBookings, 
      upcomingBookingsCount,
      upcomingBookings: upcomingBookings.slice(0, 5),
      pendingApprovals: pendingApprovals.slice(0, 4),
      recentActivity: recentActivity.slice(0, 5),
      notificationCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update partner profile
router.put('/profile', auth, ownerOnly, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -otp -otpExpiry');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update partner settings (password change)
router.put('/settings/password', auth, ownerOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel a booking (owner side)
router.put('/bookings/cancel/:id', auth, ownerOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    // Verify this booking belongs to one of the owner's turfs
    const turf = await Turf.findOne({ _id: booking.turf_id, owner_id: req.user.id });
    if (!turf) return res.status(403).json({ msg: 'Not authorized' });
    
    // Free the slot
    await Slot.findOneAndUpdate(
      { turf_id: booking.turf_id, date: booking.date, time_slot: booking.time_slot },
      { is_booked: false }
    );
    
    booking.status = 'cancelled';
    await booking.save();
    res.json({ msg: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
