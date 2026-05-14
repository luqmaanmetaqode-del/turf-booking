const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Wallet Transaction Schema
const WalletTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Success' },
  payment_id: { type: String },
  order_id: { type: String },
  method: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema);

// Withdrawal Request Schema
const WithdrawalRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Rejected'], default: 'Pending' },
  utr: { type: String }, // Unique Transaction Reference
  remarks: { type: String },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);

// Get wallet balance and transactions
router.get('/', auth, ownerOnly, async (req, res) => {
  try {
    // Get booking-based transactions
    const bookings = await Booking.find({ 
      turf_id: { $in: req.user.turfs || [] },
      status: 'confirmed'
    }).populate('turf_id user_id');

    const transactions = [];
    bookings.forEach(booking => {
      const amount = booking.total_price || 0;
      const platformFee = Math.round(amount * 0.05);
      
      // Credit transaction
      transactions.push({
        id: `PAY-${booking._id}`,
        type: 'Credit',
        amount: amount,
        description: 'Booking Payment',
        details: `${booking.turf_id?.name} | ${booking.time_slot}`,
        status: 'Success',
        date: booking.createdAt || booking.date,
      });

      // Debit transaction (platform fee)
      transactions.push({
        id: `FEE-${booking._id}`,
        type: 'Debit',
        amount: platformFee,
        description: 'Platform Fee',
        details: `Booking ID: ${booking._id.toString().slice(-6).toUpperCase()}`,
        status: 'Success',
        date: booking.createdAt || booking.date,
      });
    });

    // Get wallet transactions (add money, withdrawals)
    const walletTransactions = await WalletTransaction.find({ user_id: req.user.id });
    walletTransactions.forEach(txn => {
      transactions.push({
        id: txn._id,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        details: txn.details,
        status: txn.status,
        date: txn.createdAt,
      });
    });

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate balance
    const totalCredits = transactions.filter(t => t.type === 'Credit' && t.status === 'Success').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions.filter(t => t.type === 'Debit' && t.status === 'Success').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalCredits - totalDebits;

    res.json({
      balance,
      totalCredits,
      totalDebits,
      transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create Razorpay order for adding money
router.post('/add/create-order', auth, ownerOnly, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 100) {
      return res.status(400).json({ msg: 'Minimum amount is ₹100' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `wallet_${req.user.id}_${Date.now()}`,
      notes: {
        user_id: req.user.id,
        purpose: 'Wallet Top-up'
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ msg: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment and add money to wallet
router.post('/add/verify', auth, ownerOnly, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ msg: 'Payment verification failed' });
    }

    // Create wallet transaction
    const transaction = await WalletTransaction.create({
      user_id: req.user.id,
      type: 'Credit',
      amount: amount,
      description: 'Wallet Top-up',
      details: 'Added via Razorpay',
      status: 'Success',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      method: 'Razorpay'
    });

    res.json({
      msg: 'Money added successfully!',
      transaction,
      success: true
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ msg: 'Payment verification failed' });
  }
});

// Request withdrawal
router.post('/withdraw', auth, ownerOnly, async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    
    if (!amount || amount < 500) {
      return res.status(400).json({ msg: 'Minimum withdrawal amount is ₹500' });
    }

    if (!bankAccount || !bankAccount.accountNumber || !bankAccount.ifscCode || !bankAccount.accountHolderName) {
      return res.status(400).json({ msg: 'Complete bank account details required' });
    }

    // Check wallet balance
    const bookings = await Booking.find({ 
      turf_id: { $in: req.user.turfs || [] },
      status: 'confirmed'
    });

    const walletTransactions = await WalletTransaction.find({ user_id: req.user.id });
    
    let balance = 0;
    bookings.forEach(b => {
      balance += (b.total_price || 0);
      balance -= Math.round((b.total_price || 0) * 0.05);
    });
    walletTransactions.forEach(txn => {
      if (txn.status === 'Success') {
        balance += txn.type === 'Credit' ? txn.amount : -txn.amount;
      }
    });

    if (balance < amount) {
      return res.status(400).json({ msg: 'Insufficient wallet balance' });
    }

    // Create withdrawal request
    const withdrawal = await WithdrawalRequest.create({
      user_id: req.user.id,
      amount,
      bankAccount,
      status: 'Pending'
    });

    // Create debit transaction
    await WalletTransaction.create({
      user_id: req.user.id,
      type: 'Debit',
      amount: amount,
      description: 'Withdrawal Request',
      details: `To ${bankAccount.accountHolderName} - ${bankAccount.accountNumber.slice(-4)}`,
      status: 'Pending',
      order_id: withdrawal._id.toString()
    });

    res.json({
      msg: 'Withdrawal request submitted successfully!',
      withdrawal,
      estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ msg: 'Failed to process withdrawal request' });
  }
});

// Get withdrawal requests
router.get('/withdrawals', auth, ownerOnly, async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ user_id: req.user.id })
      .sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Process withdrawal (for testing - in production, this would be admin-only)
router.post('/withdrawals/:id/process', auth, ownerOnly, async (req, res) => {
  try {
    const { status, utr, remarks } = req.body;
    
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ msg: 'Withdrawal request not found' });
    }

    withdrawal.status = status;
    withdrawal.utr = utr;
    withdrawal.remarks = remarks;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Update wallet transaction
    await WalletTransaction.findOneAndUpdate(
      { order_id: withdrawal._id.toString() },
      { status: status === 'Completed' ? 'Success' : status === 'Rejected' ? 'Failed' : 'Pending' }
    );

    res.json({
      msg: 'Withdrawal request updated',
      withdrawal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
