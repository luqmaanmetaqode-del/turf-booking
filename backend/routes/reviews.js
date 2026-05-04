const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Add review
router.post('/', auth, async (req, res) => {
  try {
    const { turf_id, rating, comment } = req.body;
    const review = await Review.create({
      user_id: req.user.id,
      turf_id,
      rating,
      comment,
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get reviews for a turf
router.get('/:turfId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { turf_id: req.params.turfId },
      include: [{ model: User, attributes: ['name'] }],
      order: [['id', 'DESC']],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;