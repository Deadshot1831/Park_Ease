const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendPasswordReset } = require('../services/emailService');

// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === 'owner' ? 'owner' : 'user',
  });

  const token = user.generateAuthToken();
  res.status(201).json({ success: true, token, user: user.toPublicJSON() });
});

// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = user.generateAuthToken();
  res.json({ success: true, token, user: user.toPublicJSON() });
});

// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites', 'name address averageRating images');
  res.json({ success: true, user: user.toPublicJSON() });
});

// @route   PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'vehicles'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, user: user.toPublicJSON() });
});

// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always respond success to avoid leaking which emails exist
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link was sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  await sendPasswordReset(user, resetUrl);

  res.json({ success: true, message: 'If that email exists, a reset link was sent' });
});

// @route   POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.generateAuthToken();
  res.json({ success: true, token, user: user.toPublicJSON() });
});

// @route   GET /api/auth/google/callback (passport hands off here)
const googleCallback = asyncHandler(async (req, res) => {
  const token = req.user.generateAuthToken();
  const redirect = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
  res.redirect(redirect);
});

// @route   POST /api/auth/favorites/:spotId  (toggle)
const toggleFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const spotId = req.params.spotId;
  const index = user.favorites.findIndex((f) => String(f) === spotId);

  if (index >= 0) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(spotId);
  }
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, favorites: user.favorites });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  googleCallback,
  toggleFavorite,
};
