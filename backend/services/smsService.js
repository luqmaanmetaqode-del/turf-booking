const axios = require('axios');

class SMSService {
  constructor() {
    // Fast2SMS Configuration (Indian SMS service)
    this.fast2smsApiKey = process.env.FAST2SMS_API_KEY;
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

      // Use Fast2SMS for Indian numbers
      if (cleanPhone.startsWith('+91') && this.fast2smsApiKey) {
        const indianNumber = cleanPhone.replace('+91', '');
        const result = await this.sendViaFast2SMS(indianNumber, otp);
        if (result.success) {
          return result;
        }
      }

      throw new Error('Fast2SMS not configured or non-Indian number');

    } catch (error) {
      console.error('❌ SMS failed:', error.message);
      
      // Fallback: Log OTP to console if SMS fails
      console.log(`📱 FALLBACK - OTP for ${phone}: ${otp}`);
      
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  async sendViaFast2SMS(phone, otp) {
    try {
      const message = `Your TurfX OTP is ${otp}. Valid for 10 minutes. Do not share this OTP.`;
      
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        variables_values: otp,
        route: 'otp',
        numbers: phone,
        message: message
      }, {
        headers: {
          'authorization': this.fast2smsApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.return === true) {
        console.log(`✅ SMS sent via Fast2SMS to +91${phone}: ${otp}`);
        return {
          success: true,
          messageId: response.data.request_id,
          phone: `+91${phone}`,
          provider: 'Fast2SMS'
        };
      } else {
        throw new Error(response.data.message || 'Fast2SMS failed');
      }

    } catch (error) {
      console.error('❌ Fast2SMS failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBookingConfirmation(phone, bookingDetails) {
    try {
      let cleanPhone = phone.replace(/\D/g, '');
      
      // Add +91 for Indian numbers if not present
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone;
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        cleanPhone = '+' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }

      const message = `🏟 TurfX Booking Confirmed! 
Venue: ${bookingDetails.turfName}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Amount: ₹${bookingDetails.amount}
Booking ID: ${bookingDetails.bookingId}
Enjoy your game!`;

      // Use Fast2SMS for Indian numbers
      if (cleanPhone.startsWith('+91') && this.fast2smsApiKey) {
        const indianNumber = cleanPhone.replace('+91', '');
        
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: indianNumber
        }, {
          headers: {
            'authorization': this.fast2smsApiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.return === true) {
          console.log(`✅ Booking confirmation sent via Fast2SMS to ${cleanPhone}`);
          return { success: true, messageId: response.data.request_id };
        } else {
          throw new Error(response.data.message || 'Fast2SMS failed');
        }
      }

      throw new Error('Fast2SMS not configured or non-Indian number');

    } catch (error) {
      console.error('❌ Booking confirmation SMS failed:', error.message);
      
      // Fallback: Log booking details to console if SMS fails
      console.log(`📱 FALLBACK - Booking confirmation for ${phone}:`, bookingDetails);
      
      return { success: false, error: error.message, fallback: true };
    }
  }
}

module.exports = new SMSService();