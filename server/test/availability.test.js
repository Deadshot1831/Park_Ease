// Availability is the one piece of logic that decides whether a paying driver
// gets a space, so it gets a real check against a real MongoDB.
//
//   MONGODB_URI=mongodb://127.0.0.1:27017/parkease npm test
//
// Creates its own throwaway spot + bookings and deletes them again; it does not
// touch existing data. Skipped entirely when MONGODB_URI is unset.
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const { freeBetween, applyLiveAvailability } = require('../utils/availability');

const uri = process.env.MONGODB_URI;

const hour = (h) => new Date(Date.UTC(2030, 0, 1, h));
const owner = new mongoose.Types.ObjectId();
const driver = new mongoose.Types.ObjectId();

const makeSpot = (totalSpots, blockedSpots = 0) =>
  ParkingSpot.create({
    owner,
    name: 'Test Spot',
    address: { street: 'x', city: 'x', state: 'x' },
    location: { type: 'Point', coordinates: [77.6, 12.97] },
    type: 'commercial',
    totalSpots,
    availableSpots: totalSpots,
    blockedSpots,
  });

const book = (spot, startH, endH, status = 'confirmed') =>
  Booking.create({
    user: driver,
    parkingSpot: spot._id,
    vehicle: { number: 'KA01AB1234' },
    startTime: hour(startH),
    endTime: hour(endH),
    duration: endH - startH,
    amount: 100,
    status,
  });

test('availability', { skip: uri ? false : 'set MONGODB_URI to run' }, async (t) => {
  await mongoose.connect(uri);
  t.after(async () => {
    await Promise.all([Booking.deleteMany({ user: driver }), ParkingSpot.deleteMany({ owner })]);
    await mongoose.disconnect();
  });

  await t.test('an empty spot is fully free', async () => {
    const spot = await makeSpot(2);
    assert.equal(await freeBetween(spot, hour(10), hour(12)), 2);
  });

  await t.test('only overlapping bookings take a space', async () => {
    const spot = await makeSpot(2);
    await book(spot, 10, 12);

    assert.equal(await freeBetween(spot, hour(11), hour(13)), 1, 'partial overlap holds');
    assert.equal(await freeBetween(spot, hour(14), hour(16)), 2, 'later window is untouched');
    assert.equal(await freeBetween(spot, hour(12), hour(14)), 2, 'windows may touch at the edge');
  });

  await t.test('a full window rejects the next booking', async () => {
    const spot = await makeSpot(2);
    await book(spot, 10, 12);
    await book(spot, 9, 11);
    assert.equal(await freeBetween(spot, hour(10), hour(11)), 0);
  });

  await t.test('pending holds, cancelled and completed do not', async () => {
    const spot = await makeSpot(1);
    const pending = await book(spot, 10, 12, 'pending');
    assert.equal(await freeBetween(spot, hour(10), hour(12)), 0, 'checkout holds the space');

    pending.status = 'cancelled';
    await pending.save();
    assert.equal(await freeBetween(spot, hour(10), hour(12)), 1, 'cancelling releases it');

    await book(spot, 10, 12, 'completed');
    assert.equal(await freeBetween(spot, hour(10), hour(12)), 1, 'past stays released');
  });

  await t.test('a booking can be excluded from its own check', async () => {
    const spot = await makeSpot(1);
    const b = await book(spot, 10, 12);
    assert.equal(await freeBetween(spot, hour(10), hour(12), b._id), 1);
  });

  await t.test('blocked spaces reduce capacity', async () => {
    const spot = await makeSpot(3, 2);
    assert.equal(await freeBetween(spot, hour(10), hour(12)), 1);
  });

  await t.test('live availability counts only bookings running right now', async () => {
    const spot = await makeSpot(2);
    const now = Date.now();
    await Booking.create({
      user: driver,
      parkingSpot: spot._id,
      vehicle: { number: 'KA01AB1234' },
      startTime: new Date(now - 3600e3),
      endTime: new Date(now + 3600e3),
      duration: 2,
      amount: 100,
      status: 'active',
    });
    await book(spot, 10, 12); // year 2030 — must not count against "now"

    const [live] = await applyLiveAvailability([spot]);
    assert.equal(live.availableSpots, 1);
  });
});
