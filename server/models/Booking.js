const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    vehicle: {
      number: { type: String, required: true },
      type: { type: String, enum: ['car', 'bike', 'suv', 'truck', 'other'], default: 'car' },
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    qrCode: {
      type: String, // Base64 or URL of QR code
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ parkingSpot: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
