import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const AlumniMentorship = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'alumni') {
      fetchRequests();
    } else {
      setError('Access denied. Only alumni can view mentorship requests.');
      setLoading(false);
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3002/api/mentorship/mentor-requests', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        setRequests(response.data);
        setError('');
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching mentorship requests:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to fetch mentorship requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await axios.put(
        `http://localhost:3002/api/mentorship/request/${requestId}/status`,
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSuccess(`Request ${status} successfully`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error(`Error ${status}ing request:`, err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Failed to ${status} request`);
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<AccessTimeIcon />} label="Pending" color="default" />;
      case 'accepted':
        return <Chip icon={<CheckIcon />} label="Accepted" color="success" />;
      case 'rejected':
        return <Chip icon={<CloseIcon />} label="Rejected" color="error" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mentorship Requests
      </Typography>

      {requests.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No mentorship requests received yet.
        </Typography>
      ) : (
        <List>
          {requests.map((request) => (
            <ListItem
              key={request._id}
              divider
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={request.studentId?.profile?.profilePicture}>
                  {request.studentId?.name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={request.studentId?.name}
                secondary={
                  <Stack direction="column" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {request.studentId?.profile?.branch} - {request.studentId?.profile?.graduationYear}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.studentId?.email}
                    </Typography>
                    {request.message && (
                      <Typography variant="body2" color="text.secondary">
                        Message: {request.message}
                      </Typography>
                    )}
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  {getStatusChip(request.status)}
                  {request.status === 'pending' && (
                    <>
                      <Button
                        startIcon={<CheckIcon />}
                        color="success"
                        size="small"
                        onClick={() => handleStatusUpdate(request._id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        color="error"
                        size="small"
                        onClick={() => handleStatusUpdate(request._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AlumniMentorship; 