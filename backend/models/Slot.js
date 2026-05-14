const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  turf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
  date: { type: String, required: true },
  time_slot: { type: String, required: true },
  is_booked: { type: Boolean, default: false },
  is_locked: { type: Boolean, default: false },
  locked_until: { type: Date },
  locked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_by_owner: { type: Boolean, default: false },
}, { timestamps: true });

// Index for faster queries
SlotSchema.index({ turf_id: 1, date: 1, time_slot: 1 }, { unique: true });
SlotSchema.index({ locked_until: 1 });

// Method to check if lock is expired
SlotSchema.methods.isLockExpired = function() {
  if (!this.is_locked || !this.locked_until) return true;
  return new Date() > this.locked_until;
};

// Method to lock slot
SlotSchema.methods.lock = function(userId, durationMinutes = 10) {
  this.is_locked = true;
  this.locked_by = userId;
  this.locked_until = new Date(Date.now() + durationMinutes * 60 * 1000);
  return this.save();
};

// Method to unlock slot
SlotSchema.methods.unlock = function() {
  this.is_locked = false;
  this.locked_by = null;
  this.locked_until = null;
  return this.save();
};

module.exports = mongoose.model('Slot', SlotSchema);
