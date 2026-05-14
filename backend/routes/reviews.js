const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { reviewLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Configure multer for review photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit per photo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) are allowed'));
    }
  }
});

// Submit review (only after booking completion)
router.post('/', auth, reviewLimiter, upload.array('photos', 5), async (req, res) => {
  try {
    const { turf_id, booking_id, rating, comment, cleanliness, facilities, value_for_money, staff_behavior } = req.body;
    
    // Validate booking
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to review this booking' });
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ msg: 'Can only review completed bookings' });
    }
    
    // Check if booking date has passed
    const bookingDate = new Date(booking.date);
    const now = new Date();
    if (bookingDate > now) {
      return res.status(400).json({ msg: 'Cannot review future bookings' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ user_id: req.user.id, booking_id });
    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this booking' });
    }
    
    // Check review submission window (within 7 days of booking)
    const daysSinceBooking = (now - bookingDate) / (1000 * 60 * 60 * 24);
    if (daysSinceBooking > 7) {
      return res.status(400).json({ msg: 'Review period expired (7 days after booking)' });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const photos = req.files ? req.files.map(f => f.path) : [];
    
    const review = await Review.create({ 
      user_id: req.user.id, 
      turf_id, 
      booking_id,
      rating: parseInt(rating), 
      comment,
      ratings: {
        cleanliness: cleanliness ? parseInt(cleanliness) : undefined,
        facilities: facilities ? parseInt(facilities) : undefined,
        value_for_money: value_for_money ? parseInt(value_for_money) : undefined,
        staff_behavior: staff_behavior ? parseInt(staff_behavior) : undefined
      },
      photos,
      verified_booking: true,
      date 
    });

    // Recalculate and update turf rating
    const allReviews = await Review.find({ turf_id, is_approved: true });
    const avgRating = allReviews.length
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : rating;
    await Turf.findByIdAndUpdate(turf_id, { rating: avgRating });

    const populated = await review.populate('user_id', 'name');
    res.json({
      msg: 'Review submitted successfully!',
      review: populated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get reviews for a turf
router.get('/:turfId', async (req, res) => {
  try {
    const { sort = 'recent', rating_filter } = req.query;
    
    let query = { turf_id: req.params.turfId, is_approved: true };
    
    // Filter by rating
    if (rating_filter) {
      query.rating = { $gte: parseInt(rating_filter) };
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default: recent first
    if (sort === 'highest_rated') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest_rated') {
      sortOption = { rating: 1, createdAt: -1 };
    } else if (sort === 'most_helpful') {
      sortOption = { helpful_count: -1, createdAt: -1 };
    }
    
    const reviews = await Review.find(query)
      .populate('user_id', 'name')
      .sort(sortOption);
    
    // Calculate rating breakdown
    const allReviews = await Review.find({ turf_id: req.params.turfId, is_approved: true });
    const ratingBreakdown = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };
    
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;
    
    // Calculate average detailed ratings
    const detailedRatings = {
      cleanliness: 0,
      facilities: 0,
      value_for_money: 0,
      staff_behavior: 0
    };
    
    let detailedCount = 0;
    allReviews.forEach(r => {
      if (r.ratings) {
        if (r.ratings.cleanliness) { detailedRatings.cleanliness += r.ratings.cleanliness; detailedCount++; }
        if (r.ratings.facilities) detailedRatings.facilities += r.ratings.facilities;
        if (r.ratings.value_for_money) detailedRatings.value_for_money += r.ratings.value_for_money;
        if (r.ratings.staff_behavior) detailedRatings.staff_behavior += r.ratings.staff_behavior;
      }
    });
    
    if (detailedCount > 0) {
      Object.keys(detailedRatings).forEach(key => {
        detailedRatings[key] = parseFloat((detailedRatings[key] / detailedCount).toFixed(1));
      });
    }
    
    res.json({
      reviews,
      summary: {
        totalReviews,
        avgRating,
        ratingBreakdown,
        detailedRatings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check if user can review a booking
router.get('/can-review/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.json({ canReview: false, reason: 'Booking not found' });
    }
    
    if (booking.user_id.toString() !== req.user.id) {
      return res.json({ canReview: false, reason: 'Not your booking' });
    }
    
    if (booking.status !== 'confirmed') {
      return res.json({ canReview: false, reason: 'Booking not confirmed' });
    }
    
    const bookingDate = new Date(booking.date);
    const now = new Date();
    
    if (bookingDate > now) {
      return res.json({ canReview: false, reason: 'Booking not completed yet' });
    }
    
    const daysSinceBooking = (now - bookingDate) / (1000 * 60 * 60 * 24);
    if (daysSinceBooking > 7) {
      return res.json({ canReview: false, reason: 'Review period expired (7 days)' });
    }
    
    const existingReview = await Review.findOne({ user_id: req.user.id, booking_id: req.params.bookingId });
    if (existingReview) {
      return res.json({ canReview: false, reason: 'Already reviewed', review: existingReview });
    }
    
    res.json({ canReview: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Partner response to review
router.post('/:reviewId/respond', auth, async (req, res) => {
  try {
    const { response_text } = req.body;
    
    const review = await Review.findById(req.params.reviewId).populate('turf_id');
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    // Check if user is the turf owner
    if (review.turf_id.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    review.partner_response = {
      text: response_text,
      responded_at: new Date()
    };
    
    await review.save();
    
    res.json({
      msg: 'Response added successfully',
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    review.helpful_count += 1;
    await review.save();
    
    res.json({ helpful_count: review.helpful_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Flag review (report)
router.post('/:reviewId/flag', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    review.is_flagged = true;
    review.flag_reason = reason;
    await review.save();
    
    res.json({ msg: 'Review flagged for moderation' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Moderate review
router.put('/admin/:reviewId/moderate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const { is_approved } = req.body;
    
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    review.is_approved = is_approved;
    review.is_flagged = false;
    await review.save();
    
    // Recalculate turf rating
    const allReviews = await Review.find({ turf_id: review.turf_id, is_approved: true });
    const avgRating = allReviews.length
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1))
      : 0;
    await Turf.findByIdAndUpdate(review.turf_id, { rating: avgRating });
    
    res.json({ msg: 'Review moderated successfully', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;