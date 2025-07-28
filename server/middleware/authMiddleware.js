const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header (e.g., "Bearer YOUR_TOKEN")
  const authHeader = req.header('Authorization');

  // Check if no token or invalid format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied or invalid format' });
  }

  // Extract token part
  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload from token to request
    req.user = decoded.user;
    next(); // Continue to the next middleware/route handler
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
