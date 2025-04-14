import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AlumniDashboard from './components/alumni/AlumniDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AlumniRoute from './components/routes/AlumniRoute';
import ProfileOverview from './components/alumni/sections/ProfileOverview';
import Network from './components/alumni/sections/Network';
import Opportunities from './components/alumni/sections/Opportunities';
import AlumniMentorship from './components/alumni/sections/AlumniMentorship';
import Workshops from './components/alumni/sections/Workshops';
import Messages from './components/alumni/sections/Messages';
import Settings from './components/alumni/sections/Settings';
import JobApplications from './components/alumni/sections/JobApplications';
import StudentProfile from './components/student/sections/StudentProfile';
import StudentOpportunities from './components/student/sections/StudentOpportunities';
import StudentMentorship from './components/student/sections/StudentMentorship';
import StudentWorkshops from './components/student/sections/StudentWorkshops';
import StudentMessages from './components/student/sections/StudentMessages';
import StudentSettings from './components/student/sections/StudentSettings';
import JobPostForm from './components/JobPostForm';
import JobList from './components/JobList';
import './components/JobStyles.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<StudentProfile />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="opportunities" element={<StudentOpportunities />} />
              <Route path="mentorship" element={<StudentMentorship />} />
              <Route path="workshops" element={<StudentWorkshops />} />
              <Route path="messages" element={<StudentMessages />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Alumni Routes */}
            <Route path="/alumni" element={
              <PrivateRoute allowedRoles={['alumni']}>
                <AlumniDashboard />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<ProfileOverview />} />
              <Route path="profile" element={<ProfileOverview />} />
              <Route path="network" element={<Network />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="applications" element={<JobApplications />} />
              <Route path="mentorship" element={<AlumniMentorship />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
              <Route path="post-job" element={<JobPostForm />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
