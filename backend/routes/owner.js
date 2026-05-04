const express = require('express');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const router = express.Router();

// Owner dashboard — get all bookings for owner's turfs
router.get('/dashboard', auth, ownerOnly, async (req, res) => {
  try {
    const turfs = await Turf.findAll({ where: { owner_id: req.user.id } });
    const turfIds = turfs.map(t => t.id);

    const bookings = await Booking.findAll({
      where: { turf_id: turfIds },
      include: [{ model: Turf }, { model: User, attributes: ['name', 'email'] }],
      order: [['id', 'DESC']],
    });

    const totalEarnings = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_price, 0);

    res.json({ turfs, bookings, totalEarnings });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Revenue report
router.get('/reports', auth, ownerOnly, async (req, res) => {
  try {
    const turfs = await Turf.findAll({ where: { owner_id: req.user.id } });
    const turfIds = turfs.map(t => t.id);

    const report = await sequelize.query(`
      SELECT date, SUM(total_price) as revenue, COUNT(*) as bookings
      FROM bookings
      WHERE turf_id IN (${turfIds.join(',')})
      AND status = 'confirmed'
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `, { type: QueryTypes.SELECT });

    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;