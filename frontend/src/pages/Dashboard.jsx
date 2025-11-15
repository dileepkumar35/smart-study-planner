import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import { useSchedule } from '../context/ScheduleContext';
import notificationService from '../utils/notificationService';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Check,
  SkipNext,
  CalendarMonth,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import SharedNavbar from '../components/SharedNavbar';
import { format } from 'date-fns';
import {
  sspTheme,
  GradientBox,
  StyledPaper,
  StyledCard,
  StyledButton,
  StyledTableRow,
  MetricCard,
  getStatusColor,
  getPriorityColor
} from '../theme/sspDesignSystem';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, fetchGoals } = useGoals();
  const { workUnits, fetchWorkUnits, updateWorkUnitStatus, generateSchedule } = useSchedule();
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
      fetchWorkUnits({ date: today, status: 'todo,in-progress,done' })
    ]);
    setLoading(false);
  };

  useEffect(() => {
    setTodayUnits(workUnits);
  }, [workUnits]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateWorkUnitStatus(id, status);
      
      // If skipped, trigger rescheduling to replace it
      if (status === 'skipped') {
        await generateSchedule();
      }
      
      await loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      const result = await generateSchedule();
      if (result.success) {
        // Wait a moment for backend to save, then reload
        setTimeout(async () => {
          await loadData();
        }, 500);
      } else {
        console.error('Schedule generation failed:', result.error);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error generating schedule:', err);
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted && todayUnits.length > 0) {
      notificationService.scheduleMultipleNotifications(todayUnits, 15);
    }
  };

  const calculateMetrics = () => {
    const totalUnits = todayUnits.length;
    const completedUnits = todayUnits.filter(u => u.status === 'done').length;
    const inProgressUnits = todayUnits.filter(u => u.status === 'in-progress').length;
    const totalMinutes = todayUnits.reduce((sum, u) => sum + u.durationMinutes, 0);
    
    return { totalUnits, completedUnits, inProgressUnits, totalMinutes };
  };

  const metrics = calculateMetrics();

  return (
    <ThemeProvider theme={sspTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <SharedNavbar />

        <GradientBox sx={{ py: 6, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <CalendarMonth sx={{ fontSize: 48, color: '#ffda1b', mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white', fontSize: { xs: '28px', sm: '32px', md: '42px' } }}>
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="h6" sx={{ color: '#e2e8f0', opacity: 0.9, fontSize: { xs: '14px', md: '18px' } }}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Container>
        </GradientBox>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4, mt: 0 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Schedule sx={{ fontSize: 40, color: '#ffda1b', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1 }}>
                  Total Tasks
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {metrics.totalUnits}
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Check sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1 }}>
                  Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {metrics.completedUnits}
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <PlayArrow sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1 }}>
                  In Progress
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {metrics.inProgressUnits}
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1 }}>
                  Total Minutes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {metrics.totalMinutes}
                </Typography>
              </MetricCard>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Today's Work Units */}
            <Grid item xs={12} md={8}>
              <StyledPaper sx={{ p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#232536' }}>
                      Today's Schedule
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  <StyledButton
                    variant="contained"
                    onClick={handleGenerateSchedule}
                    disabled={loading}
                    startIcon={<Add />}
                  >
                    Generate Schedule
                  </StyledButton>
                </Box>

                {todayUnits.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No work units scheduled for today. Click "Generate Schedule" to create your study plan.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Goal</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {todayUnits.map((unit) => (
                          <StyledTableRow key={unit._id}>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {unit.goalId?.title || 'Unknown Goal'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {format(new Date(unit.scheduledStart), 'h:mm a')} - {format(new Date(unit.scheduledEnd), 'h:mm a')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {unit.durationMinutes} min
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={unit.goalId?.priority || 'med'}
                                color={getPriorityColor(unit.goalId?.priority)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={unit.status}
                                color={getStatusColor(unit.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {unit.status === 'todo' && (
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleStatusUpdate(unit._id, 'in-progress')}
                                    title="Start"
                                  >
                                    <PlayArrow />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleStatusUpdate(unit._id, 'done')}
                                    title="Mark Done"
                                  >
                                    <Check />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusUpdate(unit._id, 'skipped')}
                                    title="Skip"
                                  >
                                    <SkipNext />
                                  </IconButton>
                                </Box>
                              )}
                              {unit.status === 'in-progress' && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusUpdate(unit._id, 'done')}
                                  title="Mark Done"
                                >
                                  <Check />
                                </IconButton>
                              )}
                            </TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </StyledPaper>
            </Grid>

          {/* Active Goals */}
          <Grid item xs={12} md={4}>
            <StyledPaper sx={{ p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#232536' }}>
                  Active Goals
                </Typography>
                <IconButton 
                  sx={{
                    backgroundColor: '#ffda1b',
                    color: '#232536',
                    '&:hover': {
                      backgroundColor: '#232536',
                      color: '#ffda1b',
                    },
                  }}
                  onClick={() => navigate('/goals')}
                >
                  <Add />
                </IconButton>
              </Box>

              {goals.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No active goals. Create your first goal to get started!
                </Alert>
              ) : (
                goals.slice(0, 5).map((goal) => (
                  <StyledCard key={goal._id} sx={{ mb: 2, p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Due: {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={((goal.estimatedTotalMinutes - goal.remainingMinutes) / goal.estimatedTotalMinutes) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#ffda1b',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {goal.remainingMinutes} min remaining
                      </Typography>
                    </Box>
                    <Chip
                      label={goal.priority}
                      color={getPriorityColor(goal.priority)}
                      size="small"
                    />
                  </StyledCard>
                ))
              )}
            </StyledPaper>
          </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
