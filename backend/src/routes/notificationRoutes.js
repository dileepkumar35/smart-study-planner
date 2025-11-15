const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['pending', 'sent', 'failed'])
  ],
  validate,
  notificationController.getNotifications
);

/**
 * @route   POST /api/notifications
 * @desc    Create a notification
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['email', 'browser', 'webhook']).withMessage('Type must be email, browser, or webhook'),
    body('payload').isObject().withMessage('Payload must be an object'),
    body('scheduledTime').optional().isISO8601()
  ],
  validate,
  notificationController.createNotification
);

/**
 * @route   POST /api/notifications/test
 * @desc    Test notification system
 * @access  Private
 */
router.post(
  '/test',
  authenticate,
  [
    body('type').optional().isIn(['email', 'browser', 'webhook'])
  ],
  validate,
  notificationController.testNotification
);

/**
 * @route   PUT /api/notifications/:id/sent
 * @desc    Mark notification as sent
 * @access  Private
 */
router.put(
  '/:id/sent',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
  validate,
  notificationController.markAsSent
);

module.exports = router;
