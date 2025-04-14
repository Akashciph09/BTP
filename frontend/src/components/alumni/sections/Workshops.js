import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Workshops = () => {
  const { user, isAuthenticated, isAlumni, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    venue: '',
    capacity: 50,
    duration: '',
    tags: [],
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check authentication and role
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAlumni) {
      navigate('/');
      return;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const currentUser = userData ? JSON.parse(userData) : null;

    // Only fetch workshops if we have a valid user ID
    if (currentUser?._id) {
      fetchWorkshops();
    } else {
      setLoading(false);
      setError('User data not available. Please try logging in again.');
    }
  }, [isAuthenticated, isAlumni, navigate, authLoading]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!token || !currentUser || !currentUser._id) {
        setLoading(false);
        setError('Authentication info not found. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:3002/api/workshops/alumni/${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch workshops');
      }

      const data = await response.json();
      setWorkshops(data);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError(error.message || 'Failed to fetch workshops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (workshop = null) => {
    if (workshop) {
      setEditingWorkshop(workshop);
      setFormData({
        title: workshop.title,
        description: workshop.description,
        date: new Date(workshop.date),
        time: workshop.time,
        venue: workshop.venue,
        capacity: workshop.capacity,
        duration: workshop.duration,
        tags: workshop.tags || [],
      });
    } else {
      setEditingWorkshop(null);
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        time: '',
        venue: '',
        capacity: 50,
        duration: '',
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorkshop(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingWorkshop 
        ? `http://localhost:3002/api/workshops/${editingWorkshop._id}`
        : 'http://localhost:3002/api/workshops';
      
      const response = await fetch(url, {
        method: editingWorkshop ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save workshop');
      }

      setSnackbar({
        open: true,
        message: editingWorkshop ? 'Workshop updated successfully!' : 'Workshop created successfully!',
        severity: 'success'
      });

      await fetchWorkshops();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving workshop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save workshop. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/workshops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete workshop');
      }

      setSnackbar({
        open: true,
        message: 'Workshop deleted successfully!',
        severity: 'success'
      });

      await fetchWorkshops();
    } catch (error) {
      console.error('Error deleting workshop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete workshop. Please try again.',
        severity: 'error'
      });
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Your Workshops
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Workshop
        </Button>
      </Box>

      {workshops.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Workshops Created Yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Start creating workshops to help students learn and grow. Click the "Create Workshop" button above to get started.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {workshops.map((workshop) => (
            <Grid item xs={12} md={6} key={workshop._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {workshop.title}
                    </Typography>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(workshop)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(workshop._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                      <LocationIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">{workshop.venue}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {workshop.registered?.length || 0}/{workshop.capacity} participants
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Chip
                    label={workshop.registered?.length >= workshop.capacity ? 'Full' : 'Open'}
                    color={workshop.registered?.length >= workshop.capacity ? 'default' : 'primary'}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Tags (comma separated)"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingWorkshop ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
};

export default Workshops; 