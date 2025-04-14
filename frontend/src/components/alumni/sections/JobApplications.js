import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/job-applications/alumni/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setApplications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3002/api/job-applications/${applicationId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application status:', error);
      alert(error.response?.data?.message || 'Failed to update application status');
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

  // Group applications by job
  const groupedApplications = applications.reduce((acc, application) => {
    const jobId = application.jobId._id;
    if (!acc[jobId]) {
      acc[jobId] = {
        job: application.jobId,
        applications: []
      };
    }
    acc[jobId].applications.push(application);
    return acc;
  }, {});

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
        Job Applications
      </Typography>

      {Object.keys(groupedApplications).length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No applications received yet.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {Object.values(groupedApplications).map((group) => (
            <Accordion key={group.job._id} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2">
                      {group.job.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {group.job.company}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${group.applications.length} Applicants`}
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {group.applications.map((application) => (
                    <ListItem
                      key={application._id}
                      divider
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={application.studentId.name}
                        secondary={
                          <Stack direction="column" spacing={1}>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2" color="text.secondary">
                                <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {application.studentId.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {application.studentId.profile?.branch} - {application.studentId.profile?.graduationYear}
                              </Typography>
                            </Stack>
                            {application.studentId.profile?.cvLink && (
                              <Tooltip title="View CV">
                                <Link
                                  href={application.studentId.profile.cvLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  View CV
                                </Link>
                              </Tooltip>
                            )}
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          {getStatusChip(application.status)}
                          {application.status === 'pending' && (
                            <>
                              <Button
                                startIcon={<CheckIcon />}
                                color="success"
                                size="small"
                                onClick={() => handleStatusUpdate(application._id, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                startIcon={<CloseIcon />}
                                color="error"
                                size="small"
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
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
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default JobApplications; 