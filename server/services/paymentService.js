const crypto = require('crypto');
const { getRazorpay } = require('../config/razorpay');

// Create a Razorpay order. Falls back to a mock order in dev when keys are absent
// so the booking flow remains testable without live credentials.
const createOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  const razorpay = getRazorpay();

  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      status: 'created',
      mock: true,
    };
  }

  return razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt,
    notes,
  });
};

// Verify the signature Razorpay returns to the client after a successful payment
const verifySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // Mock mode — accept any signature that looks like a mock payment
    return String(razorpayPaymentId || '').startsWith('pay_mock');
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expected === razorpaySignature;
};

const refundPayment = async (razorpayPaymentId, amount) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return { id: `rfnd_mock_${Date.now()}`, status: 'processed', mock: true };
  }
  return razorpay.payments.refund(razorpayPaymentId, {
    amount: amount ? Math.round(amount * 100) : undefined,
  });
};

module.exports = { createOrder, verifySignature, refundPayment };
