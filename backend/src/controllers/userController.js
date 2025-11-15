const User = require('../models/User');
const UserAvailability = require('../models/UserAvailability');

/**
 * Get current user profile
 * GET /api/users/me
 */
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/me
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, timezone, availabilityRules } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (timezone) updates.timezone = timezone;
    if (availabilityRules) updates.availabilityRules = availabilityRules;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user availability
 * GET /api/users/me/availability
 */
exports.getAvailability = async (req, res, next) => {
  try {
    const availability = await UserAvailability.find({ userId: req.user._id });

    res.json({
      success: true,
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user availability
 * PUT /api/users/me/availability
 */
exports.updateAvailability = async (req, res, next) => {
  try {
    const { weekday, startTime, endTime, exceptions } = req.body;

    const availability = await UserAvailability.findOneAndUpdate(
      { userId: req.user._id, weekday },
      { startTime, endTime, exceptions },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};
