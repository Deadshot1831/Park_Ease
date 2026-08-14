const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateBookingQR } = require('../utils/generateQR');
const { emitAvailabilityUpdate, emitToUser } = require('../services/socketService');
const { sendBookingConfirmation } = require('../services/emailService');
const { refundPayment } = require('../services/paymentService');
const { buildInvoicePdf } = require('../services/invoiceService');
const { freeBetween, refreshSpot } = require('../utils/availability');

// How long an unpaid booking holds its space before the TTL index reaps it.
const CHECKOUT_HOLD_MINUTES = 10;

// Refund a paid booking. Never throws — a failed refund must not block the
// cancellation it accompanies. Returns true when the refund went through.
const refundBookingPayment = async (booking) => {
  if (!booking.payment) return false;
  try {
    const payment = await Payment.findById(booking.payment);
    if (!payment || payment.status !== 'paid') return false;
    const refund = await refundPayment(payment.razorpayPaymentId, payment.amount);
    payment.status = 'refunded';
    payment.refundId = refund?.id;
    await payment.save();
    return true;
  } catch (err) {
    console.error('Refund failed:', err.message);
    return false;
  }
};

// Recompute a spot's cached availability and push it to connected clients.
const syncAvailability = async (spotId) => {
  const spot = await refreshSpot(spotId);
  if (spot) emitAvailabilityUpdate(spot._id, spot.availableSpots, spot.totalSpots);
};

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

  // Availability is per time window, not a global counter: a space is only
  // taken if an existing booking overlaps the requested one.
  if ((await freeBetween(spot, start, end)) < 1) {
    res.status(409);
    throw new Error('No spots available for this time');
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
    expiresAt: new Date(Date.now() + CHECKOUT_HOLD_MINUTES * 60 * 1000),
  });

  await syncAvailability(spot._id);
  res.status(201).json({ success: true, booking });
});

// Confirm a booking once payment succeeds (called by paymentController)
const confirmBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate('user').populate('parkingSpot');
  if (!booking || booking.status !== 'pending') return booking;

  // The pending hold already reserved the space, but it expires — re-check in
  // case it lapsed between checkout and the payment landing. Excluding this
  // booking's own hold keeps the check correct if it is still live.
  const free = await freeBetween(
    booking.parkingSpot,
    booking.startTime,
    booking.endTime,
    booking._id
  );

  if (free < 1) {
    // Paid for a space that no longer exists — cancel and give the money back
    // rather than confirming a booking that cannot be honoured.
    booking.status = 'cancelled';
    booking.cancellationReason = 'Sold out before payment completed';
    booking.cancelledAt = new Date();
    booking.expiresAt = undefined;
    await booking.save();
    await refundBookingPayment(booking);
    emitToUser(booking.user._id, 'booking', { bookingId: booking._id, status: 'cancelled' });
    return booking;
  }

  booking.status = 'confirmed';
  booking.expiresAt = undefined; // paid — stop the TTL from reaping it
  booking.qrCode = await generateBookingQR(booking);
  await booking.save();

  await syncAvailability(booking.parkingSpot._id);
  emitToUser(booking.user._id, 'booking', { bookingId: booking._id, status: 'confirmed' });

  // Generate the PDF receipt and email it with the confirmation (best-effort)
  (async () => {
    try {
      const payment = booking.payment ? await Payment.findById(booking.payment) : null;
      const pdf = await buildInvoicePdf({
        booking,
        user: booking.user,
        spot: booking.parkingSpot,
        payment,
      });
      await sendBookingConfirmation(booking.user, booking, booking.parkingSpot, [
        { filename: `ParkEase-Receipt-${String(booking._id).slice(-8)}.pdf`, content: pdf },
      ]);
    } catch (err) {
      console.error('Invoice/email failed:', err.message);
    }
  })();

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

// @route   GET /api/bookings/:id/invoice  → streams a PDF receipt
const getInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingSpot')
    .populate('user', 'name email phone')
    .populate('payment');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this invoice');
  }
  if (!['confirmed', 'active', 'completed'].includes(booking.status)) {
    res.status(400);
    throw new Error('A receipt is available once the booking is paid');
  }

  const pdf = await buildInvoicePdf({
    booking,
    user: booking.user,
    spot: booking.parkingSpot,
    payment: booking.payment,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ParkEase-Receipt-${String(booking._id).slice(-8)}.pdf"`
  );
  res.send(pdf);
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

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  booking.expiresAt = undefined;
  await booking.save();

  // Cancelling drops the hold, which frees the space again.
  await syncAvailability(booking.parkingSpot._id);

  const refunded = await refundBookingPayment(booking);
  res.json({ success: true, booking, refunded });
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

  // 'completed' and 'cancelled' drop the hold — push the freed space to clients.
  await syncAvailability(booking.parkingSpot._id);
  emitToUser(booking.user, 'booking', { bookingId: booking._id, status });
  res.json({ success: true, booking });
});

module.exports = {
  createBooking,
  confirmBooking,
  getMyBookings,
  getIncomingBookings,
  getBooking,
  getInvoice,
  cancelBooking,
  updateBookingStatus,
};
