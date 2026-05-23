const nodemailer = require('nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://turfx.metaqode.co.in';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER     || 'noreply@turfx.com',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

/* ── safe helpers ── */
const safe = (val, fallback = '') => val || fallback;
const safeName = (obj) => obj?.name || 'User';
const safeEmail = (obj) => obj?.email || null;

/* ── send helper ── */
async function send(to, subject, html) {
  if (!to || !to.includes('@')) return; // skip invalid / missing emails
  try {
    const info = await transporter.sendMail({
      from: `"TurfX" <${process.env.EMAIL_USER || 'noreply@turfx.com'}>`,
      to, subject, html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
}

/* ── templates ── */
function bookingConfirmationHtml(booking, user, turf) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#084734;padding:30px;text-align:center;">
      <h1 style="color:#CEF17B;margin:0;">Booking Confirmed 🎉</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(user)},</p>
      <p>Your booking is confirmed!</p>
      <div style="background:#fff;padding:20px;border-radius:12px;border:2px solid #CEF17B;">
        <p><strong>Booking ID:</strong> #${booking._id?.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Venue:</strong> ${safe(turf?.name, 'Venue')}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Slots:</strong> ${(booking.time_slots || []).join(', ')}</p>
        <p><strong>Amount Paid:</strong> ₹${booking.total_price}</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="${FRONTEND_URL}/my-bookings" style="background:#084734;color:#CEF17B;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">View Booking</a>
      </div>
    </div>
  </div>`;
}

function bookingCancellationHtml(booking, user, turf, refundAmount) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#ef4444;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;">Booking Cancelled</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(user)},</p>
      <p>Your booking at <strong>${safe(turf?.name, 'the venue')}</strong> has been cancelled.</p>
      <div style="background:#fff;padding:20px;border-radius:12px;">
        <p><strong>Booking ID:</strong> #${booking._id?.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Slots:</strong> ${(booking.time_slots || []).join(', ')}</p>
      </div>
      ${refundAmount > 0
        ? `<div style="background:#d1fae5;padding:20px;border-radius:12px;margin-top:16px;border:2px solid #084734;">
             <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
             <p style="font-size:13px;color:#555;">Will be credited to your original payment method within 5-7 business days.</p>
           </div>`
        : `<p style="color:#856404;">No refund applicable as per cancellation policy.</p>`
      }
    </div>
  </div>`;
}

function partnerNewBookingHtml(booking, partner, turf, user) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#084734;padding:30px;text-align:center;">
      <h1 style="color:#CEF17B;margin:0;">New Booking Received 🎉</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(partner)},</p>
      <p>You have a new confirmed booking!</p>
      <div style="background:#fff;padding:20px;border-radius:12px;border:2px solid #CEF17B;">
        <p><strong>Booking ID:</strong> #${booking._id?.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Customer:</strong> ${safeName(user)}</p>
        <p><strong>Phone:</strong> ${safe(user?.phone)}</p>
        <p><strong>Venue:</strong> ${safe(turf?.name)}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Slots:</strong> ${(booking.time_slots || []).join(', ')}</p>
        <p><strong>Amount:</strong> ₹${booking.total_price}</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="${FRONTEND_URL}/partner/dashboard" style="background:#084734;color:#CEF17B;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">View Dashboard</a>
      </div>
    </div>
  </div>`;
}

function bookingApprovedHtml(booking, user, turf) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#084734;padding:30px;text-align:center;">
      <h1 style="color:#CEF17B;margin:0;">Booking Approved ✅</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(user)},</p>
      <p>Your booking request for <strong>${safe(turf?.name)}</strong> has been approved!</p>
      <div style="background:#fff;padding:20px;border-radius:12px;border:2px solid #CEF17B;">
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Slots:</strong> ${(booking.time_slots || []).join(', ')}</p>
        <p><strong>Amount:</strong> ₹${booking.total_price}</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="${FRONTEND_URL}/my-bookings" style="background:#084734;color:#CEF17B;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">View Booking</a>
      </div>
    </div>
  </div>`;
}

function bookingRejectedHtml(booking, user, turf, reason) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#ef4444;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;">Booking Request Declined</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(user)},</p>
      <p>Unfortunately your booking request for <strong>${safe(turf?.name)}</strong> was declined.</p>
      ${reason ? `<div style="background:#fff3cd;padding:16px;border-radius:8px;"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <div style="text-align:center;margin:30px 0;">
        <a href="${FRONTEND_URL}/explore" style="background:#084734;color:#CEF17B;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Browse Other Venues</a>
      </div>
    </div>
  </div>`;
}

function partnerBookingRequestHtml(booking, partner, turf, user) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#084734;padding:30px;text-align:center;">
      <h1 style="color:#CEF17B;margin:0;">New Booking Request</h1>
    </div>
    <div style="padding:30px;background:#f8fafc;">
      <p>Hi ${safeName(partner)},</p>
      <p>You have a new booking request for <strong>${safe(turf?.name)}</strong>.</p>
      <div style="background:#fff;padding:20px;border-radius:12px;border:2px solid #CEF17B;">
        <p><strong>Customer:</strong> ${safeName(user)}</p>
        <p><strong>Phone:</strong> ${safe(user?.phone)}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Slots:</strong> ${(booking.time_slots || []).join(', ')}</p>
        <p><strong>Amount:</strong> ₹${booking.total_price}</p>
      </div>
      <div style="text-align:center;margin:30px 0;">
        <a href="${FRONTEND_URL}/partner/dashboard" style="background:#084734;color:#CEF17B;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Approve / Reject</a>
      </div>
    </div>
  </div>`;
}

/* ── exports ── */
module.exports = {
  sendBookingConfirmation: (booking, user, turf) =>
    send(safeEmail(user), `Booking Confirmed – ${safe(turf?.name, 'TurfX')}`, bookingConfirmationHtml(booking, user, turf)),

  sendBookingCancellation: (booking, user, turf, refundAmount) =>
    send(safeEmail(user), `Booking Cancelled – Refund ₹${refundAmount}`, bookingCancellationHtml(booking, user, turf, refundAmount)),

  sendPartnerNewBooking: (booking, partner, turf, user) =>
    send(safeEmail(partner), `New Booking – ${safe(turf?.name)}`, partnerNewBookingHtml(booking, partner, turf, user)),

  sendBookingApproved: (booking, user, turf) =>
    send(safeEmail(user), `Booking Approved – ${safe(turf?.name)}`, bookingApprovedHtml(booking, user, turf)),

  sendBookingRejected: (booking, user, turf, reason) =>
    send(safeEmail(user), `Booking Request Declined – ${safe(turf?.name)}`, bookingRejectedHtml(booking, user, turf, reason)),

  sendPartnerBookingRequest: (booking, partner, turf, user) =>
    send(safeEmail(partner), `New Booking Request – ${safe(turf?.name)}`, partnerBookingRequestHtml(booking, partner, turf, user)),
};
