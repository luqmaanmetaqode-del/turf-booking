const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  date: { type: String, required: true },
  time_slot: { type: String, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, default: 'confirmed' },
  payment_id: { type: String },
  refund_amount: { type: Number, default: 0 },
  refund_status: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
  refund_id: { type: String },
  cancelled_at: { type: Date },
  cancellation_reason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);