const express = require('express');
const crypto  = require('crypto');
const Booking = require('../models/Booking');
const Slot    = require('../models/Slot');
const Turf    = require('../models/Turf');
const User    = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const auth    = require('../middleware/auth');
const Razorpay = require('razorpay');
const emailService = require('../services/emailService');
const { bookingLimiter } = require('../middleware/rateLimiter');
const router  = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Calculate fee split for a booking amount.
 * Platform fee: flat ₹25 per booking
 * GST: 18% on platform fee only
 * Partner amount: total_price - platform_fee - gst
 */
function calcSplit(totalPrice) {
  const platformFee = 25;
  const gst         = Math.round(platformFee * 0.18); // ₹4.5 → ₹5
  const partnerAmt  = totalPrice - platformFee - gst;
  return { platformFee, gst, partnerAmt };
}

/**
 * Credit admin wallet and put partner share on HOLD.
 * Called immediately after successful Razorpay payment.
 */
async function recordPaymentWalletEntries(booking, adminUser) {
  const { platformFee, gst, partnerAmt } = calcSplit(booking.total_price);

  // 1. Admin wallet: full amount credited
  await WalletTransaction.create({
    user_id:     adminUser._id,
    booking_id:  booking._id,
    type:        'credit',
    amount:      booking.total_price,
    description: `Payment received – Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
    payment_id:  booking.payment_id,
    status:      'completed',
    meta: { platformFee, gst, partnerAmt },
  });

  // 2. Partner wallet: partner share on HOLD (not yet available)
  await WalletTransaction.create({
    user_id:     booking.turf_id.owner_id,
    booking_id:  booking._id,
    type:        'hold',
    amount:      partnerAmt,
    description: `Booking hold – ${booking.turf_id.name} on ${booking.date}`,
    status:      'pending',   // pending = on hold
    meta: { releaseOn: booking.date },
  });

  // Update booking with split amounts
  booking.platform_fee          = platformFee;
  booking.gst_amount            = gst;
  booking.partner_amount        = partnerAmt;
  booking.partner_wallet_status = 'hold';
  await booking.save();
}

/**
 * Release partner hold → available balance.
 * Called when user checks in OR booking date has passed.
 */
async function releasePartnerHold(booking) {
  if (booking.partner_wallet_status !== 'hold') return;

  // Mark hold txn as completed
  await WalletTransaction.findOneAndUpdate(
    { booking_id: booking._id, type: 'hold' },
    { status: 'completed', description: `Booking released – ${booking.turf_id?.name || ''} on ${booking.date}` }
  );

  // Debit admin wallet for the partner share
  const adminUser = await User.findOne({ role: 'admin' });
  if (adminUser) {
    await WalletTransaction.create({
      user_id:     adminUser._id,
      booking_id:  booking._id,
      type:        'debit',
      amount:      booking.partner_amount,
      description: `Partner payout released – Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
      status:      'completed',
    });
  }

  booking.partner_wallet_status = 'released';
  await booking.save();
}

/* ─────────────────────────────────────────────────────────────
   CREATE RAZORPAY ORDER
───────────────────────────────────────────────────────────── */
router.post('/razorpay-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Demo mode (no real keys)
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
      return res.json({
        id:       'order_demo_' + Date.now(),
        amount:   Math.round(amount * 100),
        currency: 'INR',
        demo:     true,
      });
    }

    console.log(`💳 Creating Razorpay order: ₹${amount} | Key: ${process.env.RAZORPAY_KEY_ID}`);

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  'receipt_' + Date.now(),
    });

    console.log(`✅ Razorpay order created: ${order.id}`);
    res.json(order);
  } catch (err) {
    console.error('❌ Razorpay order error:', JSON.stringify(err?.error || err?.message || err));
    res.status(500).json({ msg: 'Failed to create payment order', detail: err?.error?.description || err?.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   VERIFY RAZORPAY SIGNATURE
───────────────────────────────────────────────────────────── */
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ msg: 'Payment verification failed – invalid signature' });
    }
    res.json({ verified: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   DIRECT BOOKING (payment already done)
   Flow: user pays → Razorpay → this endpoint → wallet split
───────────────────────────────────────────────────────────── */
router.post('/direct', auth, bookingLimiter, async (req, res) => {
  try {
    const { turf_id, date, time_slots, total_price, payment_id,
            razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!turf_id || !date || !Array.isArray(time_slots) || time_slots.length === 0 || !total_price) {
      return res.status(400).json({ msg: 'Booking details are required' });
    }

    // Verify Razorpay signature if real payment (not demo)
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body     = razorpay_order_id + '|' + razorpay_payment_id;
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
        .update(body)
        .digest('hex');
      if (expected !== razorpay_signature) {
        return res.status(400).json({ msg: 'Payment verification failed' });
      }
    }

    // Check slot conflicts
    const existing = await Booking.find({ turf_id, date, status: { $in: ['confirmed'] } });
    const booked   = existing.flatMap(b => b.time_slots);
    const conflict = time_slots.filter(s => booked.includes(s));
    if (conflict.length > 0) {
      return res.status(400).json({ msg: `Slots already booked: ${conflict.join(', ')}` });
    }

    // Mark slots as booked
    for (const slot of time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id, date, time_slot: slot },
        { is_booked: true, is_locked: false, locked_until: null },
        { upsert: true }
      );
    }

    // Create booking
    const booking = await Booking.create({
      user_id:        req.user.id,
      turf_id,
      date,
      time_slots,
      total_price,
      payment_id:     razorpay_payment_id || payment_id || 'demo',
      status:         'confirmed',
      payment_status: 'paid',
    });

    const populated = await Booking.findById(booking._id).populate('turf_id user_id');

    // ── WALLET SPLIT ──
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await recordPaymentWalletEntries(populated, adminUser);
    }

    // Emails
    const turf = await Turf.findById(turf_id).populate('owner_id');
    const user = await User.findById(req.user.id);
    emailService.sendBookingConfirmation(populated, user, turf).catch(() => {});
    if (turf?.owner_id) {
      emailService.sendPartnerNewBooking(populated, turf.owner_id, turf, user).catch(() => {});
    }

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   USER CHECK-IN  →  releases partner hold
───────────────────────────────────────────────────────────── */
router.post('/checkin/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Only the turf owner or admin can mark check-in
    const isOwner = booking.turf_id?.owner_id?.toString() === req.user.id;
    const user    = await User.findById(req.user.id);
    if (!isOwner && user?.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ msg: 'Booking is not confirmed' });
    }

    booking.status        = 'completed';
    booking.checked_in_at = new Date();
    await booking.save();

    await releasePartnerHold(booking);

    res.json({ msg: 'Check-in successful. Partner wallet updated.', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   CANCEL BOOKING  →  refund to user, reverse partner hold
───────────────────────────────────────────────────────────── */
router.put('/cancel/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Already cancelled' });
    }

    // Cancellation policy
    const bookingDateTime  = new Date(`${booking.date}T${booking.time_slots[0]?.split('-')[0]?.trim()}:00`);
    const hoursUntil       = (bookingDateTime - new Date()) / 3600000;
    let refundPct = 0, refundPolicy = '';

    if (hoursUntil >= 24)      { refundPct = 100; refundPolicy = 'Full refund (24h+ before)'; }
    else if (hoursUntil >= 6)  { refundPct = 50;  refundPolicy = '50% refund (6-24h before)'; }
    else if (hoursUntil >= 0)  { refundPct = 0;   refundPolicy = 'No refund (<6h before)'; }
    else return res.status(400).json({ msg: 'Cannot cancel past bookings' });

    const refundAmount = Math.round((booking.total_price * refundPct) / 100);

    // Free slots
    for (const slot of booking.time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id: booking.turf_id, date: booking.date, time_slot: slot },
        { is_booked: false }
      );
    }

    booking.status              = 'cancelled';
    booking.refund_amount       = refundAmount;
    booking.refund_status       = refundAmount > 0 ? 'pending' : 'none';
    booking.cancelled_at        = new Date();
    booking.cancellation_reason = req.body.reason || 'User cancelled';
    booking.partner_wallet_status = 'refunded';
    await booking.save();

    // ── WALLET: reverse partner hold ──
    await WalletTransaction.findOneAndUpdate(
      { booking_id: booking._id, type: 'hold' },
      { status: 'failed', description: `Booking cancelled – hold reversed` }
    );

    // ── WALLET: debit admin wallet for refund ──
    if (refundAmount > 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await WalletTransaction.create({
          user_id:     adminUser._id,
          booking_id:  booking._id,
          type:        'refund',
          amount:      refundAmount,
          description: `Refund issued – Booking #${booking._id.toString().slice(-6).toUpperCase()} (${refundPolicy})`,
          status:      'completed',
        });
      }

      // ── Razorpay refund (real payments only) ──
      const pid = booking.payment_id;
      if (pid && pid !== 'demo' && !pid.startsWith('demo_')) {
        try {
          const refund = await razorpay.payments.refund(pid, {
            amount: refundAmount * 100,
            speed:  'normal',
            notes:  { booking_id: booking._id.toString(), policy: refundPolicy },
          });
          booking.refund_id     = refund.id;
          booking.refund_status = 'processed';
          await booking.save();
        } catch (refErr) {
          console.error('Razorpay refund error:', refErr);
          booking.refund_status = 'failed';
          await booking.save();
        }
      } else {
        // Demo mode – mark as processed
        booking.refund_status = 'processed';
        await booking.save();
      }
    }

    const user = await User.findById(req.user.id);
    emailService.sendBookingCancellation(booking, user, booking.turf_id, refundAmount).catch(() => {});

    res.json({
      msg:          'Booking cancelled',
      refundAmount,
      refundPct,
      refundPolicy,
      refundStatus: booking.refund_status,
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   PARTNER CANCEL BOOKING
───────────────────────────────────────────────────────────── */
router.put('/owner/cancel/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const isOwner = booking.turf_id?.owner_id?.toString() === req.user.id;
    const user    = await User.findById(req.user.id);
    if (!isOwner && user?.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Already cancelled' });
    }

    // Partner cancel = full refund always
    const refundAmount = booking.total_price;

    for (const slot of booking.time_slots) {
      await Slot.findOneAndUpdate(
        { turf_id: booking.turf_id, date: booking.date, time_slot: slot },
        { is_booked: false }
      );
    }

    booking.status                = 'cancelled';
    booking.refund_amount         = refundAmount;
    booking.refund_status         = 'pending';
    booking.cancelled_at          = new Date();
    booking.cancellation_reason   = req.body.reason || 'Partner cancelled';
    booking.partner_wallet_status = 'refunded';
    await booking.save();

    // Reverse partner hold
    await WalletTransaction.findOneAndUpdate(
      { booking_id: booking._id, type: 'hold' },
      { status: 'failed', description: 'Partner cancelled – hold reversed' }
    );

    // Admin wallet debit for full refund
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await WalletTransaction.create({
        user_id:     adminUser._id,
        booking_id:  booking._id,
        type:        'refund',
        amount:      refundAmount,
        description: `Full refund – partner cancelled Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
        status:      'completed',
      });
    }

    // Razorpay refund
    const pid = booking.payment_id;
    if (pid && pid !== 'demo' && !pid.startsWith('demo_')) {
      try {
        const refund = await razorpay.payments.refund(pid, {
          amount: refundAmount * 100,
          speed:  'normal',
        });
        booking.refund_id     = refund.id;
        booking.refund_status = 'processed';
        await booking.save();
      } catch (refErr) {
        console.error('Razorpay refund error:', refErr);
        booking.refund_status = 'failed';
        await booking.save();
      }
    } else {
      booking.refund_status = 'processed';
      await booking.save();
    }

    res.json({ msg: 'Booking cancelled. Full refund issued.', refundAmount, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   PARTNER APPROVE / REJECT
───────────────────────────────────────────────────────────── */
router.put('/approve/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.turf_id.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    if (booking.status !== 'pending') return res.status(400).json({ msg: 'Not pending' });

    booking.status      = 'approved';
    booking.approved_at = new Date();
    await booking.save();

    const user = await User.findById(booking.user_id);
    emailService.sendBookingApproved(booking, user, booking.turf_id).catch(() => {});
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/reject/:id', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('turf_id');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.turf_id.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    if (booking.status !== 'pending') return res.status(400).json({ msg: 'Not pending' });

    booking.status           = 'rejected';
    booking.rejected_at      = new Date();
    booking.rejection_reason = reason || 'No reason provided';
    await booking.save();

    const user = await User.findById(booking.user_id);
    emailService.sendBookingRejected(booking, user, booking.turf_id, reason).catch(() => {});
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   MISC ROUTES
───────────────────────────────────────────────────────────── */
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

router.get('/booked-slots/:turfId/:date', async (req, res) => {
  try {
    const bookings = await Booking.find({
      turf_id: req.params.turfId,
      date:    req.params.date,
      status:  { $in: ['pending', 'approved', 'confirmed'] },
    }).select('time_slots');
    res.json({ bookedSlots: bookings.flatMap(b => b.time_slots) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/partner/pending', auth, async (req, res) => {
  try {
    const turfs   = await Turf.find({ owner_id: req.user.id });
    const turfIds = turfs.map(t => t._id);
    const bookings = await Booking.find({ turf_id: { $in: turfIds }, status: 'pending' })
      .populate('turf_id user_id')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Legacy request endpoint (kept for compatibility)
router.post('/request', auth, bookingLimiter, async (req, res) => {
  try {
    const { turf_id, date, time_slots, total_price } = req.body;
    if (!turf_id || !date || !Array.isArray(time_slots) || time_slots.length === 0 || !total_price) {
      return res.status(400).json({ msg: 'Booking details are required' });
    }
    const existing = await Booking.find({ turf_id, date, status: { $in: ['pending', 'approved', 'confirmed'] } });
    const booked   = existing.flatMap(b => b.time_slots);
    const conflict = time_slots.filter(s => booked.includes(s));
    if (conflict.length > 0) return res.status(400).json({ msg: `Slots already booked: ${conflict.join(', ')}` });

    const booking = await Booking.create({
      user_id: req.user.id, turf_id, date, time_slots, total_price,
      status: 'pending', payment_status: 'unpaid',
    });
    const populated = await booking.populate('turf_id user_id');
    const turf = await Turf.findById(turf_id).populate('owner_id');
    const user = await User.findById(req.user.id);
    if (turf?.owner_id) {
      emailService.sendPartnerBookingRequest(populated, turf.owner_id, turf, user).catch(() => {});
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
