const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'med', 'high'],
    default: 'med',
    required: true
  },
  estimatedTotalMinutes: {
    type: Number,
    required: [true, 'Estimated total minutes is required'],
    min: [1, 'Estimated time must be at least 1 minute']
  },
  remainingMinutes: {
    type: Number
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Initialize remainingMinutes to estimatedTotalMinutes on creation
goalSchema.pre('validate', function(next) {
  if (this.isNew && this.remainingMinutes === undefined) {
    this.remainingMinutes = this.estimatedTotalMinutes;
  }
  next();
});

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
