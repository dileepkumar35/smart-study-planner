import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import { useSchedule } from '../context/ScheduleContext';
import notificationService from '../utils/notificationService';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  AccountCircle,
  Add,
  PlayArrow,
  Check,
  SkipNext,
  Notifications
} from '@mui/icons-material';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { goals, fetchGoals } = useGoals();
  const { workUnits, fetchWorkUnits, updateWorkUnitStatus, generateSchedule } = useSchedule();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayUnits, setTodayUnits] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Schedule notifications for today's work units
    if (todayUnits.length > 0 && notificationService.isPermissionGranted()) {
      notificationService.scheduleMultipleNotifications(todayUnits, 15);
    }
  }, [todayUnits]);

  const loadData = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    await Promise.all([
      fetchGoals({ status: 'active' }),
      fetchWorkUnits({ date: today })
    ]);
    setLoading(false);
  };

  useEffect(() => {
    setTodayUnits(workUnits);
  }, [workUnits]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (id, status) => {
    await updateWorkUnitStatus(id, status);
    loadData();
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    const result = await generateSchedule();
    if (result.success) {
      loadData();
    }
    setLoading(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted && todayUnits.length > 0) {
      notificationService.scheduleMultipleNotifications(todayUnits, 15);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'med': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'success';
      case 'in-progress': return 'primary';
      case 'skipped': return 'default';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Study Planner
          </Typography>
          <Button color="inherit" onClick={() => navigate('/goals')}>
            Goals
          </Button>
          <Button color="inherit" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
          <Button color="inherit" onClick={() => navigate('/availability')}>
            Availability
          </Button>
          {['mentor', 'parent', 'admin'].includes(user?.role) && (
            <Button color="inherit" onClick={() => navigate('/mentor')}>
              Mentor View
            </Button>
          )}
          {!notificationService.isPermissionGranted() && (
            <IconButton 
              color="inherit" 
              onClick={handleEnableNotifications}
              title="Enable Notifications"
            >
              <Notifications />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>{user?.name}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.name}!
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={3}>
          {/* Today's Work Units */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Today's Schedule ({format(new Date(), 'MMMM d, yyyy')})
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateSchedule}
                    disabled={loading}
                  >
                    Generate Schedule
                  </Button>
                </Box>

                {todayUnits.length === 0 ? (
                  <Alert severity="info">
                    No work units scheduled for today. Click "Generate Schedule" to create your study plan.
                  </Alert>
                ) : (
                  todayUnits.map((unit) => (
                    <Card key={unit._id} sx={{ mb: 2 }} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">
                              {unit.goalId?.title || 'Unknown Goal'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(unit.scheduledStart), 'h:mm a')} - {format(new Date(unit.scheduledEnd), 'h:mm a')}
                              {' '}({unit.durationMinutes} min)
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={unit.goalId?.priority || 'med'}
                                color={getPriorityColor(unit.goalId?.priority)}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={unit.status}
                                color={getStatusColor(unit.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Box>
                            {unit.status === 'todo' && (
                              <>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleStatusUpdate(unit._id, 'in-progress')}
                                  title="Start"
                                >
                                  <PlayArrow />
                                </IconButton>
                                <IconButton
                                  color="success"
                                  onClick={() => handleStatusUpdate(unit._id, 'done')}
                                  title="Mark Done"
                                >
                                  <Check />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleStatusUpdate(unit._id, 'skipped')}
                                  title="Skip"
                                >
                                  <SkipNext />
                                </IconButton>
                              </>
                            )}
                            {unit.status === 'in-progress' && (
                              <IconButton
                                color="success"
                                onClick={() => handleStatusUpdate(unit._id, 'done')}
                                title="Mark Done"
                              >
                                <Check />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Active Goals */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Active Goals</Typography>
                  <IconButton color="primary" onClick={() => navigate('/goals')}>
                    <Add />
                  </IconButton>
                </Box>

                {goals.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No active goals. Create your first goal to get started!
                  </Typography>
                ) : (
                  goals.slice(0, 5).map((goal) => (
                    <Card key={goal._id} sx={{ mb: 2 }} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{goal.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={((goal.estimatedTotalMinutes - goal.remainingMinutes) / goal.estimatedTotalMinutes) * 100}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {goal.remainingMinutes} min remaining
                          </Typography>
                        </Box>
                        <Chip
                          label={goal.priority}
                          color={getPriorityColor(goal.priority)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
