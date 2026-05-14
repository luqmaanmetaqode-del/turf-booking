const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Personal Details
  full_name: { type: String, required: true },
  business_name: { type: String },
  business_type: { type: String, enum: ['Individual', 'Partnership', 'Private Limited', 'LLP', 'Other'] },
  
  // Documents
  documents: {
    aadhaar: {
      number: String,
      front_image: String,
      back_image: String
    },
    pan: {
      number: String,
      image: String
    },
    business_registration: {
      number: String,
      image: String
    },
    gst: {
      number: String,
      certificate: String
    },
    address_proof: {
      type: String,
      image: String
    }
  },
  
  // Bank Details
  bank_account: {
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    account_holder_name: { type: String, required: true },
    bank_name: String,
    branch_name: String,
    account_type: { type: String, enum: ['Savings', 'Current'] },
    verified: { type: Boolean, default: false },
    verification_method: String, // 'penny_drop', 'manual', 'statement'
    verification_date: Date
  },
  
  // Business Address
  business_address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  // Verification Status
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resubmit_required'], 
    default: 'pending' 
  },
  
  // Admin Review
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewed_at: Date,
  rejection_reason: String,
  admin_notes: String,
  
  // Verification Badge
  verified_badge: { type: Boolean, default: false },
  verification_date: Date,
  
  // Submission tracking
  submitted_at: { type: Date, default: Date.now },
  resubmission_count: { type: Number, default: 0 },
  
}, { timestamps: true });

module.exports = mongoose.model('KYC', KYCSchema);
