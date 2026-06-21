const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/bookingController');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('parkingSpot').notEmpty().withMessage('parkingSpot is required'),
    body('vehicle.number').notEmpty().withMessage('Vehicle number is required'),
    body('startTime').isISO8601().withMessage('Valid startTime is required'),
    body('endTime').isISO8601().withMessage('Valid endTime is required'),
  ],
  validate,
  ctrl.createBooking
);

router.get('/my', protect, ctrl.getMyBookings);
router.get('/incoming', protect, authorize('owner', 'admin'), ctrl.getIncomingBookings);
router.get('/:id', protect, ctrl.getBooking);
router.get('/:id/invoice', protect, ctrl.getInvoice);
router.put('/:id/cancel', protect, ctrl.cancelBooking);
router.put('/:id/status', protect, authorize('owner', 'admin'), ctrl.updateBookingStatus);

module.exports = router;
