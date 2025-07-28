require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const blogRoutes = require('./routes/blogs');
const trackerRoutes = require('./routes/tracker');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Enable CORS for all routes (adjust as needed for production security)
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from your React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies and authorization headers to be sent
}));
app.use(express.json()); // Body parser for JSON requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tracker', trackerRoutes); // Protected route for user-specific data

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Sakhi Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
