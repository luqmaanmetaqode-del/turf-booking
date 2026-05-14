# 🏟️ TurfX - Sports Turf Booking Platform

A full-stack MERN application for booking sports turfs/venues with separate portals for Users, Partners (Venue Owners), and Admins.

## ✨ Features

### 👤 User Portal
- Browse and search sports turfs
- Real-time slot availability
- Secure booking with Razorpay payment integration
- Email notifications for bookings
- Booking history and management
- Reviews and ratings system
- Smart refund policy (100%/50%/0% based on cancellation time)

### 🏢 Partner Portal
- Venue management dashboard
- Slot and pricing management
- Booking oversight
- Earnings tracking (95% of booking amount)
- Wallet with withdrawal feature
- KYC verification
- Review management
- Automated weekly payouts

### 👨‍💼 Admin Portal
- Platform dashboard with analytics
- User and venue management
- Booking oversight
- KYC approval system
- Review moderation
- Payout management
- **Platform wallet** - Track 5% platform fees
- **Withdraw platform funds** feature
- Revenue statistics and reports

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Lucide React (icons)
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (file uploads)
- Nodemailer (email notifications)

### Payment & Services
- Razorpay (payment gateway)
- Gmail SMTP (email service)
- Firebase (optional authentication)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail account (for SMTP)
- Razorpay account (for payments)

## 🚀 Installation

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd turf-booking
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory:
\`\`\`env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

Create a `.env` file in the `frontend` directory:
\`\`\`env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_RAZORPAY_KEY=your_razorpay_key
\`\`\`

### 4. Seed Database (Optional)
\`\`\`bash
cd backend
node seed-data.js
\`\`\`

## 🎯 Running the Application

### Start Backend
\`\`\`bash
cd backend
node server.js
\`\`\`
Backend runs on: http://localhost:5001

### Start Frontend
\`\`\`bash
cd frontend
npm start
\`\`\`
Frontend runs on: http://localhost:3000

## 🔑 Default Credentials

### Admin Account
- Phone: 9999999999
- Password: admin123

### Partner Account
- Phone: +917019615646
- Password: password123

### User Account
- Register new account at `/register`

## 💰 Platform Fee Structure

- **User pays**: Full booking amount (e.g., ₹1000)
- **Platform fee**: 5% (₹50)
- **Partner receives**: 95% (₹950)
- **GST on platform fee**: 18% (₹9)
- **Total platform revenue**: ₹59 per booking

## 📁 Project Structure

\`\`\`
turf-booking/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth, rate limiting, sanitization
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Email, payout services
│   ├── uploads/         # File uploads
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Context providers
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
\`\`\`

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Turfs
- GET `/api/turfs` - Get all turfs
- POST `/api/turfs` - Create turf (Partner only)
- GET `/api/turfs/:id` - Get turf details
- PUT `/api/turfs/:id` - Update turf (Partner only)

### Bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/my` - Get user bookings
- PUT `/api/bookings/:id/cancel` - Cancel booking

### Admin
- GET `/api/admin/revenue` - Get revenue statistics
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/kyc/:id/approve` - Approve KYC

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input sanitization
- Rate limiting
- CORS protection
- Environment variable protection

## 📧 Email Notifications

The system sends automated emails for:
- Booking confirmations
- Booking cancellations
- KYC approval/rejection
- Payout notifications
- Review responses
- Support tickets

## 🎨 Features Implemented

✅ Real-time booking system
✅ Payment integration (Razorpay)
✅ Email notifications (Gmail SMTP)
✅ Partner earnings tracking
✅ Admin platform wallet
✅ Withdraw funds feature
✅ Reviews & ratings
✅ Advanced search & filters
✅ Automated payouts
✅ KYC verification
✅ Smart refund policy
✅ Slot locking mechanism
✅ Theme toggle (Light/Dark mode)

## 🐛 Known Issues

- Theme toggle only partially implemented (needs full component updates)
- Some components need theme color integration

## 🚧 Future Enhancements

- [ ] Complete dark mode implementation
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Loyalty program

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Your Name

## 📞 Support

For support, email: sup.brightmindsacademy@gmail.com

---

**Made with ❤️ for sports enthusiasts**
