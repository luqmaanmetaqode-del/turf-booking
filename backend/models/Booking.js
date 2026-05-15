const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
  date: { type: String, required: true },
  time_slots: { type: [String], required: true }, // Array of slots: ["6-7 AM", "7-8 AM", "8-9 AM"]
  total_price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'confirmed', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  payment_id: { type: String },
  payment_status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  approved_at: { type: Date },
  rejected_at: { type: Date },
  rejection_reason: { type: String },
  refund_amount: { type: Number, default: 0 },
  refund_status: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
  refund_id: { type: String },
  cancelled_at: { type: Date },
  cancellation_reason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);