const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const schedulerController = require('../controllers/schedulerController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   POST /api/scheduler/generate
 * @desc    Generate schedule for user
 * @access  Private
 */
router.post(
  '/generate',
  authenticate,
  [
    query('date').optional().isISO8601()
  ],
  validate,
  schedulerController.generateSchedule
);

/**
 * @route   POST /api/scheduler/regenerate
 * @desc    Regenerate full schedule (clear and rebuild)
 * @access  Private
 */
router.post(
  '/regenerate',
  authenticate,
  schedulerController.regenerateSchedule
);

/**
 * @route   GET /api/scheduler/calendar
 * @desc    Get calendar (events + work units)
 * @access  Private
 */
router.get(
  '/calendar',
  authenticate,
  [
    query('rangeStart').isISO8601().withMessage('Valid rangeStart is required'),
    query('rangeEnd').isISO8601().withMessage('Valid rangeEnd is required')
  ],
  validate,
  schedulerController.getCalendar
);

/**
 * @route   POST /api/scheduler/calendar/import
 * @desc    Import external calendar events
 * @access  Private
 */
router.post(
  '/calendar/import',
  authenticate,
  [
    body('events').isArray().withMessage('Events must be an array'),
    body('events.*.start').isISO8601(),
    body('events.*.end').isISO8601(),
    body('events.*.title').notEmpty()
  ],
  validate,
  schedulerController.importCalendarEvents
);

module.exports = router;
