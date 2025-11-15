const Goal = require('../models/Goal');
const WorkUnit = require('../models/WorkUnit');
const User = require('../models/User');

/**
 * Get student progress (for mentor/parent view)
 * GET /api/mentor/users/:userId/progress
 */
exports.getStudentProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Verify the target user exists and get their info
    const student = await User.findById(userId).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get student's active goals
    const goals = await Goal.find({
      userId,
      status: { $in: ['active', 'completed'] }
    }).sort({ dueDate: 1 });
    
    // Get upcoming work units (next 7 days)
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingWorkUnits = await WorkUnit.find({
      userId,
      scheduledStart: { $gte: now, $lte: next7Days },
      status: { $in: ['todo', 'in-progress'] }
    }).populate('goalId', 'title priority')
      .sort({ scheduledStart: 1 });
    
    // Calculate progress metrics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalEstimatedMinutes = goals.reduce((sum, g) => sum + g.estimatedTotalMinutes, 0);
    const totalRemainingMinutes = goals.reduce((sum, g) => sum + g.remainingMinutes, 0);
    const totalCompletedMinutes = totalEstimatedMinutes - totalRemainingMinutes;
    
    const progressPercentage = totalEstimatedMinutes > 0 
      ? Math.round((totalCompletedMinutes / totalEstimatedMinutes) * 100)
      : 0;
    
    // Get completed work units in last 7 days
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCompletedUnits = await WorkUnit.find({
      userId,
      status: 'done',
      actualEnd: { $gte: last7Days, $lte: now }
    }).countDocuments();
    
    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          timezone: student.timezone
        },
        metrics: {
          totalGoals,
          completedGoals,
          activeGoals: totalGoals - completedGoals,
          progressPercentage,
          totalEstimatedMinutes,
          totalCompletedMinutes,
          totalRemainingMinutes,
          recentCompletedUnits
        },
        goals: goals.map(g => ({
          id: g._id,
          title: g.title,
          dueDate: g.dueDate,
          priority: g.priority,
          status: g.status,
          estimatedTotalMinutes: g.estimatedTotalMinutes,
          remainingMinutes: g.remainingMinutes,
          progress: Math.round(((g.estimatedTotalMinutes - g.remainingMinutes) / g.estimatedTotalMinutes) * 100)
        })),
        upcomingWorkUnits: upcomingWorkUnits.map(u => ({
          id: u._id,
          goal: u.goalId,
          scheduledStart: u.scheduledStart,
          scheduledEnd: u.scheduledEnd,
          durationMinutes: u.durationMinutes,
          status: u.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of students (for mentors/parents)
 * GET /api/mentor/users
 */
exports.getStudents = async (req, res, next) => {
  try {
    // For now, return all students
    // In production, you'd link students to specific mentors/parents
    const students = await User.find({ role: 'student' })
      .select('name email createdAt lastLogin')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: { students }
    });
  } catch (error) {
    next(error);
  }
};
