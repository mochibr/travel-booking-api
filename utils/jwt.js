const jwt = require('jsonwebtoken');
const config = require('../config/env.config');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
    );
};

// Get token expiration date
const getTokenExpiration = (token) => {
    const decoded = jwt.decode(token);
    return new Date(decoded.exp * 1000);
};

// Verify JWT token
const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, getTokenExpiration, verifyToken };

