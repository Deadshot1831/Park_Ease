const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const spotCtrl = require('../controllers/spotController');
const reviewCtrl = require('../controllers/reviewController');

const router = express.Router();

// Public discovery routes
router.get('/nearby', spotCtrl.getNearbySpots);
router.get('/search', spotCtrl.searchSpots);

// Owner-scoped listing (must come before /:id)
router.get('/owner/mine', protect, authorize('owner', 'admin'), spotCtrl.getMySpots);

// Reviews nested under a spot
router.get('/:id/reviews', reviewCtrl.getReviews);
router.post('/:id/reviews', protect, [body('rating').isInt({ min: 1, max: 5 })], validate, reviewCtrl.addReview);

router.get('/:id', optionalAuth, spotCtrl.getSpot);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['commercial', 'street', 'private']),
    body('totalSpots').isInt({ min: 1 }),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('coordinates [lng, lat] required'),
  ],
  validate,
  spotCtrl.createSpot
);

router.put('/:id', protect, authorize('owner', 'admin'), spotCtrl.updateSpot);
router.delete('/:id', protect, authorize('owner', 'admin'), spotCtrl.deleteSpot);
router.put('/:id/availability', protect, authorize('owner', 'admin'), spotCtrl.updateAvailability);

module.exports = router;
