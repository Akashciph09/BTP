const express = require('express');
const router = express.Router();
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Send mentorship request
router.post('/request', auth, async (req, res) => {
    try {
        console.log('Received mentorship request:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });

        // Validate request body
        const { mentorId } = req.body;
        if (!mentorId) {
            console.log('Validation failed: Mentor ID is missing');
            return res.status(400).json({ message: 'Mentor ID is required' });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(mentorId)) {
            console.log('Validation failed: Invalid Mentor ID format', mentorId);
            return res.status(400).json({ message: 'Invalid mentor ID format' });
        }

        // Check if user is a student
        if (req.user.role !== 'student') {
            console.log('Access denied: User is not a student', req.user.role);
            return res.status(403).json({ message: 'Only students can send mentorship requests' });
        }

        // Check if mentor exists and is an alumni
        const mentor = await User.findById(mentorId).select('role');
        if (!mentor) {
            console.log('Mentor not found:', mentorId);
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (mentor.role !== 'alumni') {
            console.log('Invalid mentor role:', mentor.role);
            return res.status(400).json({ message: 'Selected user is not an alumni' });
        }

        // Check for existing request
        const existingRequest = await MentorshipRequest.findOne({
            mentorId: mentorId,
            studentId: req.user.id
        });

        if (existingRequest) {
            console.log('Duplicate request found:', existingRequest);
            return res.status(400).json({ message: 'You have already sent a request to this mentor' });
        }

        // Create new mentorship request
        const mentorshipRequest = new MentorshipRequest({
            mentorId: new mongoose.Types.ObjectId(mentorId),
            studentId: new mongoose.Types.ObjectId(req.user.id),
            status: 'pending'
        });

        console.log('Attempting to save mentorship request:', {
            mentorId: mentorshipRequest.mentorId,
            studentId: mentorshipRequest.studentId,
            status: mentorshipRequest.status
        });

        await mentorshipRequest.save();

        // Populate the response with mentor details
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        console.log('Mentorship request created successfully:', populatedRequest);
        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating mentorship request:', {
            error: error.message,
            stack: error.stack,
            body: req.body,
            user: req.user,
            mongooseError: error.name === 'ValidationError' ? error.errors : null
        });
        res.status(500).json({ 
            message: 'Error creating mentorship request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get mentorship requests for a student
router.get('/student-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can view their mentorship requests' });
        }

        const requests = await MentorshipRequest.find({ studentId: req.user.id })
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ message: 'Error fetching mentorship requests' });
    }
});

// Get mentorship requests for an alumni
router.get('/mentor-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can view mentorship requests' });
        }

        const requests = await MentorshipRequest.find({ mentorId: req.user.id })
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching mentor requests:', error);
        res.status(500).json({ message: 'Error fetching mentorship requests' });
    }
});

// Update mentorship request status
router.patch('/:requestId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { requestId } = req.params;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await MentorshipRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }

        if (request.mentorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Error updating mentorship request' });
    }
});

module.exports = router; 