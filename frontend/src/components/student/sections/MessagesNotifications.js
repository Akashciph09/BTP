import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MessagesNotifications = () => {
  // This would come from your API
  const notifications = [
    {
      id: 1,
      type: 'job',
      title: 'New Job Application Update',
      message: 'Your application for Frontend Developer at Tech Corp has been reviewed',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'project',
      title: 'Project Milestone Completed',
      message: 'Congratulations! You\'ve completed the first milestone of your project',
      time: '5 hours ago',
      unread: true
    }
  ];

  const messages = [
    {
      id: 3,
      sender: 'Sarah Johnson',
      message: 'Would you like to schedule a mentoring session?',
      time: '2 hours ago',
      unread: true,
      avatar: '/path-to-avatar.jpg'
    },
    {
      id: 4,
      sender: 'Michael Chen',
      message: 'Great work on your latest project!',
      time: '1 day ago',
      unread: false,
      avatar: '/path-to-avatar.jpg'
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return <WorkIcon color="primary" />;
      case 'project':
        return <MessageIcon color="primary" />;
      case 'email':
        return <EmailIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Messages & Notifications
      </Typography>

      {/* Notifications */}
      <Typography variant="subtitle1" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((notification) => (
          <StyledListItem key={notification.id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'background.paper' }}>
                {getNotificationIcon(notification.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={notification.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {notification.time}
                  </Typography>
                </>
              }
            />
            {notification.unread && (
              <Chip
                label="New"
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Messages */}
      <Typography variant="subtitle1" gutterBottom>
        Messages
      </Typography>
      <List>
        {messages.map((message) => (
          <StyledListItem key={message.id}>
            <ListItemAvatar>
              <Avatar src={message.avatar}>{message.sender[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={message.sender}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {message.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {message.time}
                  </Typography>
                </>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {message.unread && (
                <Chip
                  label="New"
                  color="primary"
                  size="small"
                />
              )}
              <IconButton size="small">
                <MessageIcon />
              </IconButton>
            </Box>
          </StyledListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" color="primary">
          View All Messages
        </Button>
      </Box>
    </Box>
  );
};

export default MessagesNotifications; 