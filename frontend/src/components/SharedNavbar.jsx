import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Flag,
  CalendarMonth,
  Schedule,
  Person,
  AccountCircle,
  Logout,
  Notifications
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled components following GTL-MUI design patterns
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#232536',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const NavLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.2,
  color: '#fff',
  marginLeft: theme.spacing(1.5),
  '&:hover': {
    color: '#ffda1b',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const MenuButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  padding: theme.spacing(1, 1.5),
  borderRadius: '4px',
  fontSize: '0.95rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  position: 'relative',
  '&:hover': {
    color: '#ffda1b',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: '2px',
    backgroundColor: '#ffda1b',
    transition: 'all 0.3s ease',
  },
  '&:hover::after': {
    width: '80%',
    left: '10%',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#232536',
  color: '#fff',
  justifyContent: 'space-between',
  minHeight: '64px',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: '4px',
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: 'rgba(35, 37, 54, 0.08)',
  },
  '&.active': {
    backgroundColor: 'rgba(255, 218, 27, 0.1)',
    borderLeft: '3px solid #ffda1b',
    fontWeight: 600,
  },
}));

const SharedNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  // Menu items based on user role
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Goals', icon: <Flag />, path: '/goals' },
    { text: 'Calendar', icon: <CalendarMonth />, path: '/calendar' },
    { text: 'Availability', icon: <Schedule />, path: '/availability' },
  ];

  // Add Mentor View for authorized roles
  if (['mentor', 'parent', 'admin'].includes(user?.role)) {
    menuItems.push({ text: 'Mentor View', icon: <Person />, path: '/mentor' });
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseProfileMenu();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Desktop Menu Items
  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {menuItems.map((item) => (
        <MenuButton
          key={item.text}
          onClick={() => handleNavigation(item.path)}
          sx={{
            color: isActivePath(item.path) ? '#ffda1b' : '#fff',
            fontWeight: isActivePath(item.path) ? 600 : 500,
          }}
        >
          {item.text}
        </MenuButton>
      ))}
    </Box>
  );

  // Mobile Drawer
  const renderMobileDrawer = () => (
    <StyledDrawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader>
        <NavLogo onClick={() => handleNavigation('/dashboard')}>
          <CalendarMonth sx={{ fontSize: 32, color: '#ffda1b' }} />
          <LogoText>SSP</LogoText>
        </NavLogo>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#ffda1b',
              color: '#232536',
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <StyledListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            className={isActivePath(item.path) ? 'active' : ''}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isActivePath(item.path) ? '#ffda1b' : '#232536' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItemButton>
        ))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: '#ef4444',
            color: '#ef4444',
            '&:hover': {
              borderColor: '#dc2626',
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </StyledDrawer>
  );

  return (
    <>
      <StyledAppBar>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <NavLogo onClick={() => handleNavigation('/dashboard')}>
              <CalendarMonth sx={{ fontSize: 32, color: '#ffda1b' }} />
              <LogoText>Smart Study Planner</LogoText>
            </NavLogo>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Menu */}
            {renderDesktopMenu()}

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              {/* Profile Avatar */}
              <IconButton onClick={handleProfileMenu} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#ffda1b',
                    color: '#232536',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Mobile Drawer */}
      {renderMobileDrawer()}

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleCloseProfileMenu}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SharedNavbar;
