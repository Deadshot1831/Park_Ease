const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const { chat } = require('../controllers/chatController');

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  [body('messages').isArray({ min: 1 }).withMessage('messages array is required')],
  validate,
  chat
);

module.exports = router;
