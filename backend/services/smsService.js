const twilio = require('twilio');
const axios = require('axios');

class SMSService {
  constructor() {
    // Twilio Configuration
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Fast2SMS Configuration (Indian SMS service)
    this.fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    
    if (this.accountSid && this.authToken && this.fromNumber && this.fromNumber !== '+1234567890') {
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

      // Try Fast2SMS first (for Indian numbers)
      if (cleanPhone.startsWith('+91') && this.fast2smsApiKey) {
        const indianNumber = cleanPhone.replace('+91', '');
        const result = await this.sendVifast2SMS(indianNumber, otp);
        if (result.success) {
          return result;
        }
      }

      // Fallback to Twilio
      if (this.client) {
        const message = `Your TurfX OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

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
          phone: cleanPhone,
          provider: 'Twilio'
        };
      }

      throw new Error('No SMS service configured');

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

  async sendVifast2SMS(phone, otp) {
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