require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Turf = require('./models/Turf');
const Offer = require('./models/Offer');
const Slot = require('./models/Slot');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/turfx';

const turfs = [
  { name: 'Green Arena', location: 'Koramangala', city: 'Bengaluru', price_per_hour: 800, sport: 'Football', rating: 4.5, images: ['/images/football.png'], amenities: ['Floodlights', 'Parking', 'Washroom'], coordinates: { lat: 12.9352, lng: 77.6245 } },
  { name: 'Kings Turf', location: 'Indiranagar', city: 'Bengaluru', price_per_hour: 1000, sport: 'Cricket', rating: 4.2, images: ['/images/cricket.png'], amenities: ['Floodlights', 'Cafeteria'], coordinates: { lat: 12.9784, lng: 77.6408 } },
  { name: 'Premier Grounds', location: 'Whitefield', city: 'Bengaluru', price_per_hour: 700, sport: 'Football', rating: 4.7, images: ['/images/football.png'], amenities: ['Parking', 'Washroom'], coordinates: { lat: 12.9698, lng: 77.7480 } },
  { name: 'City Sports Hub', location: 'HSR Layout', city: 'Bengaluru', price_per_hour: 900, sport: 'Badminton', rating: 4.3, images: ['/images/badminton.png'], amenities: ['Floodlights', 'AC'], coordinates: { lat: 12.9116, lng: 77.6477 } },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    const phone = process.env.SEED_OWNER_PHONE || '+917019615646';
    const password = process.env.SEED_OWNER_PASSWORD || 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const owner = await User.findOneAndUpdate(
      { phone },
      { name: 'Admin Partner', phone, password: passwordHash, role: 'owner', email: process.env.SEED_OWNER_EMAIL || 'partner@turfx.local' },
      { upsert: true, new: true }
    );

    await Turf.deleteMany({ owner_id: owner._id });
    await Offer.deleteMany({});
    await Slot.deleteMany({ is_booked: false, is_locked: false });

    const createdTurfs = await Turf.insertMany(turfs.map(turf => ({ ...turf, owner_id: owner._id })));
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    await Offer.insertMany([
      {
        title: 'Morning Saver',
        description: 'Discount for early morning football bookings',
        discount: '15% OFF',
        turf_id: createdTurfs[0]._id,
        valid_until: validUntil,
      },
      {
        title: 'Cricket Weekday Deal',
        description: 'Special weekday discount for cricket slots',
        discount: '10% OFF',
        turf_id: createdTurfs[1]._id,
        valid_until: validUntil,
      },
    ]);

    const today = new Date().toISOString().split('T')[0];
    await Slot.insertMany([
      { turf_id: createdTurfs[0]._id, date: today, time_slot: '6:00 AM', created_by_owner: true },
      { turf_id: createdTurfs[0]._id, date: today, time_slot: '7:00 AM', created_by_owner: true },
      { turf_id: createdTurfs[1]._id, date: today, time_slot: '8:00 AM', created_by_owner: true },
    ]);

    console.log('Seed complete');
    console.log(`Owner phone: ${phone}`);
    console.log(`Owner password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
