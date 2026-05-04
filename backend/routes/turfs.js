const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const router = express.Router();

// Get all turfs
router.get('/', async (req, res) => {
  try {
    const turfs = await Turf.findAll();
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get nearby turfs (PostGIS)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    const turfs = await sequelize.query(`
      SELECT *,
        ST_Distance(
          location_point::geography,
          ST_GeogFromText('POINT(${lng} ${lat})')
        ) AS distance_meters
      FROM turfs
      WHERE ST_DWithin(
        location_point::geography,
        ST_GeogFromText('POINT(${lng} ${lat})'),
        ${radius}
      )
      ORDER BY distance_meters ASC
    `, { type: QueryTypes.SELECT });
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single turf
router.get('/:id', async (req, res) => {
  try {
    const turf = await Turf.findByPk(req.params.id);
    if (!turf) return res.status(404).json({ msg: 'Turf not found' });
    res.json(turf);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create turf (owner only)
router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const { name, location, price_per_hour, sport, amenities, lat, lng } = req.body;
    const turf = await Turf.create({
      name,
      location,
      price_per_hour,
      sport,
      amenities,
      owner_id: req.user.id,
      location_point: sequelize.fn('ST_GeogFromText', `POINT(${lng} ${lat})`),
    });
    res.json(turf);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update turf (owner only)
router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    await Turf.update(req.body, { where: { id: req.params.id, owner_id: req.user.id } });
    res.json({ msg: 'Turf updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete turf (owner only)
router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    await Turf.destroy({ where: { id: req.params.id, owner_id: req.user.id } });
    res.json({ msg: 'Turf deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;