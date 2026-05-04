const express = require('express');
const Offer = require('../models/Offer');
const router = express.Router();

// Get all offers
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.findAll();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;