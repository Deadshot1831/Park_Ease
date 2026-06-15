const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
);

router.post('/forgot-password', [body('email').isEmail()], validate, ctrl.forgotPassword);
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  validate,
  ctrl.resetPassword
);

router.get('/me', protect, ctrl.getMe);
router.put('/me', protect, ctrl.updateMe);
router.post('/favorites/:spotId', protect, ctrl.toggleFavorite);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  ctrl.googleCallback
);

module.exports = router;
