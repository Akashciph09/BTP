const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Fetching user data for:', req.user.userId);
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', { id: user._id, role: user.role });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        console.error('Error fetching user:', {
            message: error.message,
            stack: error.stack,
            userId: req.user.userId
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user.userId);
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Profile found:', { id: user._id, role: user.role });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        console.error('Error fetching profile:', {
            message: error.message,
            stack: error.stack,
            userId: req.user.userId
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Updating profile for user:', req.user.userId);
        console.log('Update data:', req.body);

        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, profile } = req.body;

        // Validate email if provided
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update profile if provided
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };
        }

        console.log('Saving updated user:', {
            id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile
        });

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        console.error('Error updating profile:', {
            message: error.message,
            stack: error.stack,
            userId: req.user.userId,
            updateData: req.body
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all alumni users
router.get('/alumni', auth, async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' })
      .select('name email profile')
      .populate('profile');
    
    res.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ 
      message: 'Error fetching alumni',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 