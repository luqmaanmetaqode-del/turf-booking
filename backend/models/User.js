const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  password: { type: String, default: '' },
  role: { type: String, default: 'user' },
  googleUid: { type: String, default: null },
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

// Index on phone for fast lookups (not unique to avoid conflicts)
UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);
