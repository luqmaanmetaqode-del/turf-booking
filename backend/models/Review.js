const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  
  // Detailed ratings
  ratings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5 },
    value_for_money: { type: Number, min: 1, max: 5 },
    staff_behavior: { type: Number, min: 1, max: 5 }
  },
  
  // Photos
  photos: [{ type: String }],
  
  // Verification
  verified_booking: { type: Boolean, default: true },
  
  // Moderation
  is_flagged: { type: Boolean, default: false },
  flag_reason: String,
  is_approved: { type: Boolean, default: true },
  
  // Partner response
  partner_response: {
    text: String,
    responded_at: Date
  },
  
  // Helpful votes
  helpful_count: { type: Number, default: 0 },
  
  date: { type: String, required: true }, // YYYY-MM-DD
}, { timestamps: true });

// Index for faster queries
ReviewSchema.index({ turf_id: 1, createdAt: -1 });
ReviewSchema.index({ user_id: 1, booking_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);