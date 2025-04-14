import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import SaveProfileButton from './SaveProfileButton';
import { useAuth } from '../../../contexts/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profile: {
      branch: '',
      graduationYear: '',
      cvLink: '',
      username: '',
      phone: '',
      location: '',
      college: '',
      degree: '',
      major: '',
      currentStatus: '',
      certifications: [],
      skills: [],
      experience: [],
      education: [],
      socialLinks: {
        linkedin: '',
        github: '',
        portfolio: ''
      },
      profileImage: '',
      emailVisible: true,
      phoneVisible: true
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newCertification, setNewCertification] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setProfile({
          name: response.data.name,
          email: response.data.email,
          profile: {
            ...response.data.profile,
            branch: response.data.profile?.branch || '',
            graduationYear: response.data.profile?.graduationYear || '',
            cvLink: response.data.profile?.cvLink || '',
            certifications: response.data.profile?.certifications || [],
            skills: response.data.profile?.skills || [],
            experience: response.data.profile?.experience || [],
            education: response.data.profile?.education || [],
            socialLinks: response.data.profile?.socialLinks || {
              linkedin: '',
              github: '',
              portfolio: ''
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          certifications: [...prev.profile.certifications, newCertification.trim()]
        }
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        certifications: prev.profile.certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSaveSuccess = () => {
    setSuccess('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Student Profile
          </Typography>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <SaveProfileButton
              profile={profile}
              onSuccess={handleSaveSuccess}
              onCancel={handleCancel}
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Branch/Department"
              name="profile.branch"
              value={profile.profile.branch}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Graduation Year"
              name="profile.graduationYear"
              value={profile.profile.graduationYear}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="CV Link"
              name="profile.cvLink"
              value={profile.profile.cvLink}
              onChange={handleChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Certifications</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Certification"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  disabled={!isEditing}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddCertification}
                  disabled={!isEditing}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {profile.profile.certifications.map((cert, index) => (
                  <Chip
                    key={index}
                    label={cert}
                    onDelete={isEditing ? () => handleRemoveCertification(index) : undefined}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Skills</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  disabled={!isEditing}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!isEditing}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {profile.profile.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={isEditing ? () => handleRemoveSkill(index) : undefined}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentProfile; 