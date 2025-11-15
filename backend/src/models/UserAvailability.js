const mongoose = require('mongoose');

const userAvailabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekday: {
    type: Number,
    required: [true, 'Weekday is required'],
    min: 0,
    max: 6,
    validate: {
      validator: Number.isInteger,
      message: 'Weekday must be an integer between 0 (Sunday) and 6 (Saturday)'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      default: 'Vacation/Holiday'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique availability per user per weekday
userAvailabilitySchema.index({ userId: 1, weekday: 1 }, { unique: true });

module.exports = mongoose.model('UserAvailability', userAvailabilitySchema);
