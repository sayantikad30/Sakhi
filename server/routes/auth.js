const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating tokens
const User = require('../models/User'); // Your User model

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user with this email already exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists, send a 400 Bad Request to indicate a conflict
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create a new User instance
    user = new User({
      email,
      password, // Password will be hashed before saving
    });

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    user.password = await bcrypt.hash(password, salt); // Hash the password

    // 4. Save the user to the database
    await user.save(); // This is a common point of failure for 500 errors

    // 5. Create JWT payload (data to store in the token)
    const payload = {
      user: {
        id: user.id, // MongoDB _id becomes 'id' in Mongoose
        email: user.email,
      },
    };

    // 6. Sign the JWT (create the token)
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key from .env
      { expiresIn: '1h' }, // Token expiration time
      (err, token) => {
        if (err) throw err; // If there's an error signing, throw it
        // 7. Send the token and user info back to the frontend
        res.status(201).json({ token, userId: user.id, email: user.email, message: 'Registration successful!' });
      }
    );

  } catch (err) {
    // Catch any errors that occur during the process (e.g., database errors, hashing errors)
    console.error(err.message); // Log the detailed error message on the server
    res.status(500).send('Server Error'); // Send a generic 500 response to the client
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, userId: user.id, email: user.email, message: 'Login successful!' });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
