const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  price_per_hour: { type: Number, required: true },
  sport: { type: String, default: 'Football' },
  sports: [String],
  type: { type: String, default: 'Outdoor' },
  venueSize: { type: String, default: '' },
  surfaceType: { type: String, default: '' },
  bookingType: { type: String, default: 'Hourly' },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  amenities: [String],
  images: [String],
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  isActive: { type: Boolean, default: true },
  openTime: { type: String, default: '06:00 AM' },
  closeTime: { type: String, default: '11:00 PM' },
}, { timestamps: true });

module.exports = mongoose.model('Turf', TurfSchema);