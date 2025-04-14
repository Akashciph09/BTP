const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Test route to verify database connection
router.get('/test', async (req, res) => {
    try {
        const jobCount = await Job.countDocuments();
        console.log('Database connection test - Job count:', jobCount);
        res.json({
            status: 'success',
            jobCount,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST a new job
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new job:', req.body);
        // Get the user data
        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const job = new Job({
            ...req.body,
            postedBy: user._id,
            alumniName: user.name,
            alumniEmail: user.email,
            applicants: []
        });

        await job.save();
        console.log('Job created successfully:', job._id);
        res.status(201).json(job);
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(400).json({ 
            message: 'Error creating job',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET all jobs
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all jobs - Request details:', {
            headers: req.headers,
            query: req.query,
            url: req.url
        });

        const jobs = await Job.find()
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email')
            .populate('applicants', 'name email');

        console.log('Jobs found:', {
            count: jobs.length,
            jobs: jobs.map(job => ({
                id: job._id,
                title: job.title,
                company: job.company
            }))
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Error fetching jobs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Apply for a job
router.post('/:jobId/apply', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user has already applied
        if (job.applicants.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Add user to applicants
        job.applicants.push(req.user.userId);
        await job.save();

        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ 
            message: 'Error applying for job',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET jobs posted by an alumni
router.get('/alumni', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can view their posted jobs' });
        }

        const jobs = await Job.find({ postedBy: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email')
            .populate({
                path: 'applicants',
                select: 'name email profile',
                model: 'User'
            });

        // Log the jobs data for debugging
        console.log('Alumni jobs found:', {
            count: jobs.length,
            jobsWithApplicants: jobs.map(job => ({
                id: job._id,
                title: job.title,
                applicantsCount: job.applicants.length,
                applicants: job.applicants.map(applicant => ({
                    id: applicant._id,
                    name: applicant.name
                }))
            }))
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching alumni jobs:', error);
        res.status(500).json({ 
            message: 'Error fetching jobs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 