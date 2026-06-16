const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateBookingQR } = require('../utils/generateQR');
const { emitAvailabilityUpdate, emitToUser } = require('../services/socketService');
const { sendBookingConfirmation } = require('../services/emailService');

// Compute price from spot pricing and duration in hours
const computeAmount = (spot, hours) => {
  if (hours >= 24 && spot.pricing.daily > 0) {
    const days = Math.ceil(hours / 24);
    return days * spot.pricing.daily;
  }
  return Math.ceil(hours) * (spot.pricing.hourly || 0);
};

// @route   POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { parkingSpot: spotId, vehicle, startTime, endTime } = req.body;

  const spot = await ParkingSpot.findById(spotId);
  if (!spot || !spot.isActive) {
    res.status(404);
    throw new Error('Parking spot not available');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (!(start < end) || start < new Date(Date.now() - 60 * 1000)) {
    res.status(400);
    throw new Error('Invalid booking time range');
  }

  if (spot.availableSpots < 1) {
    res.status(409);
    throw new Error('No spots available for this location');
  }

  const duration = (end - start) / (1000 * 60 * 60); // hours
  const amount = computeAmount(spot, duration);

  const booking = await Booking.create({
    user: req.user._id,
    parkingSpot: spot._id,
    vehicle,
    startTime: start,
    endTime: end,
    duration: Math.round(duration * 100) / 100,
    amount,
    status: 'pending', // becomes 'confirmed' after payment verification
  });

  res.status(201).json({ success: true, booking });
});

// Confirm a booking once payment succeeds (called by paymentController)
const confirmBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate('user').populate('parkingSpot');
  if (!booking || booking.status !== 'pending') return booking;

  // Atomically decrement availability only if a spot remains
  const spot = await ParkingSpot.findOneAndUpdate(
    { _id: booking.parkingSpot._id, availableSpots: { $gt: 0 } },
    { $inc: { availableSpots: -1 } },
    { new: true }
  );

  booking.status = 'confirmed';
  booking.qrCode = await generateBookingQR(booking);
  await booking.save();

  if (spot) {
    emitAvailabilityUpdate(spot._id, spot.availableSpots, spot.totalSpots);
  }
  emitToUser(booking.user._id, 'booking', { bookingId: booking._id, status: 'confirmed' });
  sendBookingConfirmation(booking.user, booking, booking.parkingSpot).catch(() => {});

  return booking;
};

// @route   GET /api/bookings/my
const getMyBookings = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('parkingSpot', 'name address images pricing location availableSpots totalSpots')
    .sort({ startTime: -1 });
  res.json({ success: true, count: bookings.length, bookings });
});

// @route   GET /api/bookings/incoming  (owner)
const getIncomingBookings = asyncHandler(async (req, res) => {
  const spots = await ParkingSpot.find({ owner: req.user._id }).select('_id');
  const spotIds = spots.map((s) => s._id);

  const filter = { parkingSpot: { $in: spotIds } };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('parkingSpot', 'name address')
    .populate('user', 'name phone avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, bookings });
});

// @route   GET /api/bookings/:id
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingSpot')
    .populate('payment');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }
  res.json({ success: true, booking });
});

// @route   PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('parkingSpot');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  if (['cancelled', 'completed'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  const wasConfirmed = ['confirmed', 'active'].includes(booking.status);
  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  await booking.save();

  // Release the spot back to the pool
  if (wasConfirmed) {
    const spot = await ParkingSpot.findByIdAndUpdate(
      booking.parkingSpot._id,
      { $inc: { availableSpots: 1 } },
      { new: true }
    );
    if (spot) {
      spot.availableSpots = Math.min(spot.availableSpots, spot.totalSpots);
      await spot.save();
      emitAvailabilityUpdate(spot._id, spot.availableSpots, spot.totalSpots);
    }
  }

  res.json({ success: true, booking });
});

// @route   PUT /api/bookings/:id/status  (owner/admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ['confirmed', 'active', 'completed', 'cancelled'];
  if (!valid.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const booking = await Booking.findById(req.params.id).populate('parkingSpot');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.parkingSpot.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  booking.status = status;
  await booking.save();
  emitToUser(booking.user, 'booking', { bookingId: booking._id, status });
  res.json({ success: true, booking });
});

module.exports = {
  createBooking,
  confirmBooking,
  getMyBookings,
  getIncomingBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
};
