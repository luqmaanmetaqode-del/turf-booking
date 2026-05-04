const express = require('express');
const Slot = require('../models/Slot');
const auth = require('../middleware/auth');
const router = express.Router();

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
];

// Get available slots for a turf on a date
router.get('/:turfId/:date', async (req, res) => {
  try {
    const { turfId, date } = req.params;

    // Get booked/locked slots
    const bookedSlots = await Slot.findAll({
      where: { turf_id: turfId, date }
    });

    const bookedTimes = bookedSlots.map(s => s.time_slot);

    // Return all slots with availability status
    const slots = TIME_SLOTS.map(time => ({
      time,
      available: !bookedTimes.includes(time)
    }));

    res.json(slots);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Lock a slot temporarily (5 min)
router.post('/lock', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot } = req.body;

    const existing = await Slot.findOne({ where: { turf_id, date, time_slot } });
    if (existing) return res.status(400).json({ msg: 'Slot already booked or locked' });

    const locked_until = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await Slot.create({ turf_id, date, time_slot, is_locked: true, locked_until });

    res.json({ msg: 'Slot locked for 5 minutes' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;