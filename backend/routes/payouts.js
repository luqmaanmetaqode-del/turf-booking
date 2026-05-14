const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const payoutService = require('../services/payoutService');
const User = require('../models/User');

// @route   GET /api/payouts/history
// @desc    Get payout history for partner
// @access  Private (Partner only)
router.get('/history', auth, ownerOnly, async (req, res) => {
  try {
    const payouts = await payoutService.getPayoutHistory(req.user.id);
    
    res.json({
      success: true,
      count: payouts.length,
      payouts
    });
  } catch (err) {
    console.error('Get payout history error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/payouts/earnings
// @desc    Get current earnings (last 7 days)
// @access  Private (Partner only)
router.get('/earnings', auth, ownerOnly, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const earnings = await payoutService.calculatePartnerEarnings(
      req.user.id,
      startDate,
      endDate
    );

    res.json({
      success: true,
      period: {
        start: startDate,
        end: endDate
      },
      earnings
    });
  } catch (err) {
    console.error('Get earnings error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   POST /api/payouts/request
// @desc    Request manual payout
// @access  Private (Partner only)
router.post('/request', auth, ownerOnly, async (req, res) => {
  try {
    const result = await payoutService.triggerManualPayout(req.user.id);

    res.json({
      success: true,
      msg: 'Payout processed successfully',
      payout: result.payout,
      earnings: result.earnings
    });
  } catch (err) {
    console.error('Manual payout error:', err);
    res.status(400).json({ msg: err.message });
  }
});

// @route   POST /api/payouts/admin/trigger
// @desc    Admin: Trigger weekly payouts manually
// @access  Private (Admin only)
router.post('/admin/trigger', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const result = await payoutService.processWeeklyPayouts();

    res.json({
      success: true,
      msg: 'Weekly payouts processed',
      result
    });
  } catch (err) {
    console.error('Admin trigger payout error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/payouts/admin/all
// @desc    Admin: Get all payouts
// @access  Private (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const payouts = await payoutService.Payout.find(query)
      .populate('partner_id', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await payoutService.Payout.countDocuments(query);

    res.json({
      success: true,
      payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Admin get all payouts error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/payouts/stats
// @desc    Get payout statistics for partner
// @access  Private (Partner only)
router.get('/stats', auth, ownerOnly, async (req, res) => {
  try {
    const payouts = await payoutService.getPayoutHistory(req.user.id);

    const stats = {
      total_payouts: payouts.length,
      total_amount: payouts.reduce((sum, p) => sum + p.amount, 0),
      pending_amount: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      completed_amount: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      last_payout: payouts[0] || null,
      status_breakdown: {
        pending: payouts.filter(p => p.status === 'pending').length,
        processing: payouts.filter(p => p.status === 'processing').length,
        completed: payouts.filter(p => p.status === 'completed').length,
        failed: payouts.filter(p => p.status === 'failed').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Get payout stats error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
