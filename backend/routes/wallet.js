const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const WalletTransaction = require('../models/WalletTransaction');
const Booking = require('../models/Booking');
const Turf    = require('../models/Turf');
const User    = require('../models/User');

/* ─────────────────────────────────────────────────────────────
   PARTNER WALLET  GET /api/wallet
   Returns: balance (released only), held amount, transactions
───────────────────────────────────────────────────────────── */
router.get('/', auth, ownerOnly, async (req, res) => {
  try {
    const txns = await WalletTransaction.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('booking_id', 'date time_slots turf_id total_price');

    // Available balance = sum of completed credits (released holds)
    const available = txns
      .filter(t => t.type === 'hold' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);

    // On-hold balance = pending holds
    const onHold = txns
      .filter(t => t.type === 'hold' && t.status === 'pending')
      .reduce((s, t) => s + t.amount, 0);

    // Total earned (all released)
    const totalEarned = available;

    res.json({ available, onHold, totalEarned, transactions: txns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   ADMIN WALLET  GET /api/wallet/admin
   Returns: admin's full wallet ledger
───────────────────────────────────────────────────────────── */
router.get('/admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user?.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    const txns = await WalletTransaction.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('booking_id');

    const totalIn  = txns.filter(t => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalOut = txns.filter(t => ['debit', 'refund'].includes(t.type) && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const balance  = totalIn - totalOut;

    // Platform fee retained = credits - partner payouts - refunds
    const partnerPaidOut = txns.filter(t => t.type === 'debit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const refundsIssued  = txns.filter(t => t.type === 'refund' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const platformRetained = totalIn - partnerPaidOut - refundsIssued;

    res.json({ balance, totalIn, totalOut, platformRetained, partnerPaidOut, refundsIssued, transactions: txns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   WITHDRAWAL REQUEST  POST /api/wallet/withdraw
───────────────────────────────────────────────────────────── */
router.post('/withdraw', auth, ownerOnly, async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    if (!amount || amount < 500) return res.status(400).json({ msg: 'Minimum withdrawal is ₹500' });
    if (!bankAccount?.accountNumber || !bankAccount?.ifscCode || !bankAccount?.accountHolderName) {
      return res.status(400).json({ msg: 'Complete bank details required' });
    }

    // Check available balance
    const txns = await WalletTransaction.find({ user_id: req.user.id });
    const available = txns
      .filter(t => t.type === 'hold' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);
    const withdrawn = txns
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);
    const balance = available - withdrawn;

    if (balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

    // Record withdrawal debit
    const txn = await WalletTransaction.create({
      user_id:     req.user.id,
      type:        'debit',
      amount,
      description: `Withdrawal to ${bankAccount.accountHolderName} – ${bankAccount.accountNumber.slice(-4)}`,
      status:      'pending',
      meta:        { bankAccount },
    });

    res.json({ msg: 'Withdrawal request submitted. Processing in 1-3 business days.', txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
