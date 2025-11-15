import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Flag,
  AssignmentTurnedIn,
  CalendarToday
} from '@mui/icons-material';
import SharedNavbar from '../components/SharedNavbar';
import { format } from 'date-fns';
import {
  sspTheme,
  GradientBox,
  StyledPaper,
  StyledCard,
  StyledTextField,
  StyledButton,
  getPriorityColor,
  getStatusColor
} from '../theme/sspDesignSystem';

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, deleteGoal, prioritizeGoal } = useGoals();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'med',
    estimatedTotalMinutes: 60,
    status: 'active'
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        dueDate: format(new Date(goal.dueDate), 'yyyy-MM-dd'),
        priority: goal.priority,
        estimatedTotalMinutes: goal.estimatedTotalMinutes,
        status: goal.status
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        priority: 'med',
        estimatedTotalMinutes: 60,
        status: 'active'
      });
    }
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    setFormError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    if (!formData.dueDate) {
      setFormError('Due date is required');
      return;
    }

    if (formData.estimatedTotalMinutes < 1) {
      setFormError('Estimated time must be at least 1 minute');
      return;
    }

    const goalData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString()
    };

    let result;
    if (editingGoal) {
      result = await updateGoal(editingGoal._id, goalData);
    } else {
      result = await createGoal(goalData);
    }

    if (result.success) {
      handleCloseDialog();
      fetchGoals();
    } else {
      setFormError(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
      fetchGoals();
    }
  };

  const handlePrioritize = async (id, priority) => {
    await prioritizeGoal(id, { priority });
    fetchGoals();
  };

  const calculateProgress = (goal) => {
    if (goal.estimatedTotalMinutes === 0) return 0;
    return ((goal.estimatedTotalMinutes - goal.remainingMinutes) / goal.estimatedTotalMinutes) * 100;
  };

  return (
    <ThemeProvider theme={sspTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <SharedNavbar />

        <GradientBox sx={{ py: 6, width: '100%' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <AssignmentTurnedIn sx={{ fontSize: 48, color: '#ffda1b', mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white', fontSize: { xs: '28px', sm: '32px', md: '42px' } }}>
              Your Goals
            </Typography>
            <Typography variant="h6" sx={{ color: '#e2e8f0', opacity: 0.9, fontSize: { xs: '14px', md: '18px' } }}>
              Manage and track your learning objectives
            </Typography>
          </Container>
        </GradientBox>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <StyledPaper sx={{ p: 4, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#232536' }}>
                  My Goals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {goals.length} total goal{goals.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <StyledButton
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                New Goal
              </StyledButton>
            </Box>
          </StyledPaper>

          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          {goals.length === 0 && !loading && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No goals yet. Create your first goal to get started!
            </Alert>
          )}

          <Grid container spacing={3}>
            {goals.map((goal) => (
              <Grid item xs={12} md={6} lg={4} key={goal._id}>
                <StyledCard sx={{ p: 3, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
                      {goal.title}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(goal._id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Due: {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining: {goal.remainingMinutes} min / {goal.estimatedTotalMinutes} min
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(goal)}
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
                      {Math.round(calculateProgress(goal))}% complete
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={goal.priority}
                      color={getPriorityColor(goal.priority)}
                      size="small"
                      icon={<Flag />}
                      onClick={() => {
                        const priorities = ['low', 'med', 'high'];
                        const currentIndex = priorities.indexOf(goal.priority);
                        const nextPriority = priorities[(currentIndex + 1) % 3];
                        handlePrioritize(goal._id, nextPriority);
                      }}
                    />
                    <Chip
                      label={goal.status}
                      color={getStatusColor(goal.status)}
                      size="small"
                    />
                    {goal.prerequisites && goal.prerequisites.length > 0 && (
                      <Chip
                        label={`${goal.prerequisites.length} prereq`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          {/* Create/Edit Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
              <DialogTitle sx={{ backgroundColor: '#232536', color: 'white', fontWeight: 600 }}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                {formError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {formError}
                  </Alert>
                )}

                <StyledTextField
                  autoFocus
                  margin="dense"
                  name="title"
                  label="Goal Title"
                  type="text"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentTurnedIn sx={{ color: '#232536' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />

                <StyledTextField
                  margin="dense"
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.dueDate}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#232536' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth margin="dense">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    label="Priority"
                    onChange={handleChange}
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#232536',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffda1b',
                        borderWidth: '2px',
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="med">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>

                <StyledTextField
                  margin="dense"
                  name="estimatedTotalMinutes"
                  label="Estimated Time (minutes)"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  value={formData.estimatedTotalMinutes}
                  onChange={handleChange}
                />

                {editingGoal && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleChange}
                      sx={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e2e8f0',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#232536',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ffda1b',
                          borderWidth: '2px',
                        },
                      }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseDialog} sx={{ color: '#232536' }}>Cancel</Button>
                <StyledButton type="submit" variant="contained">
                  {editingGoal ? 'Update' : 'Create'}
                </StyledButton>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Goals;
