import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';
import { ScheduleProvider } from './context/ScheduleContext';
import notificationService from './utils/notificationService';
import { sspTheme } from './theme/sspDesignSystem';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import Availability from './pages/Availability';
import MentorView from './pages/MentorView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    // Initialize notification service on app load
    notificationService.initialize().then(granted => {
      if (granted) {
        console.log('Notifications enabled');
      }
    });
  }, []);

  return (
    <ThemeProvider theme={sspTheme}>
      <CssBaseline />
      <AuthProvider>
        <GoalProvider>
          <ScheduleProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              
              <Route path="/availability" element={
                <ProtectedRoute>
                  <Availability />
                </ProtectedRoute>
              } />
              
              <Route path="/mentor" element={
                <ProtectedRoute roles={['mentor', 'parent', 'admin']}>
                  <MentorView />
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ScheduleProvider>
        </GoalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
