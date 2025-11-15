import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Save,
  Add,
  Delete
} from '@mui/icons-material';
import SharedNavbar from '../components/SharedNavbar';

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const Availability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getAvailability();
      setAvailability(response.data.data.availability);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDay = (weekday) => {
    const existing = availability.find(a => a.weekday === weekday);
    if (existing) {
      setFormData({
        startTime: existing.startTime,
        endTime: existing.endTime
      });
    } else {
      setFormData({
        startTime: '09:00',
        endTime: '17:00'
      });
    }
    setEditingDay(weekday);
  };

  const handleSaveDay = async () => {
    if (!editingDay === null) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateAvailability({
        weekday: editingDay,
        startTime: formData.startTime,
        endTime: formData.endTime,
        exceptions: []
      });
      
      setSuccess('Availability updated successfully!');
      setEditingDay(null);
      loadAvailability();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setFormData({
      startTime: '09:00',
      endTime: '17:00'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getAvailabilityForDay = (weekday) => {
    return availability.find(a => a.weekday === weekday);
  };

  const calculateHours = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const hours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
    return hours.toFixed(1);
  };

  const totalWeeklyHours = availability.reduce((total, av) => {
    return total + parseFloat(calculateHours(av.startTime, av.endTime));
  }, 0);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <SharedNavbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Weekly Availability
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set your available study hours for each day of the week
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Day</strong></TableCell>
                    <TableCell><strong>Start Time</strong></TableCell>
                    <TableCell><strong>End Time</strong></TableCell>
                    <TableCell><strong>Hours</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {WEEKDAYS.map((day) => {
                    const av = getAvailabilityForDay(day.value);
                    const isEditing = editingDay === day.value;

                    return (
                      <TableRow key={day.value}>
                        <TableCell>{day.label}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              type="time"
                              name="startTime"
                              value={formData.startTime}
                              onChange={handleChange}
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          ) : (
                            av ? av.startTime : '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              type="time"
                              name="endTime"
                              value={formData.endTime}
                              onChange={handleChange}
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          ) : (
                            av ? av.endTime : '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            calculateHours(formData.startTime, formData.endTime) + ' hrs'
                          ) : (
                            av ? calculateHours(av.startTime, av.endTime) + ' hrs' : '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isEditing ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleSaveDay}
                                disabled={saving}
                                sx={{ mr: 1 }}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                onClick={handleCancelEdit}
                                disabled={saving}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => handleEditDay(day.value)}
                            >
                              {av ? 'Edit' : 'Add'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Days Configured
                  </Typography>
                  <Typography variant="h4">
                    {availability.length} / 7
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Weekly Hours
                  </Typography>
                  <Typography variant="h4">
                    {totalWeeklyHours.toFixed(1)} hrs
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Daily Hours
                  </Typography>
                  <Typography variant="h4">
                    {availability.length > 0 ? (totalWeeklyHours / availability.length).toFixed(1) : '0.0'} hrs
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    // Set typical weekday schedule
                    WEEKDAYS.slice(1, 6).forEach(async (day) => {
                      try {
                        await userAPI.updateAvailability({
                          weekday: day.value,
                          startTime: '18:00',
                          endTime: '21:00',
                          exceptions: []
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    });
                    setTimeout(() => loadAvailability(), 1000);
                  }}
                  sx={{ mb: 1 }}
                >
                  Set Weekdays (6PM-9PM)
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    // Set weekend schedule
                    [0, 6].forEach(async (weekday) => {
                      try {
                        await userAPI.updateAvailability({
                          weekday,
                          startTime: '10:00',
                          endTime: '16:00',
                          exceptions: []
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    });
                    setTimeout(() => loadAvailability(), 1000);
                  }}
                >
                  Set Weekends (10AM-4PM)
                </Button>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Set your available study hours to help the scheduler automatically plan your study sessions.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Availability;
