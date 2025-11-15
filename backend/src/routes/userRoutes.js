const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/users/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('timezone').optional().isString(),
    body('availabilityRules').optional().isObject()
  ],
  validate,
  userController.updateMe
);

/**
 * @route   GET /api/users/me/availability
 * @desc    Get user availability
 * @access  Private
 */
router.get('/me/availability', authenticate, userController.getAvailability);

/**
 * @route   PUT /api/users/me/availability
 * @desc    Update user availability
 * @access  Private
 */
router.put(
  '/me/availability',
  authenticate,
  [
    body('weekday').isInt({ min: 0, max: 6 }).withMessage('Weekday must be between 0 and 6'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
    body('exceptions').optional().isArray()
  ],
  validate,
  userController.updateAvailability
);

module.exports = router;
