import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AlumniProfile from '../components/alumni/sections/AlumniProfile';
import AlumniOpportunities from '../components/alumni/sections/AlumniOpportunities';
import AlumniApplications from '../components/alumni/sections/AlumniApplications';
import AlumniMentorship from '../components/alumni/sections/AlumniMentorship';
import AlumniWorkshops from '../components/alumni/sections/AlumniWorkshops';
import AlumniMessages from '../components/alumni/sections/AlumniMessages';
import JobPostForm from '../components/JobPostForm';

const AlumniRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'alumni') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<AlumniProfile />} />
      <Route path="opportunities" element={<AlumniOpportunities />} />
      <Route path="applications" element={<AlumniApplications />} />
      <Route path="mentorship" element={<AlumniMentorship />} />
      <Route path="workshops" element={<AlumniWorkshops />} />
      <Route path="messages" element={<AlumniMessages />} />
      <Route path="post-job" element={<JobPostForm />} />
      <Route path="edit-job/:jobId" element={<JobPostForm editMode={true} />} />
    </Routes>
  );
};

export default AlumniRoute; 