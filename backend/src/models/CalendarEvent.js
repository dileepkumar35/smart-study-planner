const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['planner', 'external'],
    default: 'external',
    required: true
  },
  start: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end: {
    type: Date,
    required: [true, 'End time is required']
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate that end is after start
calendarEventSchema.pre('save', function(next) {
  if (this.end <= this.start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Index for efficient date range queries
calendarEventSchema.index({ userId: 1, start: 1, end: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
