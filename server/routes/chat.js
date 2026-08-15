const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimit');
const { chat } = require('../controllers/chatController');

const router = express.Router();

// This endpoint spends real money on every call, and the support widget has to
// stay usable for logged-out visitors — so it is throttled rather than gated.
// Generous for a human support conversation, useless for burning credits.
const chatLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'You have sent a lot of messages. Please wait a few minutes or contact support.',
});

router.post(
  '/',
  chatLimiter,
  optionalAuth,
  [body('messages').isArray({ min: 1 }).withMessage('messages array is required')],
  validate,
  chat
);

module.exports = router;
