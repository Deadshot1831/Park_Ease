const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');
const paymentService = require('../services/paymentService');
const { confirmBooking } = require('./bookingController');

// @route   POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (String(booking.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized for this booking');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error('Booking is not awaiting payment');
  }

  const order = await paymentService.createOrder({
    amount: booking.amount,
    receipt: `booking_${booking._id}`,
    notes: { bookingId: String(booking._id), userId: String(req.user._id) },
  });

  const payment = await Payment.create({
    booking: booking._id,
    user: req.user._id,
    amount: booking.amount,
    razorpayOrderId: order.id,
    status: 'created',
  });

  booking.payment = payment._id;
  await booking.save();

  res.status(201).json({
    success: true,
    order,
    keyId: process.env.RAZORPAY_KEY_ID || null,
    paymentId: payment._id,
  });
});

// @route   POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const valid = paymentService.verifySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (!valid) {
    payment.status = 'failed';
    await payment.save();
    res.status(400);
    throw new Error('Payment verification failed');
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'paid';
  await payment.save();

  const booking = await confirmBooking(payment.booking);

  res.json({ success: true, payment, booking });
});

// @route   GET /api/payments/history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate({ path: 'booking', populate: { path: 'parkingSpot', select: 'name address' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, count: payments.length, payments });
});

// @route   POST /api/payments/webhook  (Razorpay server-to-server)
// Mounted with a raw body parser so the signature can be verified. This is the
// source of truth for payment status — it confirms bookings even if the user
// closes the tab before the client-side verify call runs.
const webhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

  // Verify signature when a webhook secret is configured
  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (expected !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const paymentEntity = event.payload?.payment?.entity;
  const refundEntity = event.payload?.refund?.entity;

  switch (event.event) {
    case 'payment.captured':
    case 'order.paid': {
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity?.order_id });
      if (payment && payment.status !== 'paid') {
        payment.status = 'paid';
        payment.razorpayPaymentId = paymentEntity?.id || payment.razorpayPaymentId;
        payment.method = paymentEntity?.method;
        await payment.save();
        await confirmBooking(payment.booking); // idempotent
      }
      break;
    }
    case 'payment.failed': {
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity?.order_id });
      if (payment && payment.status === 'created') {
        payment.status = 'failed';
        await payment.save();
      }
      break;
    }
    case 'refund.processed':
    case 'refund.created': {
      const payment = await Payment.findOne({ razorpayPaymentId: refundEntity?.payment_id });
      if (payment) {
        payment.status = 'refunded';
        payment.refundId = refundEntity?.id;
        await payment.save();
      }
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

module.exports = { createOrder, verifyPayment, getPaymentHistory, webhook };
