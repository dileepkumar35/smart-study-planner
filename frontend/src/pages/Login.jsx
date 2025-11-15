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
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CalendarMonth
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

const StyledButton = styled(Button)(({ theme }) => ({
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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

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
        <Container maxWidth="sm">
          <Box sx={{ marginTop: 4 }}>
            <StyledPaper>
              <GradientBox>
                <CalendarMonth sx={{ fontSize: 48, color: '#ffda1b', mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  Smart Study Planner
                </Typography>
                <Typography variant="h6" sx={{ color: '#e2e8f0' }}>
                  Organize your studies intelligently
                </Typography>
              </GradientBox>

              <Box sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                  Sign In to Continue
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <StyledTextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
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
                  <StyledButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </StyledButton>
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Typography
                        sx={{
                          color: '#232536',
                          fontWeight: 500,
                          transition: 'color 0.2s',
                          '&:hover': {
                            color: '#ffda1b',
                          },
                        }}
                      >
                        Don't have an account? <strong>Sign Up</strong>
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </Box>
            </StyledPaper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
