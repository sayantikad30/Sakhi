const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// @route   GET api/blogs
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ timestamp: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/blogs
// @desc    Add a new blog post
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => { // Use auth middleware here
  const { title, content } = req.body;

  try {
    const newBlog = new Blog({
      title,
      content,
      author: req.user.email || 'Anonymous', // Use user's email from token, or 'Anonymous'
      userId: req.user.id, // Get user ID from the authenticated token
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog); // 201 Created
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;