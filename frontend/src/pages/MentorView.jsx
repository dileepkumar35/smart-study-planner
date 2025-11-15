import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mentorAPI } from '../services/api';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Alert,
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MenuItemComponent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  AccountCircle,
  Person,
  CheckCircle,
  Schedule,
  TrendingUp
} from '@mui/icons-material';
import { format } from 'date-fns';

const MentorView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await mentorAPI.getStudents();
      setStudents(response.data.data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (studentId) => {
    setLoading(true);
    setError('');
    try {
      const response = await mentorAPI.getStudentProgress(studentId);
      setStudentProgress(response.data.data);
      setSelectedStudent(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student progress');
    } finally {
      setLoading(false);
    }
  };

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
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mentor/Parent View
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItemComponent disabled>{user?.name}</MenuItemComponent>
            <MenuItemComponent onClick={handleLogout}>Logout</MenuItemComponent>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={3}>
          {/* Students List */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {students.length === 0 && !loading && (
                  <Typography variant="body2" color="text.secondary">
                    No students found
                  </Typography>
                )}

                <List>
                  {students.map((student) => (
                    <ListItemButton
                      key={student._id}
                      selected={selectedStudent === student._id}
                      onClick={() => loadStudentProgress(student._id)}
                    >
                      <ListItemText
                        primary={student.name}
                        secondary={student.email}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Progress Details */}
          <Grid item xs={12} md={8}>
            {!studentProgress && !loading && (
              <Alert severity="info">
                Select a student to view their progress
              </Alert>
            )}

            {studentProgress && (
              <>
                {/* Student Info */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5">
                          {studentProgress.student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {studentProgress.student.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Timezone: {studentProgress.student.timezone}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Total Goals
                        </Typography>
                        <Typography variant="h4">
                          {studentProgress.metrics.totalGoals}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {studentProgress.metrics.completedGoals}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                        <Typography variant="h4">
                          {studentProgress.metrics.progressPercentage}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Recent Sessions
                        </Typography>
                        <Typography variant="h4">
                          {studentProgress.metrics.recentCompletedUnits}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 7 days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Goals Table */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Goals Overview
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Goal</strong></TableCell>
                            <TableCell><strong>Due Date</strong></TableCell>
                            <TableCell><strong>Priority</strong></TableCell>
                            <TableCell><strong>Progress</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentProgress.goals.map((goal) => (
                            <TableRow key={goal.id}>
                              <TableCell>{goal.title}</TableCell>
                              <TableCell>
                                {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={goal.priority}
                                  color={getPriorityColor(goal.priority)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={goal.progress}
                                    sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                  />
                                  <Typography variant="caption">
                                    {goal.progress}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={goal.status}
                                  color={getStatusColor(goal.status)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Upcoming Work Units */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Upcoming Sessions (Next 7 Days)
                    </Typography>
                    
                    {studentProgress.upcomingWorkUnits.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming sessions scheduled
                      </Typography>
                    ) : (
                      <List>
                        {studentProgress.upcomingWorkUnits.map((unit) => (
                          <ListItem key={unit.id} divider>
                            <ListItemText
                              primary={unit.goal?.title || 'Unknown Goal'}
                              secondary={
                                <>
                                  {format(new Date(unit.scheduledStart), 'MMM d, yyyy - h:mm a')} - {format(new Date(unit.scheduledEnd), 'h:mm a')}
                                  {' '}({unit.durationMinutes} min)
                                </>
                              }
                            />
                            <Chip
                              label={unit.status}
                              size="small"
                              color={unit.status === 'done' ? 'success' : 'default'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MentorView;
