const Notification = require('../models/Notification');

/**
 * Get notifications for current user
 * GET /api/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const notifications = await Notification.find(filter)
      .sort({ scheduledTime: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a notification
 * POST /api/notifications
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { type, payload, scheduledTime } = req.body;
    
    const notification = await Notification.create({
      userId: req.user._id,
      type,
      payload,
      scheduledTime: scheduledTime || new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test notification system
 * POST /api/notifications/test
 */
exports.testNotification = async (req, res, next) => {
  try {
    const { type } = req.body;
    
    const notification = await Notification.create({
      userId: req.user._id,
      type: type || 'browser',
      payload: {
        title: 'Test Notification',
        message: 'This is a test notification from Smart Study Planner',
        timestamp: new Date()
      },
      scheduledTime: new Date(),
      status: 'sent',
      sentAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as sent
 * PUT /api/notifications/:id/sent
 */
exports.markAsSent = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'sent', sentAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as sent',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};
