// Smart Study Planner v2 - GTL-MUI Design System
// Consistent theme, styled components, and utilities following GTL-MUI patterns

import { createTheme, alpha } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import {
  Paper,
  TextField,
  Button,
  Box,
  TableRow,
  Card,
  AppBar
} from '@mui/material';

// ==================== THEME ====================
export const sspTheme = createTheme({
  palette: {
    primary: {
      main: '#ffda1b',
      contrastText: '#232536',
    },
    secondary: {
      main: '#232536',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#232536',
      secondary: '#4b5563',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(1.25rem, 3.5vw, 2rem)',
      fontWeight: 600,
    },
    h3: {
      fontSize: 'clamp(1.125rem, 3vw, 1.75rem)',
      fontWeight: 600,
    },
    h4: {
      fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
      fontWeight: 600,
    },
    h5: {
      fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
      fontWeight: 600,
    },
    h6: {
      fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
      fontWeight: 600,
    },
    body1: {
      fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
    },
    body2: {
      fontSize: 'clamp(0.7rem, 1.1vw, 0.875rem)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// ==================== STYLED COMPONENTS ====================

// Gradient Box (for headers)
export const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #232536 0%, #374151 100%)',
  color: 'white',
  padding: theme.spacing(4),
//   borderRadius: '12px',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255, 218, 27, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '8px',
  },
}));

// Styled Paper/Card
export const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '12px',
  },
}));

// Styled Card
export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(255, 218, 27, 0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '8px',
  },
}));

// Styled TextField
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#232536',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ffda1b',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: '#ffda1b',
    },
  },
}));

// Styled Button
export const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#232536',
  color: 'white',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: '#ffda1b',
    color: '#232536',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  '&:disabled': {
    backgroundColor: '#e2e8f0',
    color: '#9ca3af',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25),
    fontSize: '0.875rem',
  },
}));

// Styled AppBar
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#232536',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

// Styled Table Row
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'background-color 0.2s ease',
}));

// Metric Card (for dashboards)
export const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #232536 0%, #374151 100%)',
  color: 'white',
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'radial-gradient(circle, rgba(255, 218, 27, 0.1) 0%, transparent 70%)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Search Field
export const SearchField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#232536',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ffda1b',
      borderWidth: '2px',
    },
  },
}));

// ==================== UTILITY FUNCTIONS ====================

// Get status color
export const getStatusColor = (status) => {
  const lowerStatus = status?.toLowerCase() || '';
  switch (lowerStatus) {
    case 'completed':
    case 'done':
    case 'active':
      return 'success';
    case 'pending':
    case 'scheduled':
      return 'warning';
    case 'in-progress':
      return 'info';
    case 'overdue':
    case 'skipped':
    case 'archived':
      return 'error';
    default:
      return 'default';
  }
};

// Get priority color
export const getPriorityColor = (priority) => {
  const lowerPriority = priority?.toLowerCase() || '';
  switch (lowerPriority) {
    case 'high':
      return 'error';
    case 'med':
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

// Format date
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

// Format time
export const formatTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Time';
  }
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid DateTime';
  }
};

// ==================== ANIMATIONS ====================
export const fadeInUp = {
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
};

export const pulse = {
  '@keyframes pulse': {
    '0%, 100%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
  },
};

// ==================== EXPORT ====================
export default {
  theme: sspTheme,
  GradientBox,
  StyledPaper,
  StyledCard,
  StyledTextField,
  StyledButton,
  StyledAppBar,
  StyledTableRow,
  MetricCard,
  SearchField,
  getStatusColor,
  getPriorityColor,
  formatDate,
  formatTime,
  formatDateTime,
  fadeInUp,
  pulse,
};
