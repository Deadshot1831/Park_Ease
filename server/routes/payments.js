const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', protect, [body('bookingId').notEmpty()], validate, ctrl.createOrder);
router.post(
  '/verify',
  protect,
  [
    body('razorpayOrderId').notEmpty(),
    body('razorpayPaymentId').notEmpty(),
  ],
  validate,
  ctrl.verifyPayment
);
router.get('/history', protect, ctrl.getPaymentHistory);

module.exports = router;
