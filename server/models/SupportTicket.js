const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // set when the sender is logged in
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      enum: ['booking', 'payment', 'owner', 'technical', 'other'],
      default: 'other',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ email: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
