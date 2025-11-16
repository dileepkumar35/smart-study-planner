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
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Refresh,
  ViewWeek,
  CalendarMonth,
  ViewDay
} from '@mui/icons-material';
import { 
  format, 
  startOfWeek, 
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays, 
  addWeeks, 
  addMonths,
  subWeeks, 
  subMonths,
  subDays,
  isSameDay,
  isSameMonth,
  eachDayOfInterval,
  getDay
} from 'date-fns';
import SharedNavbar from '../components/SharedNavbar';

const Calendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCalendar, rescheduleWorkUnit, regenerateSchedule } = useSchedule();
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
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
  }, [currentDate, viewMode]);

  const loadCalendar = async () => {
    setLoading(true);
    setError('');
    
    let rangeStart, rangeEnd;
    
    switch (viewMode) {
      case 'day':
        rangeStart = startOfDay(currentDate);
        rangeEnd = endOfDay(currentDate);
        break;
      case 'week':
        rangeStart = startOfWeek(currentDate);
        rangeEnd = addDays(rangeStart, 6);
        break;
      case 'month':
        rangeStart = startOfMonth(currentDate);
        rangeEnd = endOfMonth(currentDate);
        break;
      default:
        rangeStart = startOfWeek(currentDate);
        rangeEnd = addDays(rangeStart, 6);
    }
    
    try {
      const response = await fetchCalendar(
        rangeStart.toISOString(),
        rangeEnd.toISOString()
      );
      
      if (response.success) {
        setWorkUnits(response.workUnits || []);
        setEvents(response.events || []);
      }
    } catch (err) {
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
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

  const getDateRangeText = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        return `${format(weekStart, 'MMMM d')} - ${format(addDays(weekStart, 6), 'MMMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const renderDayView = () => {
    const dayUnits = getUnitsForDay(currentDate);
    const dayEvents = getEventsForDay(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Calculate position and height for time blocks
    const getBlockStyle = (startTime, endTime, nestLevel = 0) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();
      
      // Calculate top position relative to the hour (not the parent)
      const topOffset = startMinute;
      
      // Calculate height in minutes
      const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      
      // Add left padding for nested items - each level indents 80px
      const leftPadding = nestLevel > 0 ? `${80 * nestLevel}px` : 0;
      const rightPadding = nestLevel > 0 ? '8px' : 0;
      
      return {
        position: 'absolute',
        top: `${topOffset}px`,
        left: leftPadding,
        right: rightPadding,
        height: `${durationMinutes}px`,
        minHeight: `${durationMinutes}px`
      };
    };

    // Check if a time range is nested within another
    const isNestedWithin = (innerStart, innerEnd, outerStart, outerEnd) => {
      const inner1 = new Date(innerStart).getTime();
      const inner2 = new Date(innerEnd).getTime();
      const outer1 = new Date(outerStart).getTime();
      const outer2 = new Date(outerEnd).getTime();
      
      // Inner must start at or after outer start AND end at or before outer end
      // But should not be exactly the same (that would be duplicate, not nested)
      return inner1 >= outer1 && inner2 <= outer2 && !(inner1 === outer1 && inner2 === outer2);
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
            {hours.map((hour) => {
              // Get all units and events starting in this hour
              const unitsStartingInHour = dayUnits.filter(unit => {
                const startHour = new Date(unit.scheduledStart).getHours();
                return startHour === hour;
              });

              const eventsStartingInHour = dayEvents.filter(event => {
                const startHour = new Date(event.start).getHours();
                return startHour === hour;
              });

              // Combine all items for nesting analysis
              const allItems = [
                ...unitsStartingInHour.map(u => ({ ...u, type: 'unit' })),
                ...eventsStartingInHour.map(e => ({ ...e, type: 'event' }))
              ];

              // Sort by start time, then by duration (longer tasks first to establish parent hierarchy)
              allItems.sort((a, b) => {
                const aStart = new Date(a.type === 'unit' ? a.scheduledStart : a.start).getTime();
                const bStart = new Date(b.type === 'unit' ? b.scheduledStart : b.start).getTime();
                
                if (aStart !== bStart) {
                  return aStart - bStart; // Earlier start time first
                }
                
                // If same start time, longer duration first (parent before children)
                const aEnd = new Date(a.type === 'unit' ? a.scheduledEnd : a.end).getTime();
                const bEnd = new Date(b.type === 'unit' ? b.scheduledEnd : b.end).getTime();
                const aDuration = aEnd - aStart;
                const bDuration = bEnd - bStart;
                return bDuration - aDuration;
              });

              // Calculate nesting levels for each item
              const itemsWithNesting = [];
              
              for (let i = 0; i < allItems.length; i++) {
                const item = allItems[i];
                let nestLevel = 0;
                let parentIndex = -1;
                
                const itemStart = item.type === 'unit' ? item.scheduledStart : item.start;
                const itemEnd = item.type === 'unit' ? item.scheduledEnd : item.end;
                
                // Find the most immediate parent (last item that contains this one)
                for (let j = i - 1; j >= 0; j--) {
                  const potentialParent = itemsWithNesting[j];
                  const parentStart = potentialParent.type === 'unit' ? potentialParent.scheduledStart : potentialParent.start;
                  const parentEnd = potentialParent.type === 'unit' ? potentialParent.scheduledEnd : potentialParent.end;
                  
                  if (isNestedWithin(itemStart, itemEnd, parentStart, parentEnd)) {
                    nestLevel = potentialParent.nestLevel + 1;
                    parentIndex = j;
                    break; // Found immediate parent
                  }
                }
                
                itemsWithNesting.push({
                  ...item,
                  nestLevel,
                  parentIndex
                });
              }

              return (
                <Box key={hour} sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: '60px', position: 'relative' }}>
                  <Box sx={{ width: '80px', p: 1, borderRight: '1px solid #e0e0e0', flexShrink: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, position: 'relative', minHeight: '60px' }}>
                    {itemsWithNesting.map((item, idx) => {
                      if (item.type === 'unit') {
                        const blockStyle = getBlockStyle(item.scheduledStart, item.scheduledEnd, item.nestLevel);
                        return (
                          <Card
                            key={item._id}
                            sx={{
                              ...blockStyle,
                              p: 1,
                              bgcolor: '#fef08a',
                              cursor: 'pointer',
                              border: item.nestLevel > 0 ? '1px solid #facc15' : 'none',
                              boxShadow: item.nestLevel > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              borderRadius: 1,
                              zIndex: item.nestLevel + 1,
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                bgcolor: '#fde047'
                              }
                            }}
                            onClick={() => handleOpenReschedule(item)}
                          >
                            <Typography variant="body2" fontWeight="bold" sx={{ color: '#000' }}>
                              {item.goalId?.title || 'Unknown Goal'}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: '#000' }}>
                              {format(new Date(item.scheduledStart), 'h:mm a')} - {format(new Date(item.scheduledEnd), 'h:mm a')}
                            </Typography>
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                              sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                            />
                          </Card>
                        );
                      } else {
                        const blockStyle = getBlockStyle(item.start, item.end, item.nestLevel);
                        return (
                          <Card
                            key={item._id}
                            sx={{
                              ...blockStyle,
                              p: 1,
                              bgcolor: '#38bdf8',
                              border: item.nestLevel > 0 ? '1px solid #0ea5e9' : 'none',
                              boxShadow: item.nestLevel > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              borderRadius: 1,
                              zIndex: item.nestLevel + 1
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: '#fff' }}>
                              {format(new Date(item.start), 'h:mm a')} - {format(new Date(item.end), 'h:mm a')}
                            </Typography>
                          </Card>
                        );
                      }
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <Grid container spacing={2}>
        {days.map((day) => {
          const dayUnits = getUnitsForDay(day);
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Grid item xs={12} md={6} lg={1.714} key={day.toString()}>
              <Card sx={{ 
                height: '100%',
                border: isToday ? '2px solid' : 'none',
                borderColor: 'primary.main'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {format(day, 'EEE')}
                    {isToday && (
                      <Chip label="Today" color="primary" size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {format(day, 'MMM d')}
                  </Typography>

                  {dayUnits.length === 0 && dayEvents.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                      No items
                    </Typography>
                  )}

                  {dayUnits.map((unit) => (
                    <Card
                      key={unit._id}
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: 'primary.light',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenReschedule(unit)}
                    >
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {unit.goalId?.title || 'Unknown Goal'}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
                        {format(new Date(unit.scheduledStart), 'h:mm a')}
                      </Typography>
                      <Chip
                        label={unit.status}
                        color={getStatusColor(unit.status)}
                        size="small"
                        sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                      />
                    </Card>
                  ))}

                  {dayEvents.map((event) => (
                    <Card
                      key={event._id}
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: 'grey.300'
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold" display="block">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
                        {format(new Date(event.start), 'h:mm a')}
                      </Typography>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = addDays(startOfWeek(monthEnd), 6);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <Card>
        <CardContent>
          <Grid container spacing={1}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Typography variant="subtitle2" align="center" fontWeight="bold">
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {weeks.map((week, weekIndex) => (
            <Grid container spacing={1} key={weekIndex} sx={{ mt: 0.5 }}>
              {week.map((day) => {
                const dayUnits = getUnitsForDay(day);
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <Grid item xs={12/7} key={day.toString()}>
                    <Card
                      sx={{
                        minHeight: '100px',
                        bgcolor: isToday ? 'primary.light' : isCurrentMonth ? 'white' : 'grey.50',
                        border: isToday ? '2px solid' : '1px solid',
                        borderColor: isToday ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewMode('day');
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography 
                          variant="caption" 
                          fontWeight={isToday ? 'bold' : 'normal'}
                          color={isCurrentMonth ? 'text.primary' : 'text.secondary'}
                        >
                          {format(day, 'd')}
                        </Typography>
                        
                        <Box sx={{ mt: 0.5 }}>
                          {dayUnits.slice(0, 2).map((unit) => (
                            <Box
                              key={unit._id}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: 0.5,
                                px: 0.5,
                                mb: 0.25,
                                fontSize: '0.6rem'
                              }}
                            >
                              {unit.goalId?.title?.substring(0, 15) || 'Task'}
                            </Box>
                          ))}
                          {dayEvents.slice(0, 1).map((event) => (
                            <Box
                              key={event._id}
                              sx={{
                                bgcolor: 'grey.500',
                                color: 'white',
                                borderRadius: 0.5,
                                px: 0.5,
                                mb: 0.25,
                                fontSize: '0.6rem'
                              }}
                            >
                              {event.title?.substring(0, 15) || 'Event'}
                            </Box>
                          ))}
                          {(dayUnits.length + dayEvents.length > 3) && (
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              +{dayUnits.length + dayEvents.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <SharedNavbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <IconButton onClick={handlePrevious}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h5" sx={{ minWidth: '250px' }}>
              {getDateRangeText()}
            </Typography>
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
            <Button variant="outlined" onClick={handleToday}>
              Today
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="day">
                <ViewDay sx={{ mr: 0.5 }} /> Day
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek sx={{ mr: 0.5 }} /> Week
              </ToggleButton>
              <ToggleButton value="month">
                <CalendarMonth sx={{ mr: 0.5 }} /> Month
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRegenerate}
              disabled={loading}
            >
              Regenerate
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}

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
