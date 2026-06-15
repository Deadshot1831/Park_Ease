const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parkingSpot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpot',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// A user can only review a parking spot once
reviewSchema.index({ user: 1, parkingSpot: 1 }, { unique: true });
reviewSchema.index({ parkingSpot: 1, createdAt: -1 });

// Recalculate the parking spot's average rating after save/remove
reviewSchema.statics.recalculateRating = async function (parkingSpotId) {
  const stats = await this.aggregate([
    { $match: { parkingSpot: parkingSpotId } },
    {
      $group: {
        _id: '$parkingSpot',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const ParkingSpot = mongoose.model('ParkingSpot');
  if (stats.length > 0) {
    await ParkingSpot.findByIdAndUpdate(parkingSpotId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await ParkingSpot.findByIdAndUpdate(parkingSpotId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.recalculateRating(this.parkingSpot);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.recalculateRating(doc.parkingSpot);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
