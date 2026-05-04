const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot, total_price, payment_id } = req.body;

    // Mark slot as booked
    await Slot.upsert({
      turf_id, date, time_slot,
      is_booked: true, is_locked: false
    });

    const booking = await Booking.create({
      user_id: req.user.id,
      turf_id,
      date,
      time_slot,
      total_price,
      payment_id,
      status: 'confirmed',
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my bookings
router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Turf }],
      order: [['id', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel booking
router.put('/cancel/:id', auth, async (req, res) => {
  try {
    await Booking.update(
      { status: 'cancelled' },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    res.json({ msg: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;