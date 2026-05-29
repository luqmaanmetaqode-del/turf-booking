const twilio = require('twilio');

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  async sendOTP(phone, otp) {
    try {
      // Clean phone number - ensure it has country code
      let cleanPhone = phone.replace(/\D/g, '');
      
      // Add +91 for Indian numbers if not present
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        cleanPhone = '+' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }

      if (!this.client) {
        throw new Error('Twilio not configured');
      }

      const message = `Your TurfX password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: cleanPhone
      });

      console.log(`✅ SMS sent via Twilio to ${cleanPhone}: ${otp}`);
      console.log(`📱 Message SID: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        phone: cleanPhone
      };

    } catch (error) {
      console.error('❌ Twilio SMS failed:', error.message);
      
      // Fallback: Log OTP to console if SMS fails
      console.log(`📱 FALLBACK - OTP for ${phone}: ${otp}`);
      
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  async sendBookingConfirmation(phone, bookingDetails) {
    try {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }

      if (!this.client) {
        throw new Error('Twilio not configured');
      }

      const message = `🏟 TurfX Booking Confirmed! 
Venue: ${bookingDetails.turfName}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Amount: ₹${bookingDetails.amount}
Booking ID: ${bookingDetails.bookingId}
Enjoy your game!`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: cleanPhone
      });

      console.log(`✅ Booking confirmation sent via Twilio to ${cleanPhone}`);
      return { success: true, messageId: result.sid };

    } catch (error) {
      console.error('❌ Twilio booking SMS failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();