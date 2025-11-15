import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CalendarMonth,
  School
} from '@mui/icons-material';

const theme = createTheme({
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
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #232536 0%, #374151 100%)',
  color: 'white',
  padding: theme.spacing(4),
  textAlign: 'center',
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
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
}));

const StyledButton = styled(Button)(({ theme}) => ({
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
  },
}));

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', py: 4 }}>
        <GradientBox>
          <CalendarMonth sx={{ fontSize: 48, color: '#ffda1b', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Smart Study Planner
          </Typography>
          <Typography variant="h6" sx={{ color: '#e2e8f0' }}>
            Create Your Account
          </Typography>
        </GradientBox>

        <Container maxWidth="sm" sx={{ mt: -4 }}>
          <StyledPaper sx={{ p: { xs: 3, sm: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#232536' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#232536' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledFormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <School sx={{ color: '#232536' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="mentor">Mentor</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                </Select>
              </StyledFormControl>

              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#232536' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#232536' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </StyledButton>

              <Box textAlign="center">
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: '#232536',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#ffda1b')}
                  onMouseLeave={(e) => (e.target.style.color = '#232536')}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    Already have an account? Sign In
                  </Typography>
                </Link>
              </Box>
            </Box>
          </StyledPaper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
