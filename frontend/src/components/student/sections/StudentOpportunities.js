import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert, Chip, Box, Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import { LocationOn, Business, AccessTime, Work, School, AttachMoney, Star } from '@mui/icons-material';
import axios from 'axios';

function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatuses, setApplicationStatuses] = useState({});

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchApplicationStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        'http://localhost:3002/api/job-applications/my-applications',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Create a map of jobId to application status
      const statusMap = {};
      response.data.forEach(app => {
        statusMap[app.jobId] = app.status;
      });
      setApplicationStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching application statuses:', error);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3002/api/jobs');
      console.log('Response data:', response.data);
      
      if (Array.isArray(response.data)) {
        setOpportunities(response.data);
      } else if (response.data && Array.isArray(response.data.jobs)) {
        setOpportunities(response.data.jobs);
      } else if (response.data && Array.isArray(response.data.data)) {
        setOpportunities(response.data.data);
      } else {
        console.error('Unexpected data format:', response.data);
        setError('Invalid data format received from server. Please check console for details.');
      }
      await fetchApplicationStatuses(); // Fetch application statuses after getting jobs
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to apply for jobs.');
        return;
      }

      // Fetch the latest user data from the backend
      const userResponse = await axios.get('http://localhost:3002/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const userData = userResponse.data;
      console.log('Latest user data:', userData);

      // Check if user has completed their profile
      if (!userData.profile) {
        console.error('Profile is missing in user data');
        alert('Please complete your profile before applying for jobs. Go to your profile page and fill in all required details.');
        return;
      }

      const { name, email, profile } = userData;
      const { branch, graduationYear, cvLink } = profile;

      // Check if all required fields are present
      if (!name || !email || !branch || !graduationYear || !cvLink) {
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!branch) missingFields.push('branch');
        if (!graduationYear) missingFields.push('graduation year');
        if (!cvLink) missingFields.push('CV link');
        
        console.error('Missing fields:', missingFields);
        alert(`Please complete your profile before applying. Missing fields: ${missingFields.join(', ')}. Go to your profile page to update these details.`);
        return;
      }

      // Send application to the correct endpoint
      const response = await axios.post(
        `http://localhost:3002/api/job-applications/${jobId}/apply`,
        {}, // Empty object as we don't need to send any data
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update the application status for this job
        setApplicationStatuses(prev => ({
          ...prev,
          [jobId]: 'pending'
        }));
        
        alert('Successfully applied for the position!');
        fetchOpportunities();
      } else {
        throw new Error('Failed to apply');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      let errorMessage = 'Failed to apply for the job. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getButtonProps = (jobId) => {
    const status = applicationStatuses[jobId];
    
    if (!status) {
      return {
        text: 'Apply Now',
        color: 'primary',
        disabled: false
      };
    }

    switch (status) {
      case 'accepted':
        return {
          text: 'Accepted',
          color: 'success',
          disabled: true
        };
      case 'pending':
        return {
          text: 'Pending',
          color: 'default',
          disabled: true
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'error',
          disabled: true
        };
      default:
        return {
          text: 'Apply Now',
          color: 'primary',
          disabled: false
        };
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          mb: 1
        }}>
          Explore Opportunities
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Find and apply for jobs posted by alumni
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : opportunities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No opportunities available at the moment.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {opportunities.map((job) => (
            <Card 
              key={job._id}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2" sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 1
                    }}>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.company}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<Work />}
                    label={job.jobType || 'Not specified'}
                    color={job.jobType === 'Full-time' ? 'success' : job.jobType === 'Part-time' ? 'info' : 'primary'}
                    size="small"
                  />
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {job.description}
                </Typography>

                {job.skills && job.skills.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 2,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.salary || 'Not specified'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.experience || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Posted: {formatDate(job.createdAt)}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleApply(job._id)}
                  startIcon={<Star />}
                  disabled={getButtonProps(job._id).disabled}
                  sx={{
                    bgcolor: `${getButtonProps(job._id).color}.main`,
                    '&:hover': {
                      bgcolor: `${getButtonProps(job._id).color}.dark`,
                    }
                  }}
                >
                  {getButtonProps(job._id).text}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default StudentOpportunities; 