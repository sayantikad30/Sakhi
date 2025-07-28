const mongoose = require('mongoose');

const TrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user has only one tracker entry for simplicity
  },
  lastPeriodDate: {
    type: String, // Store as YYYY-MM-DD string
    required: true,
  },
  cycleLength: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tracker', TrackerSchema);
