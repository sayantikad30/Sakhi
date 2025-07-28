const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// @route   GET api/stories
// @desc    Get all period stories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find().sort({ timestamp: -1 });
    res.json(stories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/stories
// @desc    Add a new period story
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => { // Use auth middleware here
  const { story, storyteller } = req.body;

  try {
    const newStory = new Story({
      story,
      // If storyteller is provided, use it, otherwise default to user's email or 'Anonymous'
      storyteller: storyteller || req.user.email || 'Anonymous',
      userId: req.user.id, // Get user ID from the authenticated token
    });

    const savedStory = await newStory.save();
    res.status(201).json(savedStory); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
