const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'browser', 'webhook'],
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, status: 1, scheduledTime: 1 });
notificationSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
