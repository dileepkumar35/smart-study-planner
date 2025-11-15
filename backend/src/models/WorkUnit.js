const mongoose = require('mongoose');

const workUnitSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  scheduledStart: {
    type: Date,
    required: [true, 'Scheduled start time is required']
  },
  scheduledEnd: {
    type: Date,
    required: [true, 'Scheduled end time is required']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done', 'skipped', 'overdue'],
    default: 'todo'
  },
  sequenceIndex: {
    type: Number,
    required: true,
    default: 0
  },
  actualStart: {
    type: Date
  },
  actualEnd: {
    type: Date
  },
  skippedAt: {
    type: Date
  },
  urgencyScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate that scheduledEnd is after scheduledStart
workUnitSchema.pre('save', function(next) {
  if (this.scheduledEnd <= this.scheduledStart) {
    next(new Error('Scheduled end time must be after start time'));
  }
  next();
});

// Index for efficient queries
workUnitSchema.index({ userId: 1, scheduledStart: 1 });
workUnitSchema.index({ goalId: 1, status: 1 });
workUnitSchema.index({ userId: 1, status: 1, scheduledStart: 1 });

module.exports = mongoose.model('WorkUnit', workUnitSchema);
