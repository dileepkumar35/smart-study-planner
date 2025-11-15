const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const goalController = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    body('description').optional().trim(),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('priority').isIn(['low', 'med', 'high']).withMessage('Priority must be low, med, or high'),
    body('estimatedTotalMinutes').isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
    body('prerequisites').optional().isArray()
  ],
  validate,
  goalController.createGoal
);

/**
 * @route   GET /api/goals
 * @desc    Get all goals for current user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['active', 'archived', 'completed'])
  ],
  validate,
  goalController.getGoals
);

/**
 * @route   GET /api/goals/:id
 * @desc    Get a specific goal
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid goal ID')
  ],
  validate,
  goalController.getGoal
);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid goal ID'),
    body('title').optional().trim().isLength({ min: 3 }),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601(),
    body('priority').optional().isIn(['low', 'med', 'high']),
    body('estimatedTotalMinutes').optional().isInt({ min: 1 }),
    body('prerequisites').optional().isArray(),
    body('status').optional().isIn(['active', 'archived', 'completed'])
  ],
  validate,
  goalController.updateGoal
);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid goal ID')
  ],
  validate,
  goalController.deleteGoal
);

/**
 * @route   POST /api/goals/:id/prioritize
 * @desc    Prioritize a goal
 * @access  Private
 */
router.post(
  '/:id/prioritize',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid goal ID'),
    body('priority').optional().isIn(['low', 'med', 'high']),
    body('dueDate').optional().isISO8601()
  ],
  validate,
  goalController.prioritizeGoal
);

module.exports = router;
