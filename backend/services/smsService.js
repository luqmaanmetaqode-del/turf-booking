const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID || 'TURFX';
    this.baseUrl = 'https://control.msg91.com/api/v5';
  }

  async sendOTP(phone, otp) {
    try {
      // Remove +91 prefix if present and ensure it's a valid Indian number
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        throw new Error('Invalid Indian phone number');
      }

      const message = `Your TurfX password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

      const response = await axios.post(`${this.baseUrl}/flow/`, {
        template_id: null, // Use null for custom message
        sender: this.senderId,
        mobiles: `91${cleanPhone}`, // Add country code
        message: message,
      }, {
        headers: {
          'Authkey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ SMS sent to +91${cleanPhone}: ${otp}`);
      return {
        success: true,
        messageId: response.data.request_id,
        phone: `+91${cleanPhone}`
      };

    } catch (error) {
      console.error('❌ SMS sending failed:', error.response?.data || error.message);
      
      // Fallback: Log OTP to console if SMS fails
      console.log(`📱 FALLBACK - OTP for ${phone}: ${otp}`);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        fallback: true
      };
    }
  }

  async sendBookingConfirmation(phone, bookingDetails) {
    try {
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');
      
      const message = `🏟 TurfX Booking Confirmed! 
Venue: ${bookingDetails.turfName}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Amount: ₹${bookingDetails.amount}
Booking ID: ${bookingDetails.bookingId}
Enjoy your game!`;

      const response = await axios.post(`${this.baseUrl}/flow/`, {
        sender: this.senderId,
        mobiles: `91${cleanPhone}`,
        message: message,
      }, {
        headers: {
          'Authkey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Booking confirmation sent to +91${cleanPhone}`);
      return { success: true, messageId: response.data.request_id };

    } catch (error) {
      console.error('❌ Booking SMS failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();