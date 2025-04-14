import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, CalendarToday as CalendarIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

function StudentWorkshops() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user && user._id) {
      fetchWorkshops();
    } else {
      setLoading(false);
      setError('User data not available. Please try logging in again.');
    }
  }, [user]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:3002/api/workshops', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workshops');
      }
      
      const data = await response.json();
      // Filter workshops to only show those posted by alumni
      const alumniWorkshops = data.filter(workshop => workshop.postedBy?.role === 'alumni');
      setWorkshops(alumniWorkshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError('Failed to load workshops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      if (!user || !user._id) {
        throw new Error('User data not available');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:3002/api/workshops/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          workshopId,
          studentId: user._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register for workshop');
      }

      setSnackbar({
        open: true,
        message: 'Successfully registered for the workshop!',
        severity: 'success'
      });
      
      // Refresh workshops list
      fetchWorkshops();
    } catch (error) {
      console.error('Error registering for workshop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to register for workshop. Please try again.',
        severity: 'error'
      });
    }
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workshop.postedBy?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading workshops...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchWorkshops} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Available Workshops
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search workshops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredWorkshops.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Workshops Available
          </Typography>
          <Typography color="text.secondary">
            {searchTerm ? 'No workshops match your search criteria.' : 'There are no workshops available at the moment.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkshops.map((workshop) => (
            <Grid item xs={12} md={6} key={workshop._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {workshop.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {workshop.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Posted by: {workshop.postedBy?.name || 'Alumni'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Registered: {workshop.registered?.length || 0}/{workshop.capacity}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRegister(workshop._id)}
                    disabled={workshop.registered?.length >= workshop.capacity || 
                             workshop.registered?.some(student => student._id === user._id)}
                  >
                    {workshop.registered?.some(student => student._id === user._id)
                      ? 'Already Registered'
                      : workshop.registered?.length >= workshop.capacity
                        ? 'Workshop Full'
                        : 'Register'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentWorkshops; 