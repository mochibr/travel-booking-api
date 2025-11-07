const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (role = 'user') => async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const secret = role === 'admin' ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token. User not found.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false,
        error: 'Account is inactive. Please contact support.' 
      });
    }

    // For admin routes, check if user has admin role (role_id = 1)
    if (role === 'admin' && user.role_id !== 1) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required.' 
      });
    }

    // For web routes, check if email is verified for critical operations
    if (role === 'user' && !user.email_verified && req.method !== 'GET') {
      return res.status(403).json({ 
        success: false,
        error: 'Please verify your email address before performing this action.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired. Please login again.' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token.' 
      });
    } else {
      return res.status(500).json({ 
        success: false,
        error: 'Authentication failed.' 
      });
    }
  }
};

module.exports = auth;