import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Fab,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  LocationOn,
  Business,
  AttachMoney,
  Person,
  AccessTime,
  Description,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../contexts/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  backgroundColor: '#1f1f2e',
  borderRadius: '12px',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
}));

const JobPosting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3002/api/jobs/alumni', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setJobs(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user._id]);

  const handlePostJob = () => {
    navigate('/alumni/post-job');
  };

  const handleEditJob = (jobId) => {
    navigate(`/alumni/edit-job/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3002/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job posting');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
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
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            mb: 1
          }}>
            My Job Postings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and track your job postings and applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handlePostJob}
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
            },
            px: 3,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Post New Job
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Box 
          textAlign="center" 
          py={8}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            boxShadow: 1
          }}
        >
          <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No job postings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start by posting your first job opportunity to help students find great opportunities.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePostJob}
            sx={{ mt: 2 }}
          >
            Post Your First Job
          </Button>
        </Box>
      ) : (
        <Grid 
          container 
          spacing={3}
          sx={{
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            padding: 0
          }}
        >
          {jobs.map((job) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={job._id}
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <StyledCard sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {job.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          icon={<Business />}
                          label={job.company}
                          variant="outlined"
                          size="small"
                          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        />
                        <Chip
                          icon={<LocationOn />}
                          label={job.location}
                          variant="outlined"
                          size="small"
                          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        />
                        <Chip
                          icon={<AttachMoney />}
                          label={job.salary}
                          variant="outlined"
                          size="small"
                          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        />
                      </Stack>
                    </Box>
                    <Badge 
                      badgeContent={Array.isArray(job.applicants) ? job.applicants.length : 0} 
                      color="primary"
                      sx={{ 
                        '& .MuiBadge-badge': {
                          right: -3,
                          top: 3,
                          border: '2px solid #1f1f2e',
                          padding: '0 4px',
                        }
                      }}
                    >
                      <Chip
                        icon={<Person />}
                        label="Applicants"
                        variant="outlined"
                        size="small"
                        sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                      />
                    </Badge>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 'medium', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Description fontSize="small" />
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.description}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 'medium', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Description fontSize="small" />
                      Requirements
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.requirements}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Applications">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/alumni/applications?jobId=${job._id}`)}
                          sx={{ color: 'white' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Job">
                        <IconButton
                          size="small"
                          onClick={() => handleEditJob(job._id)}
                          sx={{ color: 'white' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteJob(job._id)}
                          sx={{ color: 'white' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handlePostJob}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          },
        }}
      >
        <WorkIcon />
      </Fab>
    </Box>
  );
};

export default JobPosting; 