const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   POST /api/spots/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const spotId = req.params.id;
  const { rating, comment, photos } = req.body;

  // Verified-booking requirement (risk mitigation in the plan)
  const hasBooked = await Booking.exists({
    user: req.user._id,
    parkingSpot: spotId,
    status: { $in: ['confirmed', 'active', 'completed'] },
  });
  if (!hasBooked) {
    res.status(403);
    throw new Error('You can only review spots you have booked');
  }

  const existing = await Review.findOne({ user: req.user._id, parkingSpot: spotId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this spot');
  }

  const review = await Review.create({
    user: req.user._id,
    parkingSpot: spotId,
    rating,
    comment,
    photos,
  });
  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, review });
});

// @route   GET /api/spots/:id/reviews
const getReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  const reviews = await Review.find({ parkingSpot: req.params.id })
    .populate('user', 'name avatar')
    .sort({ helpfulCount: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments({ parkingSpot: req.params.id });
  res.json({ success: true, count: reviews.length, total, page, reviews });
});

// @route   PUT /api/reviews/:id/helpful  (toggle)
const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const idx = review.helpfulVoters.findIndex((v) => String(v) === String(req.user._id));
  if (idx >= 0) {
    review.helpfulVoters.splice(idx, 1);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulVoters.push(req.user._id);
    review.helpfulCount += 1;
  }
  await review.save();
  res.json({ success: true, helpfulCount: review.helpfulCount });
});

// @route   DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  await Review.findOneAndDelete({ _id: review._id });
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { addReview, getReviews, toggleHelpful, deleteReview };
