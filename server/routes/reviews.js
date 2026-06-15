const express = require('express');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

const router = express.Router();

// Spot-nested review creation/listing lives in routes/spots.js.
// These handle review resources directly.
router.put('/:id/helpful', protect, ctrl.toggleHelpful);
router.delete('/:id', protect, ctrl.deleteReview);

module.exports = router;
