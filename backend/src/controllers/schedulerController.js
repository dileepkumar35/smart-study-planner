const SchedulerEngine = require('../services/SchedulerEngine');
const CalendarEvent = require('../models/CalendarEvent');
const WorkUnit = require('../models/WorkUnit');

/**
 * Generate schedule for user
 * POST /api/scheduler/generate
 */
exports.generateSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    const scheduler = new SchedulerEngine(req.user._id, req.user.timezone);
    const result = await scheduler.generate(date);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        workUnits: result.workUnits,
        conflicts: result.conflicts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calendar (events + work units)
 * GET /api/scheduler/calendar
 */
exports.getCalendar = async (req, res, next) => {
  try {
    const { rangeStart, rangeEnd } = req.query;
    
    if (!rangeStart || !rangeEnd) {
      return res.status(400).json({
        success: false,
        message: 'rangeStart and rangeEnd are required'
      });
    }
    
    const startDate = new Date(rangeStart);
    const endDate = new Date(rangeEnd);
    
    // Get calendar events
    const events = await CalendarEvent.find({
      userId: req.user._id,
      start: { $gte: startDate, $lte: endDate }
    }).sort({ start: 1 });
    
    // Get work units (exclude skipped to prevent duplicates)
    const workUnits = await WorkUnit.find({
      userId: req.user._id,
      scheduledStart: { $gte: startDate, $lte: endDate },
      status: { $in: ['todo', 'in-progress', 'done'] }
    }).populate('goalId', 'title priority')
      .sort({ scheduledStart: 1 });
    
    res.json({
      success: true,
      data: {
        events,
        workUnits
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import external calendar events
 * POST /api/scheduler/calendar/import
 */
exports.importCalendarEvents = async (req, res, next) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: 'Events must be an array'
      });
    }
    
    const imported = [];
    
    for (const event of events) {
      const calendarEvent = await CalendarEvent.create({
        userId: req.user._id,
        source: 'external',
        start: event.start,
        end: event.end,
        title: event.title,
        metadata: event.metadata || {}
      });
      
      imported.push(calendarEvent);
    }
    
    res.json({
      success: true,
      message: `Imported ${imported.length} calendar events`,
      data: { events: imported }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate schedule (clear and rebuild)
 * POST /api/scheduler/regenerate
 */
exports.regenerateSchedule = async (req, res, next) => {
  try {
    // Delete all pending and skipped work units
    await WorkUnit.deleteMany({
      userId: req.user._id,
      status: { $in: ['todo', 'skipped'] }
    });
    
    // Generate new schedule
    const scheduler = new SchedulerEngine(req.user._id, req.user.timezone);
    const result = await scheduler.generate();
    
    res.json({
      success: true,
      message: 'Schedule regenerated successfully',
      data: {
        workUnits: result.workUnits,
        conflicts: result.conflicts
      }
    });
  } catch (error) {
    next(error);
  }
};
