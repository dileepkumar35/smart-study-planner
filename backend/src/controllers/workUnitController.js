const WorkUnit = require('../models/WorkUnit');
const Goal = require('../models/Goal');

/**
 * Get work units for a specific date
 * GET /api/work-units?date=YYYY-MM-DD
 */
exports.getWorkUnits = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.scheduledStart = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    if (status) {
      filter.status = status;
    }

    const workUnits = await WorkUnit.find(filter)
      .populate('goalId', 'title priority dueDate')
      .sort({ scheduledStart: 1 });

    res.json({
      success: true,
      data: { workUnits }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a work unit manually
 * POST /api/work-units
 */
exports.createWorkUnit = async (req, res, next) => {
  try {
    const { goalId, durationMinutes, scheduledStart, scheduledEnd } = req.body;

    // Verify goal belongs to user
    const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const workUnit = await WorkUnit.create({
      goalId,
      userId: req.user._id,
      durationMinutes,
      scheduledStart,
      scheduledEnd,
      sequenceIndex: 0
    });

    res.status(201).json({
      success: true,
      message: 'Work unit created successfully',
      data: { workUnit }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update work unit status
 * PUT /api/work-units/:id/status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const workUnit = await WorkUnit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workUnit) {
      return res.status(404).json({
        success: false,
        message: 'Work unit not found'
      });
    }

    workUnit.status = status;
    
    // Update timestamps based on status
    if (status === 'in-progress' && !workUnit.actualStart) {
      workUnit.actualStart = new Date();
    } else if (status === 'done') {
      if (!workUnit.actualStart) {
        workUnit.actualStart = new Date();
      }
      workUnit.actualEnd = new Date();
      
      // Update goal's remaining minutes
      const goal = await Goal.findById(workUnit.goalId);
      if (goal) {
        goal.remainingMinutes = Math.max(0, goal.remainingMinutes - workUnit.durationMinutes);
        if (goal.remainingMinutes === 0) {
          goal.status = 'completed';
        }
        await goal.save();
      }
    } else if (status === 'skipped') {
      workUnit.skippedAt = new Date();
    }

    await workUnit.save();

    res.json({
      success: true,
      message: 'Work unit status updated successfully',
      data: { workUnit }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule a work unit
 * PUT /api/work-units/:id/reschedule
 */
exports.rescheduleWorkUnit = async (req, res, next) => {
  try {
    const { scheduledStart, scheduledEnd } = req.body;

    const workUnit = await WorkUnit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { scheduledStart, scheduledEnd },
      { new: true, runValidators: true }
    );

    if (!workUnit) {
      return res.status(404).json({
        success: false,
        message: 'Work unit not found'
      });
    }

    res.json({
      success: true,
      message: 'Work unit rescheduled successfully',
      data: { workUnit }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a work unit
 * DELETE /api/work-units/:id
 */
exports.deleteWorkUnit = async (req, res, next) => {
  try {
    const workUnit = await WorkUnit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workUnit) {
      return res.status(404).json({
        success: false,
        message: 'Work unit not found'
      });
    }

    res.json({
      success: true,
      message: 'Work unit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
