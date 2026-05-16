const nodemailer = require('nodemailer');

// Get frontend URL from environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://turfx.metaqode.co.in';

// Create transporter (using Gmail - free!)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking, user, turf) => ({
    subject: `Booking Confirmed - ${turf.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1ebe74 0%, #0a3d2e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #111;">Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #1ebe74;">
            <h2 style="color: #1ebe74; margin-top: 0;">Booking Details</h2>
            <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-6).toUpperCase()}</p>
            <p><strong>Venue:</strong> ${turf.name}</p>
            <p><strong>Location:</strong> ${turf.location}, ${turf.city}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${booking.time_slot}</p>
            <p><strong>Amount Paid:</strong> ₹${booking.total_price}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>📍 Venue Address:</strong><br>${turf.location}, ${turf.city}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/my-bookings" style="background: #1ebe74; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Booking</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            <strong>Cancellation Policy:</strong><br>
            • Free cancellation up to 24 hours before booking (100% refund)<br>
            • 50% refund for cancellations 6-24 hours before<br>
            • No refund for cancellations within 6 hours
          </p>
        </div>
        
        <div style="background: #111; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">Need help? Contact us at support@turfx.com</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">© 2026 TurfX. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bookingReminder: (booking, user, turf, hoursUntil) => ({
    subject: `Reminder: Your booking is in ${hoursUntil} hours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1ebe74; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Reminder ⏰</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #111;">Your booking at <strong>${turf.name}</strong> is coming up in <strong>${hoursUntil} hours</strong>!</p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #1ebe74;">
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Time:</strong> ${booking.time_slot}</p>
            <p><strong>Venue:</strong> ${turf.name}</p>
            <p><strong>Location:</strong> ${turf.location}, ${turf.city}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maps.google.com/?q=${turf.coordinates?.lat},${turf.coordinates?.lng}" style="background: #1ebe74; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Directions</a>
          </div>
        </div>
      </div>
    `
  }),

  bookingCancellation: (booking, user, turf, refundAmount) => ({
    subject: `Booking Cancelled - Refund: ₹${refundAmount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #111;">Your booking has been cancelled.</p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-6).toUpperCase()}</p>
            <p><strong>Venue:</strong> ${turf.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Time:</strong> ${booking.time_slot}</p>
          </div>
          
          ${refundAmount > 0 ? `
            <div style="background: #d1fae5; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #1ebe74;">
              <h3 style="color: #1ebe74; margin-top: 0;">Refund Details</h3>
              <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
              <p><strong>Refund Status:</strong> ${booking.refund_status}</p>
              <p style="font-size: 14px; color: #64748b;">Refund will be credited to your original payment method within 5-7 business days.</p>
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">No refund applicable as per cancellation policy.</p>
            </div>
          `}
        </div>
      </div>
    `
  }),

  partnerNewBooking: (booking, partner, turf, user) => ({
    subject: `New Booking Received - ${turf.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1ebe74; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Booking! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${partner.name},</p>
          <p style="font-size: 16px; color: #111;">You have received a new booking!</p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #1ebe74;">
            <h3 style="color: #1ebe74; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-6).toUpperCase()}</p>
            <p><strong>Customer:</strong> ${user.name}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Venue:</strong> ${turf.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Time:</strong> ${booking.time_slot}</p>
            <p><strong>Amount:</strong> ₹${booking.total_price}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/partner/dashboard" style="background: #1ebe74; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View in Dashboard</a>
          </div>
        </div>
      </div>
    `
  }),

  kycApproved: (partner, kyc) => ({
    subject: `KYC Approved - You can now list venues!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1ebe74; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Approved! ✅</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${partner.name},</p>
          <p style="font-size: 16px; color: #111;">Congratulations! Your KYC verification has been approved.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #1ebe74;">
            <h3 style="color: #1ebe74; margin-top: 0;">What's Next?</h3>
            <p>✅ You can now list your venues on TurfX</p>
            <p>✅ Your profile will show a "Verified" badge</p>
            <p>✅ Start receiving bookings immediately</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/partner/dashboard" style="background: #1ebe74; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Add Your First Venue</a>
          </div>
        </div>
      </div>
    `
  }),

  kycRejected: (partner, kyc) => ({
    subject: `KYC Verification - Action Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KYC Verification Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; color: #111;">Hi ${partner.name},</p>
          <p style="font-size: 16px; color: #111;">We need some additional information to complete your KYC verification.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Reason:</h3>
            <p style="color: #856404;">${kyc.rejection_reason || 'Please resubmit with correct documents'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/partner/kyc" style="background: #1ebe74; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Resubmit KYC</a>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function
async function sendEmail(to, template, data) {
  try {
    const emailContent = template(data.booking, data.user, data.turf, data.hoursUntil, data.refundAmount, data.partner, data.kyc);
    
    const mailOptions = {
      from: `"TurfX" <${process.env.EMAIL_USER || 'noreply@turfx.com'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Exported functions
module.exports = {
  sendBookingConfirmation: async (booking, user, turf) => {
    return sendEmail(user.email || user.phone + '@temp.com', emailTemplates.bookingConfirmation, { booking, user, turf });
  },

  sendBookingReminder: async (booking, user, turf, hoursUntil) => {
    return sendEmail(user.email || user.phone + '@temp.com', emailTemplates.bookingReminder, { booking, user, turf, hoursUntil });
  },

  sendBookingCancellation: async (booking, user, turf, refundAmount) => {
    return sendEmail(user.email || user.phone + '@temp.com', emailTemplates.bookingCancellation, { booking, user, turf, refundAmount });
  },

  sendPartnerNewBooking: async (booking, partner, turf, user) => {
    return sendEmail(partner.email || partner.phone + '@temp.com', emailTemplates.partnerNewBooking, { booking, partner, turf, user });
  },

  sendKYCApproved: async (partner, kyc) => {
    return sendEmail(partner.email || partner.phone + '@temp.com', emailTemplates.kycApproved, { partner, kyc });
  },

  sendKYCRejected: async (partner, kyc) => {
    return sendEmail(partner.email || partner.phone + '@temp.com', emailTemplates.kycRejected, { partner, kyc });
  }
};
