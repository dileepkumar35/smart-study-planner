const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const mentorController = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/mentor/users
 * @desc    Get list of students
 * @access  Private (mentor, parent, admin)
 */
router.get(
  '/users',
  authenticate,
  authorize('mentor', 'parent', 'admin'),
  mentorController.getStudents
);

/**
 * @route   GET /api/mentor/users/:userId/progress
 * @desc    Get student progress
 * @access  Private (mentor, parent, admin)
 */
router.get(
  '/users/:userId/progress',
  authenticate,
  authorize('mentor', 'parent', 'admin'),
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  mentorController.getStudentProgress
);

module.exports = router;
