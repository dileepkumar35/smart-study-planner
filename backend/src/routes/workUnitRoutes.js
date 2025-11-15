const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const workUnitController = require('../controllers/workUnitController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/work-units
 * @desc    Get work units (optionally filtered by date)
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('date').optional().isISO8601(),
    query('status').optional().isIn(['todo', 'in-progress', 'done', 'skipped', 'overdue'])
  ],
  validate,
  workUnitController.getWorkUnits
);

/**
 * @route   POST /api/work-units
 * @desc    Create a work unit manually
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('goalId').isMongoId().withMessage('Valid goal ID is required'),
    body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('scheduledStart').isISO8601().withMessage('Valid scheduled start time is required'),
    body('scheduledEnd').isISO8601().withMessage('Valid scheduled end time is required')
  ],
  validate,
  workUnitController.createWorkUnit
);

/**
 * @route   PUT /api/work-units/:id/status
 * @desc    Update work unit status
 * @access  Private
 */
router.put(
  '/:id/status',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid work unit ID'),
    body('status').isIn(['todo', 'in-progress', 'done', 'skipped', 'overdue'])
      .withMessage('Invalid status')
  ],
  validate,
  workUnitController.updateStatus
);

/**
 * @route   PUT /api/work-units/:id/reschedule
 * @desc    Reschedule a work unit
 * @access  Private
 */
router.put(
  '/:id/reschedule',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid work unit ID'),
    body('scheduledStart').isISO8601().withMessage('Valid scheduled start time is required'),
    body('scheduledEnd').isISO8601().withMessage('Valid scheduled end time is required')
  ],
  validate,
  workUnitController.rescheduleWorkUnit
);

/**
 * @route   DELETE /api/work-units/:id
 * @desc    Delete a work unit
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid work unit ID')
  ],
  validate,
  workUnitController.deleteWorkUnit
);

module.exports = router;
