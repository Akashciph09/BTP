import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Profile', icon: <PersonIcon />, path: '/student/profile' },
  { text: 'Opportunities', icon: <WorkIcon />, path: '/student/opportunities' },
  { text: 'Applications', icon: <AssignmentIcon />, path: '/student/applications' },
  { text: 'Mentorship', icon: <SchoolIcon />, path: '/student/mentorship' },
  { text: 'Workshops', icon: <EventIcon />, path: '/student/workshops' },
  { text: 'Messages', icon: <MessageIcon />, path: '/student/messages' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/student/settings' },
];

function StudentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <div className="flex flex-col justify-between h-screen bg-[#0f172a] text-white">
      {/* Enhanced Top Section */}
      <div className="bg-[#0f172a] text-white pt-12 pb-8 border-b border-gray-700">
        {/* Portal Title with Enhanced Styling */}
        <div className="text-3xl font-extrabold tracking-wider text-center mb-12 text-purple-400 px-4">
          STUDENT PORTAL
        </div>

        {/* User Name Box with Full Width */}
        <div className="mx-8 px-8 py-5 border-2 border-purple-500/30 rounded-lg text-xl font-bold bg-gray-800/40 backdrop-blur-sm shadow-lg">
          <div className="text-center text-purple-200">
            {user?.name || 'Student User'}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <List className="space-y-2 px-4">
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-700'
                }`}
                sx={{
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemIcon 
                  className={`min-w-[40px] ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  className={`${
                    location.pathname === item.path ? 'font-bold' : ''
                  }`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-700">
        <ListItemButton
          onClick={handleLogout}
          className="rounded-lg hover:bg-red-600 transition-colors duration-200"
          sx={{
            py: 1.5,
            px: 2,
          }}
        >
          <ListItemIcon className="min-w-[40px] text-gray-400">
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </div>
    </div>
  );

  return (
    <div className="w-[280px] flex-shrink-0">
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="fixed left-1/2 bottom-5 -translate-x-1/2 bg-purple-600 text-white hover:bg-purple-700"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            className="block sm:hidden"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                bgcolor: '#0f172a',
              },
            }}
          >
            {drawer}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          className="hidden sm:block"
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0f172a',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </div>
  );
}

export default StudentSidebar; 