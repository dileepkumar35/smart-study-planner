const Goal = require('../models/Goal');
const WorkUnit = require('../models/WorkUnit');

/**
 * Create a new goal
 * POST /api/goals
 */
exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, estimatedTotalMinutes, prerequisites } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      dueDate,
      priority,
      estimatedTotalMinutes,
      prerequisites: prerequisites || []
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all goals for current user
 * GET /api/goals
 */
exports.getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const goals = await Goal.find(filter)
      .populate('prerequisites', 'title status')
      .sort({ dueDate: 1, priority: -1 });

    res.json({
      success: true,
      data: { goals }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific goal
 * GET /api/goals/:id
 */
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('prerequisites', 'title status');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Get associated work units
    const workUnits = await WorkUnit.find({ goalId: goal._id })
      .sort({ scheduledStart: 1 });

    res.json({
      success: true,
      data: { goal, workUnits }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a goal
 * PUT /api/goals/:id
 */
exports.updateGoal = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, estimatedTotalMinutes, prerequisites, status } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (dueDate) updates.dueDate = dueDate;
    if (priority) updates.priority = priority;
    if (estimatedTotalMinutes) updates.estimatedTotalMinutes = estimatedTotalMinutes;
    if (prerequisites) updates.prerequisites = prerequisites;
    if (status) updates.status = status;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a goal
 * DELETE /api/goals/:id
 */
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete associated work units
    await WorkUnit.deleteMany({ goalId: goal._id });

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Prioritize a goal (adjust priority or deadline)
 * POST /api/goals/:id/prioritize
 */
exports.prioritizeGoal = async (req, res, next) => {
  try {
    const { priority, dueDate } = req.body;

    const updates = {};
    if (priority) updates.priority = priority;
    if (dueDate) updates.dueDate = dueDate;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal prioritized successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};
