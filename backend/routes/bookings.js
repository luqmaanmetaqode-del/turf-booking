const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const emailService = require('../services/emailService');
const { bookingLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

// Direct booking (no approval needed) - for multi-slot bookings
router.post('/direct', auth, bookingLimiter, async (req, res) => {
  try {
    const { turf_id, date, time_slots, total_price, payment_id } = req.body;
    if (!turf_id || !date || !time_slots || !Array.isArray(time_slots) || time_slots.length === 0 || !total_price) {
      return res.status(400).json({ msg: 'Booking details are required' });
    }

    // Check if any of the selected slots are already booked
    const existingBookings = await Booking.find({
      turf_id,
      date,
      status: { $in: ['confirmed'] }
    });

    const bookedSlots = existingBookings.flatMap(b => b.time_slots);
    const conflictingSlots = time_slots.filter(slot => bookedSlots.includes(slot));

    if (conflictingSlots.length > 0) {
      return res.status(400).json({ 
        msg: `The following slots are already booked: ${conflictingSlots.join(', ')}` 
      });
    }

    // Mark all slots as booked
    for (const slot of time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id, date, time_slot: slot },
        { is_booked: true, is_locked: false, locked_until: null },
        { upsert: true }
      );
    }

    // Create confirmed booking
    const booking = await Booking.create({
      user_id: req.user.id,
      turf_id,
      date,
      time_slots,
      total_price,
      payment_id,
      status: 'confirmed',
      payment_status: 'paid'
    });

    const populatedBooking = await booking.populate('turf_id user_id');
    
    // Send confirmation emails
    const turf = await Turf.findById(turf_id).populate('owner_id');
    const user = await User.findById(req.user.id);
    
    if (user) {
      emailService.sendBookingConfirmation(populatedBooking, user, turf).catch(err => 
        console.error('Email error:', err)
      );
    }
    
    if (turf.owner_id) {
      emailService.sendPartnerNewBooking(populatedBooking, turf.owner_id, turf, user).catch(err => 
        console.error('Partner email error:', err)
      );
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create booking request (pending approval)
router.post('/request', auth, bookingLimiter, async (req, res) => {
  try {
    const { turf_id, date, time_slots, total_price } = req.body;
    if (!turf_id || !date || !time_slots || !Array.isArray(time_slots) || time_slots.length === 0 || !total_price) {
      return res.status(400).json({ msg: 'Booking details are required' });
    }

    // Check if any of the selected slots are already booked
    const existingBookings = await Booking.find({
      turf_id,
      date,
      status: { $in: ['pending', 'approved', 'confirmed'] }
    });

    const bookedSlots = existingBookings.flatMap(b => b.time_slots);
    const conflictingSlots = time_slots.filter(slot => bookedSlots.includes(slot));

    if (conflictingSlots.length > 0) {
      return res.status(400).json({ 
        msg: `The following slots are already booked: ${conflictingSlots.join(', ')}` 
      });
    }

    // Create booking request with pending status
    const booking = await Booking.create({
      user_id: req.user.id,
      turf_id,
      date,
      time_slots,
      total_price,
      status: 'pending',
      payment_status: 'unpaid'
    });

    const populatedBooking = await booking.populate('turf_id user_id');
    
    // Send notification to partner (email)
    const turf = await Turf.findById(turf_id).populate('owner_id');
    const user = await User.findById(req.user.id);
    
    if (turf.owner_id) {
      emailService.sendPartnerBookingRequest(populatedBooking, turf.owner_id, turf, user).catch(err => 
        console.error('Partner email error:', err)
      );
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Partner approves booking
router.put('/approve/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    // Check if user is the turf owner
    if (booking.turf_id.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ msg: 'Booking is not pending' });
    }

    booking.status = 'approved';
    booking.approved_at = new Date();
    await booking.save();

    // Send notification to user
    const user = await User.findById(booking.user_id);
    emailService.sendBookingApproved(booking, user, booking.turf_id).catch(err => 
      console.error('Email error:', err)
    );

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Partner rejects booking
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    // Check if user is the turf owner
    if (booking.turf_id.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ msg: 'Booking is not pending' });
    }

    booking.status = 'rejected';
    booking.rejected_at = new Date();
    booking.rejection_reason = reason || 'No reason provided';
    await booking.save();

    // Send notification to user
    const user = await User.findById(booking.user_id);
    emailService.sendBookingRejected(booking, user, booking.turf_id, reason).catch(err => 
      console.error('Email error:', err)
    );

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// User pays for approved booking
router.post('/pay/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ msg: 'Booking must be approved before payment' });
    }

    const { payment_id } = req.body;

    // Mark all slots as booked
    for (const slot of booking.time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id: booking.turf_id, date: booking.date, time_slot: slot },
        { is_booked: true, is_locked: false, locked_until: null },
        { upsert: true }
      );
    }

    booking.status = 'confirmed';
    booking.payment_status = 'paid';
    booking.payment_id = payment_id;
    await booking.save();

    // Send confirmation emails
    const user = await User.findById(req.user.id);
    const turf = await Turf.findById(booking.turf_id).populate('owner_id');
    const populatedBooking = await booking.populate('turf_id user_id');
    
    emailService.sendBookingConfirmation(populatedBooking, user, turf).catch(err => 
      console.error('Email error:', err)
    );

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/razorpay-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(`💳 Creating order for amount: ${amount}`);
    
    // Support demo mode for testing without real keys
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' || !process.env.RAZORPAY_KEY_ID) {
      return res.json({
        id: "order_demo_" + Date.now(),
        amount: Math.round(amount * 100),
        currency: "INR",
        demo: true
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ msg: 'Failed to create order' });
  }
});

router.post('/', auth, bookingLimiter, async (req, res) => {
  try {
    // This endpoint is deprecated - use /request instead
    return res.status(400).json({ msg: 'Please use /bookings/request endpoint' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate('turf_id')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/cancel/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking already cancelled' });
    }

    // Calculate refund based on cancellation policy
    const bookingDateTime = new Date(`${booking.date} ${booking.time_slots[0].split('-')[0]}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let refundPolicy = '';

    if (hoursUntilBooking >= 24) {
      refundPercentage = 100;
      refundPolicy = 'Free cancellation (24+ hours before)';
    } else if (hoursUntilBooking >= 6) {
      refundPercentage = 50;
      refundPolicy = '50% refund (6-24 hours before)';
    } else if (hoursUntilBooking >= 0) {
      refundPercentage = 0;
      refundPolicy = 'No refund (less than 6 hours before)';
    } else {
      return res.status(400).json({ msg: 'Cannot cancel past bookings' });
    }

    const refundAmount = Math.round((booking.total_price * refundPercentage) / 100);
    
    // Free all slots
    for (const slot of booking.time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id: booking.turf_id, date: booking.date, time_slot: slot },
        { is_booked: false }
      );
    }

    // Update booking
    booking.status = 'cancelled';
    booking.refund_amount = refundAmount;
    booking.refund_status = refundAmount > 0 ? 'pending' : 'none';
    booking.cancelled_at = new Date();
    booking.cancellation_reason = req.body.reason || 'User cancelled';
    await booking.save();

    // Process refund if applicable (Razorpay refund)
    if (refundAmount > 0 && booking.payment_id && booking.payment_id !== 'demo' && !booking.payment_id.startsWith('demo_')) {
      try {
        const refund = await razorpay.payments.refund(booking.payment_id, {
          amount: refundAmount * 100, // amount in paise
          speed: 'normal',
          notes: {
            booking_id: booking._id.toString(),
            refund_policy: refundPolicy
          }
        });
        
        booking.refund_id = refund.id;
        booking.refund_status = 'processed';
        await booking.save();
      } catch (refundErr) {
        console.error('Refund error:', refundErr);
        booking.refund_status = 'failed';
        await booking.save();
      }
    }
    
    // Send cancellation email
    const user = await User.findById(req.user.id);
    emailService.sendBookingCancellation(booking, user, booking.turf_id, refundAmount).catch(err => 
      console.error('Email error:', err)
    );
    
    res.json({ 
      msg: 'Booking cancelled successfully',
      refundAmount,
      refundPercentage,
      refundPolicy,
      refundStatus: booking.refund_status,
      booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/reschedule/:id', auth, async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // 1. Check if new slot is available
    const configuredSlots = await Slot.find({ turf_id: booking.turf_id, date: newDate, created_by_owner: true });
    if (configuredSlots.length > 0 && !configuredSlots.some(slot => slot.time_slot === newTimeSlot)) {
      return res.status(400).json({ msg: 'Selected slot is not configured for this date' });
    }

    const existingSlot = await Slot.findOne({ turf_id: booking.turf_id, date: newDate, time_slot: newTimeSlot });
    if (existingSlot && existingSlot.is_booked) {
      return res.status(400).json({ msg: 'Selected slot is already booked' });
    }

    // 2. Free old slot
    await Slot.findOneAndUpdate(
      { turf_id: booking.turf_id, date: booking.date, time_slot: booking.time_slot },
      { is_booked: false }
    );

    // 3. Book new slot
    await Slot.findOneAndUpdate(
      { turf_id: booking.turf_id, date: newDate, time_slot: newTimeSlot },
      { is_booked: true, is_locked: false, locked_until: null },
      { upsert: true }
    );

    // 4. Update booking
    booking.date = newDate;
    booking.time_slot = newTimeSlot;
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get booked slots for a turf on a specific date
router.get('/booked-slots/:turfId/:date', async (req, res) => {
  try {
    const { turfId, date } = req.params;
    
    // Find all confirmed/approved/pending bookings for this turf and date
    const bookings = await Booking.find({
      turf_id: turfId,
      date: date,
      status: { $in: ['pending', 'approved', 'confirmed'] }
    }).select('time_slots');
    
    // Extract all booked slots (flatten the arrays)
    const bookedSlots = bookings.flatMap(b => b.time_slots);
    
    res.json({ bookedSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get pending bookings for partner
router.get('/partner/pending', auth, async (req, res) => {
  try {
    // Find all turfs owned by this partner
    const turfs = await Turf.find({ owner_id: req.user.id });
    const turfIds = turfs.map(t => t._id);

    // Find all pending bookings for these turfs
    const bookings = await Booking.find({
      turf_id: { $in: turfIds },
      status: 'pending'
    })
      .populate('turf_id user_id')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
