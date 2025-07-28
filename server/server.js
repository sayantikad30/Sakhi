// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ... your routes imports

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configure CORS dynamically ---
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Allow requests from your frontend URL or localhost
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// --- End CORS configuration ---

app.use(express.json());

// ... rest of your server.js (mongoose connection, routes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// ... your routes setup

app.get('/', (req, res) => {
  res.send('Sakhi Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
