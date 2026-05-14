const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Slot = require('../models/Slot');

// Lock a slot (when user clicks "Book Now")
router.post('/lock', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot, duration = 10 } = req.body;
    
    if (!turf_id || !date || !time_slot) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    
    // Find or create slot
    let slot = await Slot.findOne({ turf_id, date, time_slot });
    
    if (!slot) {
      slot = new Slot({ turf_id, date, time_slot });
    }
    
    // Check if already booked
    if (slot.is_booked) {
      return res.status(400).json({ msg: 'Slot is already booked' });
    }
    
    // Check if locked by another user
    if (slot.is_locked && !slot.isLockExpired()) {
      if (slot.locked_by.toString() !== req.user.id) {
        const remainingTime = Math.ceil((slot.locked_until - new Date()) / 1000);
        return res.status(400).json({ 
          msg: 'Slot is currently locked by another user',
          locked_until: slot.locked_until,
          remaining_seconds: remainingTime
        });
      }
    }
    
    // Lock the slot
    await slot.lock(req.user.id, duration);
    
    res.json({
      msg: 'Slot locked successfully',
      slot,
      locked_until: slot.locked_until,
      duration_minutes: duration
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Extend lock (user can extend once)
router.post('/extend-lock', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot, additional_minutes = 5 } = req.body;
    
    const slot = await Slot.findOne({ turf_id, date, time_slot });
    
    if (!slot) {
      return res.status(404).json({ msg: 'Slot not found' });
    }
    
    if (!slot.is_locked) {
      return res.status(400).json({ msg: 'Slot is not locked' });
    }
    
    if (slot.locked_by.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to extend this lock' });
    }
    
    if (slot.isLockExpired()) {
      return res.status(400).json({ msg: 'Lock has already expired' });
    }
    
    // Extend lock
    slot.locked_until = new Date(slot.locked_until.getTime() + additional_minutes * 60 * 1000);
    await slot.save();
    
    res.json({
      msg: 'Lock extended successfully',
      locked_until: slot.locked_until,
      additional_minutes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Unlock a slot (manual unlock or cancel booking process)
router.post('/unlock', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot } = req.body;
    
    const slot = await Slot.findOne({ turf_id, date, time_slot });
    
    if (!slot) {
      return res.status(404).json({ msg: 'Slot not found' });
    }
    
    if (!slot.is_locked) {
      return res.json({ msg: 'Slot is not locked' });
    }
    
    if (slot.locked_by.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to unlock this slot' });
    }
    
    await slot.unlock();
    
    res.json({ msg: 'Slot unlocked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check lock status
router.get('/lock-status', auth, async (req, res) => {
  try {
    const { turf_id, date, time_slot } = req.query;
    
    const slot = await Slot.findOne({ turf_id, date, time_slot });
    
    if (!slot) {
      return res.json({ 
        is_locked: false, 
        is_booked: false,
        available: true
      });
    }
    
    // Check if lock expired
    if (slot.is_locked && slot.isLockExpired()) {
      await slot.unlock();
      slot.is_locked = false;
    }
    
    const isLockedByMe = slot.is_locked && slot.locked_by.toString() === req.user.id;
    const remainingTime = slot.is_locked && !slot.isLockExpired() 
      ? Math.ceil((slot.locked_until - new Date()) / 1000)
      : 0;
    
    res.json({
      is_locked: slot.is_locked,
      is_booked: slot.is_booked,
      locked_by_me: isLockedByMe,
      locked_until: slot.locked_until,
      remaining_seconds: remainingTime,
      available: !slot.is_booked && (!slot.is_locked || isLockedByMe)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cleanup expired locks (cron job endpoint)
router.post('/cleanup-expired', async (req, res) => {
  try {
    const now = new Date();
    
    const result = await Slot.updateMany(
      { 
        is_locked: true, 
        locked_until: { $lt: now } 
      },
      { 
        $set: { 
          is_locked: false, 
          locked_by: null, 
          locked_until: null 
        } 
      }
    );
    
    res.json({
      msg: 'Expired locks cleaned up',
      count: result.modifiedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
