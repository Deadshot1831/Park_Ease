const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Parking spot name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String },
      country: { type: String, default: 'India' },
      formatted: { type: String }, // Full formatted address
    },
    // GeoJSON for geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
    },
    type: {
      type: String,
      enum: ['commercial', 'street', 'private'],
      required: true,
    },
    parkingType: {
      type: String,
      enum: ['covered', 'open', 'underground', 'multilevel'],
      default: 'open',
    },
    totalSpots: {
      type: Number,
      required: [true, 'Total spots is required'],
      min: [1, 'Must have at least 1 spot'],
    },
    availableSpots: {
      type: Number,
      required: true,
      min: 0,
    },
    pricing: {
      hourly: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    amenities: [
      {
        type: String,
        enum: [
          'cctv',
          'ev_charging',
          'wheelchair',
          '24x7',
          'security_guard',
          'covered',
          'valet',
          'car_wash',
          'restroom',
          'lighting',
        ],
      },
    ],
    operatingHours: {
      is24x7: { type: Boolean, default: false },
      open: { type: String }, // "08:00"
      close: { type: String }, // "22:00"
      days: [
        {
          type: String,
          enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        },
      ],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public ID
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for MVP, can change later
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere index for geospatial queries
parkingSpotSchema.index({ location: '2dsphere' });

// Text index for search
parkingSpotSchema.index({ name: 'text', 'address.formatted': 'text', description: 'text' });

// Virtual for reviews
parkingSpotSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'parkingSpot',
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
