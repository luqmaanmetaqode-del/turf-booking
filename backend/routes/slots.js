const express = require('express');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const router = express.Router();

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
];

const isActiveLock = (slot) => (
  slot?.is_locked && slot.locked_until && new Date(slot.locked_until) > new Date()
);

router.get('/:turfId/:date', async (req, res) => {
  try {
    const { turfId, date } = req.params;
    const slotsForDate = await Slot.find({ turf_id: turfId, date });
    const ownerSlots = slotsForDate.filter(slot => slot.created_by_owner);
    const times = ownerSlots.length > 0 ? ownerSlots.map(slot => slot.time_slot) : TIME_SLOTS;

    const slots = times.map(time => {
      const slot = slotsForDate.find(item => item.time_slot === time);
      const locked = isActiveLock(slot);
      return {
      time,
        available: !slot?.is_booked && !locked,
        status: slot?.is_booked ? 'booked' : locked ? 'locked' : 'available',
        configured: ownerSlots.length > 0,
      };
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const { turf_id, date, time_slot } = req.body;
    if (!turf_id || !date || !time_slot) {
      return res.status(400).json({ msg: 'Venue, date and time slot are required' });
    }

    const turf = await Turf.findOne({ _id: turf_id, owner_id: req.user.id });
    if (!turf) return res.status(404).json({ msg: 'Venue not found or you do not have permission to manage it' });

    const existing = await Slot.findOne({ turf_id, date, time_slot });
    if (existing?.is_booked) {
      return res.status(400).json({ msg: 'This slot already has a booking' });
    }
    if (isActiveLock(existing)) {
      return res.status(400).json({ msg: 'This slot is temporarily locked' });
    }

    const slot = await Slot.findOneAndUpdate(
      { turf_id, date, time_slot },
      { turf_id, date, time_slot, is_booked: false, is_locked: false, locked_until: null, created_by_owner: true },
      { upsert: true, new: true, runValidators: true }
    ).populate('turf_id', 'name location');
    res.json(slot);
  } catch (err) {
    console.error('Slot create error:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const { date, time_slot } = req.body;
    if (!date || !time_slot) {
      return res.status(400).json({ msg: 'Date and time slot are required' });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });

    const turf = await Turf.findOne({ _id: slot.turf_id, owner_id: req.user.id });
    if (!turf) return res.status(403).json({ msg: 'Not allowed to update this slot' });
    if (!slot.created_by_owner) return res.status(400).json({ msg: 'Only owner-created slots can be updated here' });
    if (slot.is_booked) return res.status(400).json({ msg: 'Booked slots cannot be updated' });
    if (isActiveLock(slot)) return res.status(400).json({ msg: 'Locked slots cannot be updated' });

    const duplicate = await Slot.findOne({
      _id: { $ne: slot._id },
      turf_id: slot.turf_id,
      date,
      time_slot,
    });
    if (duplicate) return res.status(400).json({ msg: 'A slot already exists for this venue, date and time' });

    slot.date = date;
    slot.time_slot = time_slot;
    await slot.save();

    await slot.populate('turf_id', 'name location');
    res.json(slot);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });

    const turf = await Turf.findOne({ _id: slot.turf_id, owner_id: req.user.id });
    if (!turf) return res.status(403).json({ msg: 'Not allowed to delete this slot' });
    if (!slot.created_by_owner) return res.status(400).json({ msg: 'Only owner-created slots can be deleted here' });
    if (slot.is_booked) return res.status(400).json({ msg: 'Booked slots cannot be deleted' });

    await slot.deleteOne();
    res.json({ msg: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/lock', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot } = req.body;
    if (!turf_id || !date || !time_slot) {
      return res.status(400).json({ msg: 'Venue, date and time slot are required' });
    }

    const ownerSlots = await Slot.find({ turf_id, date, created_by_owner: true });
    if (ownerSlots.length > 0 && !ownerSlots.some(slot => slot.time_slot === time_slot)) {
      return res.status(400).json({ msg: 'Selected slot is not configured for this date' });
    }

    const existing = await Slot.findOne({ turf_id, date, time_slot });
    if (existing?.is_booked || isActiveLock(existing)) {
      return res.status(400).json({ msg: 'Slot already booked or locked' });
    }

    const locked_until = new Date(Date.now() + 5 * 60 * 1000);
    if (existing) {
      existing.is_locked = true;
      existing.locked_until = locked_until;
      await existing.save();
    } else {
      await Slot.create({ turf_id, date, time_slot, is_locked: true, locked_until });
    }
    res.json({ msg: 'Slot locked for 5 minutes' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
