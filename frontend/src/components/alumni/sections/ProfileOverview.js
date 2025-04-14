import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const ProfileOverview = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    graduationYear: '',
    department: '',
    currentPosition: '',
    company: '',
    location: '',
    linkedin: '',
    github: '',
    profilePicture: '',
  });
  const [workshops, setWorkshops] = useState([]);
  const [openWorkshopDialog, setOpenWorkshopDialog] = useState(false);
  const [currentWorkshop, setCurrentWorkshop] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    link: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        graduationYear: user.profile?.education?.[0]?.year || '',
        department: user.profile?.education?.[0]?.degree || '',
        currentPosition: user.profile?.experience?.[0]?.position || '',
        company: user.profile?.experience?.[0]?.company || '',
        location: user.profile?.address || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || '',
        profilePicture: user.profile?.profilePicture || '',
      });
      setWorkshops(user.profile?.workshops || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkshopChange = (e) => {
    const { name, value } = e.target;
    setCurrentWorkshop(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddWorkshop = () => {
    setWorkshops(prev => [...prev, currentWorkshop]);
    setCurrentWorkshop({
      title: '',
      description: '',
      date: '',
      venue: '',
      link: ''
    });
    setOpenWorkshopDialog(false);
  };

  const handleDeleteWorkshop = (index) => {
    setWorkshops(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const profileData = {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          address: formData.location,
          linkedin: formData.linkedin,
          github: formData.github,
          profilePicture: formData.profilePicture,
          experience: [{
            company: formData.company,
            position: formData.currentPosition,
            duration: 'Current',
            description: ''
          }],
          education: [{
            institution: 'IIT Patna',
            degree: formData.department,
            year: formData.graduationYear,
            description: ''
          }],
          workshops: workshops
        }
      };

      const response = await axios.put('http://localhost:3002/api/users/profile', profileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        updateUser({
          ...user,
          ...response.data
        });
        setIsEditing(false);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      bgcolor: '#f5f5f5',
      p: 0,
    }}>
      {/* Profile Header */}
      <Box
        sx={{
          height: '120px',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          position: 'relative',
          mb: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          px: 3,
          pt: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          position: 'absolute',
          right: 24,
          top: 16,
          zIndex: 2
        }}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
                sx={{
                  bgcolor: 'white',
                  borderColor: 'white',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'error.main'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                  }
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </Box>

        <Avatar
          src={formData.profilePicture || '/default-avatar.png'}
          alt={formData.name}
          sx={{
            width: 120,
            height: 120,
            border: '4px solid #fff',
            position: 'absolute',
            bottom: -60,
            left: { xs: '50%', md: 50 },
            transform: { xs: 'translateX(-50%)', md: 'none' },
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        px: { xs: 2, md: 4 }, 
        pb: 4,
        maxWidth: '1400px',
        mx: 'auto',
        width: '100%'
      }}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Basic Info Card */}
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Basic Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Social Links Card */}
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Social Links
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <LinkedInIcon sx={{ mr: 1, color: '#0077b5' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="GitHub"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <GitHubIcon sx={{ mr: 1, color: '#333' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Professional & Education */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Professional Info Card */}
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Professional Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Current Position"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Education
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Graduation Year"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Workshops Card */}
              <Card elevation={0} sx={{ 
                bgcolor: 'white', 
                borderRadius: 2,
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Workshops & Events
                    </Typography>
                    {isEditing && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => setOpenWorkshopDialog(true)}
                        variant="outlined"
                        size="small"
                      >
                        Add Workshop
                      </Button>
                    )}
                  </Box>
                  
                  <List>
                    {workshops.map((workshop, index) => (
                      <ListItem
                        key={index}
                        divider={index < workshops.length - 1}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={workshop.title}
                          secondary={
                            <Stack spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                {workshop.description}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Date: {workshop.date}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Venue: {workshop.venue}
                              </Typography>
                              {workshop.link && (
                                <Typography variant="body2" color="primary">
                                  <a href={workshop.link} target="_blank" rel="noopener noreferrer">
                                    Workshop Link
                                  </a>
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                        {isEditing && (
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteWorkshop(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Workshop Dialog */}
      <Dialog 
        open={openWorkshopDialog} 
        onClose={() => setOpenWorkshopDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Workshop</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Workshop Title"
              name="title"
              value={currentWorkshop.title}
              onChange={handleWorkshopChange}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentWorkshop.description}
              onChange={handleWorkshopChange}
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Date"
              name="date"
              value={currentWorkshop.date}
              onChange={handleWorkshopChange}
              variant="outlined"
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Venue"
              name="venue"
              value={currentWorkshop.venue}
              onChange={handleWorkshopChange}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Workshop Link (Optional)"
              name="link"
              value={currentWorkshop.link}
              onChange={handleWorkshopChange}
              variant="outlined"
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkshopDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddWorkshop}
            variant="contained"
            disabled={!currentWorkshop.title || !currentWorkshop.date}
          >
            Add Workshop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileOverview; 