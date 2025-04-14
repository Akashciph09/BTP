const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const auth = require('../middleware/auth');
const Job = require('../models/Job');

// Apply for a job
router.post('/:jobId/apply', auth, async (req, res) => {
    try {
        console.log('Received job application request:', {
            jobId: req.params.jobId,
            studentId: req.user.userId,
            role: req.user.role
        });

        // Check if user is a student
        if (req.user.role !== 'student') {
            console.log('User is not a student:', req.user.role);
            return res.status(403).json({ message: 'Only students can apply for jobs' });
        }

        const jobId = req.params.jobId;
        const studentId = req.user.userId;

        // Check if already applied
        const existingApplication = await JobApplication.findOne({ jobId, studentId });
        if (existingApplication) {
            console.log('User has already applied for this job');
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create new application
        const application = new JobApplication({
            jobId,
            studentId
        });

        // Update the job's applicants array
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Add student to job's applicants array if not already there
        if (!job.applicants.includes(studentId)) {
            job.applicants.push(studentId);
            await job.save();
        }

        console.log('Creating new application:', application);
        await application.save();
        console.log('Application saved successfully:', application._id);
        
        res.status(201).json(application);
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ 
            message: 'Error applying for job',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all applications for a student
router.get('/my-applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const applications = await JobApplication.find({ studentId: req.user.userId })
            .populate('jobId')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Check if student has applied for a specific job
router.get('/:jobId/check-application', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const application = await JobApplication.findOne({
            jobId: req.params.jobId,
            studentId: req.user.userId
        });

        res.json({ hasApplied: !!application, application });
    } catch (error) {
        console.error('Error checking application:', error);
        res.status(500).json({ message: 'Error checking application status' });
    }
});

// Get applications for jobs posted by an alumni
router.get('/alumni/applications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can view applications' });
        }

        // Find all jobs posted by this alumni
        const jobs = await Job.find({ postedBy: req.user.userId });
        const jobIds = jobs.map(job => job._id);

        // Find all applications for these jobs
        const applications = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('jobId', 'title company')
            .populate('studentId', 'name email profile')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Error fetching alumni applications:', error);
        res.status(500).json({ 
            message: 'Error fetching applications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update application status (accept/reject)
router.put('/:applicationId/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can update application status' });
        }

        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await JobApplication.findById(req.params.applicationId)
            .populate('jobId', 'postedBy');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if the alumni owns this job
        if (application.jobId.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ 
            message: 'Error updating application status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 