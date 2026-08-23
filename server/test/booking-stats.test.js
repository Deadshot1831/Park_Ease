// The dashboard trend used to bucket on month alone, so last July's revenue was
// added to this July's bar. These check the aggregate keeps years apart and the
// window rolls with the current month.
//
//   MONGODB_URI=mongodb://127.0.0.1:27017/parkease npm test
//
// Creates its own owner, spot and bookings, then deletes them. Skipped without a URI.
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('node:http');

const uri = process.env.MONGODB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test'; // keeps the request logger out of the test output

const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');
const { app } = require('../server');

const OWNER_EMAIL = 'booking-stats-test@parkease.test';

// Start the app on an ephemeral port and call it like a client would
const callStats = (token) =>
  new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      request
        .get(
          { host: '127.0.0.1', port: server.address().port, path: '/api/bookings/stats',
            headers: { Authorization: `Bearer ${token}` } },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => { server.close(); resolve(JSON.parse(body)); });
          }
        )
        .on('error', (e) => { server.close(); reject(e); });
    });
  });

// Same wall-clock day, `back` months earlier — matches how the endpoint walks back
const monthsAgo = (back) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - back, 15, 12, 0, 0);
};

test('owner booking stats', { skip: uri ? false : 'set MONGODB_URI to run' }, async (t) => {
  await mongoose.connect(uri);

  const owner = await User.create({ name: 'Stats Owner', email: OWNER_EMAIL, password: 'password123', role: 'owner' });
  const spot = await ParkingSpot.create({
    owner: owner._id, name: 'Stats Spot',
    address: { street: 'x', city: 'y', state: 'z' },
    location: { type: 'Point', coordinates: [77.6, 12.97] },
    type: 'commercial', totalSpots: 4, availableSpots: 4,
  });

  const book = (createdAt, amount, status = 'completed') =>
    Booking.create({
      user: owner._id, parkingSpot: spot._id, vehicle: { number: 'KA01ST0001' },
      startTime: createdAt, endTime: new Date(createdAt.getTime() + 3600e3),
      duration: 1, amount, status, createdAt,
    });

  t.after(async () => {
    await Promise.all([
      Booking.deleteMany({ parkingSpot: spot._id }),
      ParkingSpot.deleteOne({ _id: spot._id }),
      User.deleteOne({ _id: owner._id }),
    ]);
    await mongoose.disconnect();
  });

  await t.test('keeps the same month in different years apart', async () => {
    await book(monthsAgo(0), 500);   // this month
    await book(monthsAgo(12), 9999); // same month, a year ago — outside the window

    const { stats } = await callStats(owner.generateAuthToken());
    const current = stats.chart[stats.chart.length - 1];

    assert.equal(current.value, 500, "last year's revenue must not land in this month's bar");
    assert.equal(stats.revenue, 10499, 'but both still count towards lifetime revenue');
  });

  await t.test('the window is six months ending with the current one', async () => {
    const { stats } = await callStats(owner.generateAuthToken());
    assert.equal(stats.chart.length, 6);

    const expected = new Date().toLocaleString('en-US', { month: 'short' });
    assert.equal(stats.chart[5].label, expected, 'last bar is the current month, not a fixed Dec');
  });

  await t.test('only revenue statuses count', async () => {
    await book(monthsAgo(1), 700, 'cancelled');
    await book(monthsAgo(1), 300, 'confirmed');

    const { stats } = await callStats(owner.generateAuthToken());
    assert.equal(stats.chart[4].value, 300, 'cancelled bookings earn nothing');
  });
});
