import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  AppBar,
  Toolbar,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  AccountCircle,
  Flag
} from '@mui/icons-material';
import { format } from 'date-fns';

const Goals = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, deleteGoal, prioritizeGoal } = useGoals();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
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

  const calculateProgress = (goal) => {
    if (goal.estimatedTotalMinutes === 0) return 0;
    return ((goal.estimatedTotalMinutes - goal.remainingMinutes) / goal.estimatedTotalMinutes) * 100;
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Goals Management
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
          <Button color="inherit" onClick={() => navigate('/availability')}>
            Availability
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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Goals</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            New Goal
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {goals.length === 0 && !loading && (
          <Alert severity="info">
            No goals yet. Create your first goal to get started!
          </Alert>
        )}

        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
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
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </DialogTitle>
            <DialogContent>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}

              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Goal Title"
                type="text"
                fullWidth
                required
                value={formData.title}
                onChange={handleChange}
              />

              <TextField
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

              <TextField
                margin="dense"
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.dueDate}
                onChange={handleChange}
              />

              <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="med">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <TextField
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
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingGoal ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Goals;
