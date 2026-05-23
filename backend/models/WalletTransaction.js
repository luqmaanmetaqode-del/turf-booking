const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type:        { type: String, enum: ['credit', 'debit', 'refund', 'hold', 'release'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true },
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  payment_id:  { type: String },   // Razorpay payment_id
  refund_id:   { type: String },   // Razorpay refund_id
  meta:        { type: Object },   // extra info
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
