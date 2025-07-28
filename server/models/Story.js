const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  story: {
    type: String,
    required: true,
  },
  storyteller: {
    type: String,
    default: 'Anonymous',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: { // Optional: Link to a user if they are logged in. Mongoose will store ObjectId.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Not required for public stories, but useful for linking
  }
});

module.exports = mongoose.model('Story', StorySchema);
