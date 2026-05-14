const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

// Payout Transaction Schema
const PayoutSchema = new mongoose.Schema({
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  utr: String,
  bank_account: {
    account_number: String,
    ifsc_code: String,
    account_holder_name: String
  },
  initiated_at: { type: Date, default: Date.now },
  completed_at: Date,
  failure_reason: String
}, { timestamps: true });

const Payout = mongoose.model('Payout', PayoutSchema);

// Calculate partner earnings
async function calculatePartnerEarnings(partnerId, startDate, endDate) {
  const bookings = await Booking.find({
    turf_id: { $in: await getTurfIds(partnerId) },
    status: 'confirmed',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  let totalEarnings = 0;
  let platformFee = 0;
  let gst = 0;

  bookings.forEach(booking => {
    const bookingAmount = booking.total_price || 0;
    const fee = 25; // Platform fee per booking
    const gstAmount = Math.round(fee * 0.18); // 18% GST on platform fee
    
    totalEarnings += bookingAmount;
    platformFee += fee;
    gst += gstAmount;
  });

  const netPayout = totalEarnings - platformFee - gst;

  return {
    totalEarnings,
    platformFee,
    gst,
    netPayout,
    bookings: bookings.map(b => b._id)
  };
}

// Get turf IDs for a partner
async function getTurfIds(partnerId) {
  const Turf = require('../models/Turf');
  const turfs = await Turf.find({ owner_id: partnerId }).select('_id');
  return turfs.map(t => t._id);
}

// Process weekly payouts
async function processWeeklyPayouts() {
  try {
    console.log('🔄 Starting weekly payout processing...');

    // Get all partners
    const partners = await User.find({ role: 'owner' });

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    let processedCount = 0;
    let totalAmount = 0;

    for (const partner of partners) {
      // Calculate earnings
      const earnings = await calculatePartnerEarnings(partner._id, startDate, endDate);

      // Skip if below minimum threshold (₹500)
      if (earnings.netPayout < 500) {
        console.log(`⏭️  Skipping ${partner.name}: Below minimum threshold (₹${earnings.netPayout})`);
        continue;
      }

      // Check if partner has KYC approved
      const KYC = require('../models/KYC');
      const kyc = await KYC.findOne({ user_id: partner._id, status: 'approved' });
      
      if (!kyc || !kyc.bank_account || !kyc.bank_account.verified) {
        console.log(`⏭️  Skipping ${partner.name}: KYC not approved or bank not verified`);
        continue;
      }

      // Create payout record
      const payout = await Payout.create({
        partner_id: partner._id,
        amount: earnings.netPayout,
        bookings: earnings.bookings,
        status: 'processing',
        bank_account: {
          account_number: kyc.bank_account.account_number,
          ifsc_code: kyc.bank_account.ifsc_code,
          account_holder_name: kyc.bank_account.account_holder_name
        }
      });

      // In production, integrate with Razorpay Payouts or bank API
      // For now, mark as completed
      payout.status = 'completed';
      payout.utr = `UTR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      payout.completed_at = new Date();
      await payout.save();

      processedCount++;
      totalAmount += earnings.netPayout;

      console.log(`✅ Payout processed for ${partner.name}: ₹${earnings.netPayout}`);

      // Send email notification
      const emailService = require('./emailService');
      // TODO: Add payout email template
    }

    console.log(`✅ Weekly payout processing complete: ${processedCount} payouts, Total: ₹${totalAmount}`);

    return {
      success: true,
      processedCount,
      totalAmount
    };
  } catch (error) {
    console.error('❌ Payout processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Schedule weekly payouts (Every Monday at 9 AM)
function scheduleWeeklyPayouts() {
  // Cron format: minute hour day-of-month month day-of-week
  // '0 9 * * 1' = Every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', () => {
    console.log('⏰ Scheduled payout job triggered');
    processWeeklyPayouts();
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('📅 Weekly payout scheduler initialized (Every Monday 9 AM IST)');
}

// Manual payout trigger (for testing or admin use)
async function triggerManualPayout(partnerId) {
  try {
    const partner = await User.findById(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Calculate earnings for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const earnings = await calculatePartnerEarnings(partnerId, startDate, endDate);

    if (earnings.netPayout < 500) {
      throw new Error('Minimum payout amount is ₹500');
    }

    // Check KYC
    const KYC = require('../models/KYC');
    const kyc = await KYC.findOne({ user_id: partnerId, status: 'approved' });
    
    if (!kyc || !kyc.bank_account || !kyc.bank_account.verified) {
      throw new Error('KYC not approved or bank account not verified');
    }

    // Create and process payout
    const payout = await Payout.create({
      partner_id: partnerId,
      amount: earnings.netPayout,
      bookings: earnings.bookings,
      status: 'processing',
      bank_account: {
        account_number: kyc.bank_account.account_number,
        ifsc_code: kyc.bank_account.ifsc_code,
        account_holder_name: kyc.bank_account.account_holder_name
      }
    });

    // Process payout
    payout.status = 'completed';
    payout.utr = `UTR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    payout.completed_at = new Date();
    await payout.save();

    return {
      success: true,
      payout,
      earnings
    };
  } catch (error) {
    throw error;
  }
}

// Get payout history for a partner
async function getPayoutHistory(partnerId) {
  const payouts = await Payout.find({ partner_id: partnerId })
    .sort({ createdAt: -1 })
    .populate('bookings');
  
  return payouts;
}

module.exports = {
  scheduleWeeklyPayouts,
  processWeeklyPayouts,
  triggerManualPayout,
  getPayoutHistory,
  calculatePartnerEarnings,
  Payout
};
