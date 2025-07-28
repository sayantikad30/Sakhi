const express = require('express');
const router = express.Router();
const Tracker = require('../models/Tracker');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// All routes in this file are private and require authentication
router.use(auth);

// @route   GET api/tracker
// @desc    Get user's menstrual tracker data
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trackerData = await Tracker.findOne({ userId: req.user.id });
    if (!trackerData) {
      // If no data exists, return 404 to indicate no data for this user, not an error
      return res.status(404).json({ message: 'Tracker data not found for this user.' });
    }
    res.json(trackerData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tracker
// @desc    Create or update user's menstrual tracker data
// @access  Private
router.post('/', async (req, res) => {
  const { lastPeriodDate, cycleLength } = req.body;
  const userId = req.user.id; // Get userId from the authenticated token

  try {
    // Find and update existing tracker data, or create if not found (upsert)
    let trackerData = await Tracker.findOneAndUpdate(
      { userId: userId }, // Find by userId
      { lastPeriodDate, cycleLength, updatedAt: Date.now() }, // Data to update
      { upsert: true, new: true, setDefaultsOnInsert: true } // Options: upsert (create if not exist), return new doc, apply defaults
    );

    res.status(200).json({ message: 'Tracker data saved successfully!', data: trackerData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;