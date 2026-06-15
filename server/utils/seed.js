/**
 * Seed the database with a demo owner and ~25 sample parking spots around
 * central Bengaluru. Run with: `npm run seed` from the server directory.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');

// MG Road, Bengaluru as the anchor point
const CENTER = { lat: 12.9759, lng: 77.6045 };

const AREAS = [
  'MG Road', 'Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield',
  'Jayanagar', 'Malleshwaram', 'BTM Layout', 'Marathahalli', 'Electronic City',
  'Hebbal', 'Banashankari', 'JP Nagar', 'Rajajinagar', 'Yelahanka',
  'Bellandur', 'Sarjapur', 'CV Raman Nagar', 'Frazer Town', 'Domlur',
  'Cunningham Road', 'Brigade Road', 'Church Street', 'Ulsoor', 'Shivajinagar',
];

const TYPES = ['commercial', 'street', 'private'];
const PARKING_TYPES = ['covered', 'open', 'underground', 'multilevel'];
const AMENITY_POOL = ['cctv', 'ev_charging', 'wheelchair', '24x7', 'security_guard', 'lighting', 'restroom', 'valet'];
const IMAGES = [
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',
  'https://images.unsplash.com/photo-1545179605-1296651e9d0a?w=800',
];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickSome = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const seed = async () => {
  await connectDB();

  console.log('🧹 Clearing existing spots...');
  await ParkingSpot.deleteMany({});

  let owner = await User.findOne({ email: 'owner@parkease.dev' });
  if (!owner) {
    owner = await User.create({
      name: 'Demo Owner',
      email: 'owner@parkease.dev',
      password: 'password123',
      role: 'owner',
      phone: '+919000000001',
      isEmailVerified: true,
    });
    console.log('👤 Created demo owner (owner@parkease.dev / password123)');
  }

  // Also ensure a demo driver account exists
  if (!(await User.findOne({ email: 'user@parkease.dev' }))) {
    await User.create({
      name: 'Demo Driver',
      email: 'user@parkease.dev',
      password: 'password123',
      role: 'user',
      phone: '+919000000002',
      isEmailVerified: true,
      vehicles: [{ number: 'KA01AB1234', type: 'car', model: 'Honda City' }],
    });
    console.log('👤 Created demo driver (user@parkease.dev / password123)');
  }

  const spots = AREAS.map((area, i) => {
    const total = Math.floor(rand(10, 120));
    const available = Math.floor(rand(0, total));
    const hourly = Math.floor(rand(20, 80));
    return {
      owner: owner._id,
      name: `${area} ${pick(['Parking Plaza', 'Smart Park', 'City Garage', 'Secure Lot', 'Park & Go'])}`,
      description: `Convenient ${pick(PARKING_TYPES)} parking in the heart of ${area}.`,
      address: {
        street: `${Math.floor(rand(1, 200))}, ${area} Main Road`,
        city: 'Bengaluru',
        state: 'Karnataka',
        zip: `5600${String(i).padStart(2, '0')}`,
        country: 'India',
        formatted: `${area}, Bengaluru, Karnataka, India`,
      },
      location: {
        type: 'Point',
        coordinates: [CENTER.lng + rand(-0.08, 0.08), CENTER.lat + rand(-0.08, 0.08)],
      },
      type: pick(TYPES),
      parkingType: pick(PARKING_TYPES),
      totalSpots: total,
      availableSpots: available,
      pricing: { hourly, daily: hourly * 8, monthly: hourly * 8 * 22, currency: 'INR' },
      amenities: pickSome(AMENITY_POOL, Math.floor(rand(2, 6))),
      operatingHours: { is24x7: Math.random() > 0.5, open: '06:00', close: '23:00', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
      images: [{ url: pick(IMAGES) }],
      averageRating: Math.round(rand(3.5, 5) * 10) / 10,
      totalReviews: Math.floor(rand(0, 150)),
      isApproved: true,
      isActive: true,
    };
  });

  await ParkingSpot.insertMany(spots);
  console.log(`✅ Seeded ${spots.length} parking spots around Bengaluru`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
