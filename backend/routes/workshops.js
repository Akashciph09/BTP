const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');

// Get all workshops
router.get('/', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate('postedBy', 'name role')
      .populate('registered', 'name');
    res.json(workshops);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ message: 'Error fetching workshops' });
  }
});

// Create a new workshop (for alumni)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create workshops' });
    }

    const workshop = new Workshop({
      ...req.body,
      postedBy: req.user._id
    });

    await workshop.save();
    res.status(201).json(workshop);
  } catch (error) {
    console.error('Error creating workshop:', error);
    res.status(500).json({ message: 'Error creating workshop' });
  }
});

// Update a workshop
router.put('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this workshop' });
    }

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('postedBy', 'name role')
     .populate('registered', 'name');

    res.json(updatedWorkshop);
  } catch (error) {
    console.error('Error updating workshop:', error);
    res.status(500).json({ message: 'Error updating workshop' });
  }
});

// Delete a workshop
router.delete('/:id', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workshop' });
    }

    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    res.status(500).json({ message: 'Error deleting workshop' });
  }
});

// Register for a workshop (for students)
router.post('/register', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for workshops' });
    }

    const { workshopId } = req.body;
    const workshop = await Workshop.findById(workshopId);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.registered.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this workshop' });
    }

    if (workshop.registered.length >= workshop.capacity) {
      return res.status(400).json({ message: 'Workshop is full' });
    }

    workshop.registered.push(req.user._id);
    await workshop.save();

    res.json({ message: 'Successfully registered for workshop' });
  } catch (error) {
    console.error('Error registering for workshop:', error);
    res.status(500).json({ message: 'Error registering for workshop' });
  }
});

// Get workshops created by an alumni
router.get('/alumni/:alumniId', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find({ postedBy: req.params.alumniId })
      .populate('postedBy', 'name role')
      .populate('registered', 'name');
    res.json(workshops);
  } catch (error) {
    console.error('Error fetching alumni workshops:', error);
    res.status(500).json({ message: 'Error fetching alumni workshops' });
  }
});

// Get workshops registered by a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const workshops = await Workshop.find({ registered: req.params.studentId })
      .populate('postedBy', 'name role')
      .populate('registered', 'name');
    res.json(workshops);
  } catch (error) {
    console.error('Error fetching student workshops:', error);
    res.status(500).json({ message: 'Error fetching student workshops' });
  }
});

module.exports = router; 