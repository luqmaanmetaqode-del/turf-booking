const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  discount: { type: String },
  turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
  valid_until: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Offer', OfferSchema);