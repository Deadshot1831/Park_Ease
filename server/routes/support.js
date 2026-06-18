const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');
const { createTicket } = require('../controllers/supportController');

const router = express.Router();

// Public contact form — attaches the user if a valid token is present
router.post(
  '/',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('message').trim().isLength({ min: 5 }).withMessage('Please enter a message'),
  ],
  validate,
  createTicket
);

module.exports = router;
