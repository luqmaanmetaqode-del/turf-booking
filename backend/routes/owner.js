const express = require('express');
const Booking = require('../models/Booking');
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
    const upcomingBookings = bookings.filter(b => b.date >= today && b.status === 'confirmed');
    const upcomingBookingsCount = upcomingBookings.length;
    const totalBookings = bookings.length;

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
