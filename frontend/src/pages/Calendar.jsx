import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Refresh
} from '@mui/icons-material';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import SharedNavbar from '../components/SharedNavbar';

const Calendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCalendar, rescheduleWorkUnit, regenerateSchedule } = useSchedule();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [workUnits, setWorkUnits] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    scheduledStart: '',
    scheduledEnd: ''
  });

  useEffect(() => {
    loadCalendar();
  }, [currentWeek]);

  const loadCalendar = async () => {
    setLoading(true);
    setError('');
    
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = addDays(weekStart, 6);
    
    try {
      const response = await fetchCalendar(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      
      if (response.success) {
        // Organize work units by day
        setWorkUnits(response.workUnits || []);
        setEvents(response.events || []);
      }
    } catch (err) {
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleOpenReschedule = (unit) => {
    setSelectedUnit(unit);
    setRescheduleData({
      scheduledStart: format(new Date(unit.scheduledStart), "yyyy-MM-dd'T'HH:mm"),
      scheduledEnd: format(new Date(unit.scheduledEnd), "yyyy-MM-dd'T'HH:mm")
    });
    setRescheduleDialog(true);
  };

  const handleCloseReschedule = () => {
    setRescheduleDialog(false);
    setSelectedUnit(null);
  };

  const handleReschedule = async () => {
    if (!selectedUnit) return;

    try {
      await rescheduleWorkUnit(
        selectedUnit._id,
        new Date(rescheduleData.scheduledStart).toISOString(),
        new Date(rescheduleData.scheduledEnd).toISOString()
      );
      handleCloseReschedule();
      loadCalendar();
    } catch (err) {
      setError('Failed to reschedule');
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await regenerateSchedule();
      loadCalendar();
    } catch (err) {
      setError('Failed to regenerate schedule');
    } finally {
      setLoading(false);
    }
  };

  const getUnitsForDay = (date) => {
    return workUnits.filter(unit => 
      isSameDay(new Date(unit.scheduledStart), date)
    );
  };

  const getEventsForDay = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start), date)
    );
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

  const weekStart = startOfWeek(currentWeek);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <SharedNavbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePreviousWeek}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h5">
              {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
            </Typography>
            <IconButton onClick={handleNextWeek}>
              <ChevronRight />
            </IconButton>
            <Button variant="outlined" onClick={handleToday}>
              Today
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRegenerate}
            disabled={loading}
          >
            Regenerate Schedule
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          {days.map((day) => {
            const dayUnits = getUnitsForDay(day);
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <Grid item xs={12} md={6} lg={3} key={day.toString()}>
                <Card sx={{ 
                  height: '100%',
                  border: isToday ? '2px solid' : 'none',
                  borderColor: 'primary.main'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {format(day, 'EEEE')}
                      {isToday && (
                        <Chip label="Today" color="primary" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {format(day, 'MMM d')}
                    </Typography>

                    {dayUnits.length === 0 && dayEvents.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        No scheduled items
                      </Typography>
                    )}

                    {/* Work Units */}
                    {dayUnits.map((unit) => (
                      <Card
                        key={unit._id}
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleOpenReschedule(unit)}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {unit.goalId?.title || 'Unknown Goal'}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {format(new Date(unit.scheduledStart), 'h:mm a')} - {format(new Date(unit.scheduledEnd), 'h:mm a')}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={unit.status}
                            color={getStatusColor(unit.status)}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Card>
                    ))}

                    {/* Calendar Events */}
                    {dayEvents.map((event) => (
                      <Card
                        key={event._id}
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'grey.300',
                          color: 'text.primary'
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {event.title}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                        </Typography>
                        <Chip
                          label="Event"
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                        />
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialog} onClose={handleCloseReschedule} maxWidth="sm" fullWidth>
          <DialogTitle>Reschedule Work Unit</DialogTitle>
          <DialogContent>
            {selectedUnit && (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>Goal:</strong> {selectedUnit.goalId?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {selectedUnit.durationMinutes} minutes
                </Typography>
                
                <TextField
                  margin="dense"
                  label="Start Time"
                  type="datetime-local"
                  fullWidth
                  value={rescheduleData.scheduledStart}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledStart: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  margin="dense"
                  label="End Time"
                  type="datetime-local"
                  fullWidth
                  value={rescheduleData.scheduledEnd}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledEnd: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReschedule}>Cancel</Button>
            <Button onClick={handleReschedule} variant="contained">
              Reschedule
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Calendar;
