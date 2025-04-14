import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';

const SaveProfileButton = ({ profile, onSuccess, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setSaving(false);
        return;
      }

      // Prepare the profile data in the correct format
      const profileData = {
        name: profile.name,
        email: profile.email,
        profile: {
          username: profile.profile.username || '',
          phone: profile.profile.phone || '',
          location: profile.profile.location || '',
          college: profile.profile.college || '',
          degree: profile.profile.degree || '',
          major: profile.profile.major || '',
          graduationYear: profile.profile.graduationYear || '',
          branch: profile.profile.branch || '',
          cvLink: profile.profile.cvLink || '',
          certifications: profile.profile.certifications || [],
          skills: profile.profile.skills || [],
          experience: profile.profile.experience || [],
          education: profile.profile.education || [],
          socialLinks: profile.profile.socialLinks || {
            linkedin: '',
            github: '',
            portfolio: ''
          }
        }
      };

      // Make the API call with a timeout and retry logic
      let response;
      let retry = 0;
      
      while (retry <= MAX_RETRIES) {
        try {
          response = await axios.put(
            'http://localhost:3002/api/users/profile',
            profileData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000 // 5 second timeout
            }
          );
          break; // If successful, exit the retry loop
        } catch (error) {
          if (error.code === 'ECONNABORTED' && retry < MAX_RETRIES) {
            retry++;
            setRetryCount(retry);
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw error; // If not a timeout or max retries reached, throw the error
        }
      }

      if (response.data) {
        // Update localStorage with the complete user data
        const updatedUserData = {
          ...response.data,
          profile: {
            ...response.data.profile,
            branch: profile.profile.branch || '',
            graduationYear: profile.profile.graduationYear || '',
            cvLink: profile.profile.cvLink || '',
            username: profile.profile.username || '',
            phone: profile.profile.phone || '',
            location: profile.profile.location || '',
            college: profile.profile.college || '',
            degree: profile.profile.degree || '',
            major: profile.profile.major || '',
            certifications: profile.profile.certifications || [],
            skills: profile.profile.skills || [],
            experience: profile.profile.experience || [],
            education: profile.profile.education || [],
            socialLinks: profile.profile.socialLinks || {
              linkedin: '',
              github: '',
              portfolio: ''
            }
          }
        };

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        console.log('Updated user data in localStorage:', updatedUserData);

        // Call the success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Server is taking too long to respond. Please try again later.');
      } else if (error.response) {
        setError(error.response.data?.error || 'Failed to update profile. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        onClick={handleSave}
        disabled={saving}
        sx={{ 
          mr: 2,
          minWidth: '120px' // Ensure button doesn't change size when loading
        }}
      >
        {saving ? (retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})...` : 'Saving...') : 'Save Changes'}
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={onCancel}
        disabled={saving}
        sx={{ minWidth: '120px' }}
      >
        Cancel
      </Button>
    </div>
  );
};

export default SaveProfileButton; 