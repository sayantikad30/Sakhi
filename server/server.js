require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose'); // Corrected typo
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

// Import your route files
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const blogRoutes = require('./routes/blogs');
const trackerRoutes = require('./routes/tracker');

const app = express();

// Set the PORT to Render's assigned port, or fallback to 3001 for local development
// Render typically sets process.env.PORT, so this ensures it's used.
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001; // Changed fallback port to 3001

// --- CORS Configuration ---
// This middleware allows your frontend (on a different domain/port) to access your backend.
// It dynamically sets the 'origin' based on the CORS_ORIGIN environment variable,
// which you will set on Render to your frontend's URL.
const corsOptions = {
  // `process.env.CORS_ORIGIN` will be set on Render to your frontend's URL (e.g., https://your-frontend-xyz.onrender.com)
  // `http://localhost:3000` is for local development.
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies to be sent (useful for authenticated requests if using sessions/cookies)
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200
};
app.use(cors(corsOptions));
// --- End CORS Configuration ---


// Middleware to parse JSON request bodies
// This must come BEFORE your routes that need to read JSON from the request body.
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Route Mounting ---
// Mount your route files under the /api prefix
app.use('/api/auth', authRoutes);     // Handles user authentication (register, login)
app.use('/api/stories', storyRoutes); // Handles period stories
app.use('/api/blogs', blogRoutes);    // Handles blog posts
app.use('/api/tracker', trackerRoutes); // Handles menstrual tracker data


// Basic route for testing the root URL of the backend
app.get('/', (req, res) => {
  res.send('Sakhi Backend API is running!');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

