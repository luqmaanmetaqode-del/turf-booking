const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');

// Export bookings as CSV
router.get('/bookings/csv', auth, ownerOnly, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let filter = {};
    if (startDate) filter.date = { $gte: startDate };
    if (endDate) filter.date = { ...filter.date, $lte: endDate };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('turf_id user_id')
      .sort({ date: -1 });

    // Generate CSV
    let csv = 'Booking ID,Date,Time Slot,Venue,Customer Name,Customer Phone,Sport,Amount,Status\n';
    
    bookings.forEach(b => {
      csv += `${b._id},${b.date},${b.time_slot},${b.turf_id?.name || 'N/A'},${b.user_id?.name || 'N/A'},${b.user_id?.phone || 'N/A'},${b.turf_id?.sport || 'N/A'},${b.total_price},${b.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Export earnings as CSV
router.get('/earnings/csv', auth, ownerOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filter = { status: 'confirmed' };
    if (startDate) filter.date = { $gte: startDate };
    if (endDate) filter.date = { ...filter.date, $lte: endDate };

    const bookings = await Booking.find(filter)
      .populate('turf_id')
      .sort({ date: -1 });

    // Generate CSV
    let csv = 'Date,Venue,Booking ID,Revenue,Platform Fee (5%),Net Payout\n';
    
    bookings.forEach(b => {
      const revenue = b.total_price || 0;
      const platformFee = Math.round(revenue * 0.05);
      const netPayout = revenue - platformFee;
      csv += `${b.date},${b.turf_id?.name || 'N/A'},${b._id},${revenue},${platformFee},${netPayout}\n`;
    });

    // Add summary row
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalFees = Math.round(totalRevenue * 0.05);
    const totalPayout = totalRevenue - totalFees;
    csv += `\nTOTAL,,${bookings.length} bookings,${totalRevenue},${totalFees},${totalPayout}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=earnings-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Export wallet statement as CSV
router.get('/wallet/csv', auth, ownerOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' })
      .populate('turf_id')
      .sort({ createdAt: -1 });

    // Generate CSV
    let csv = 'Date,Transaction ID,Type,Description,Amount,Balance\n';
    
    let balance = 0;
    const transactions = [];

    bookings.forEach(booking => {
      const amount = booking.total_price || 0;
      const platformFee = Math.round(amount * 0.05);
      const date = (booking.createdAt || booking.date).toISOString().split('T')[0];
      
      // Credit
      balance += amount;
      transactions.push({
        date,
        id: `PAY-${booking._id.toString().slice(-6).toUpperCase()}`,
        type: 'Credit',
        desc: `Booking Payment - ${booking.turf_id?.name}`,
        amount,
        balance
      });

      // Debit
      balance -= platformFee;
      transactions.push({
        date,
        id: `FEE-${booking._id.toString().slice(-6).toUpperCase()}`,
        type: 'Debit',
        desc: 'Platform Fee (5%)',
        amount: -platformFee,
        balance
      });
    });

    transactions.reverse().forEach(t => {
      csv += `${t.date},${t.id},${t.type},${t.desc},${t.amount},${t.balance}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wallet-statement-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Export payout statement as CSV
router.get('/payouts/csv', auth, ownerOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' })
      .populate('turf_id')
      .sort({ date: 1 });

    // Group by week
    const weeklyGroups = {};
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const weekStart = new Date(bookingDate);
      weekStart.setDate(bookingDate.getDate() - bookingDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups[key]) {
        weeklyGroups[key] = { date: weekStart, amount: 0, count: 0 };
      }
      weeklyGroups[key].amount += Math.round((booking.total_price || 0) * 0.95);
      weeklyGroups[key].count += 1;
    });

    // Generate CSV
    let csv = 'Payout ID,Week Starting,Payout Date,Bookings Count,Gross Revenue,Platform Fee,Net Payout,Status\n';
    
    Object.values(weeklyGroups).forEach(group => {
      const payoutDate = new Date(group.date);
      payoutDate.setDate(payoutDate.getDate() + 5); // Friday payout
      const grossRevenue = Math.round(group.amount / 0.95);
      const platformFee = grossRevenue - group.amount;
      const status = payoutDate <= new Date() ? 'Completed' : 'Processing';
      const payoutId = `PAYOUT-${group.date.toISOString().slice(0, 10).replace(/-/g, '')}`;
      
      csv += `${payoutId},${group.date.toISOString().split('T')[0]},${payoutDate.toISOString().split('T')[0]},${group.count},${grossRevenue},${platformFee},${group.amount},${status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payouts-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
