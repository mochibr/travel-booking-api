const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId, isAdmin = false) => {
  const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
  const expiresIn = isAdmin ? process.env.ADMIN_JWT_EXPIRES_IN : process.env.JWT_EXPIRES_IN;
  
  return jwt.sign({ userId }, secret, { expiresIn });
};

// Generate random token (for reset and verification)
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate reset token expiry (1 hour from now)
const generateResetTokenExpiry = () => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};

// Verify JWT token
const verifyToken = (token, isAdmin = false) => {
  const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  generateRandomToken,
  generateResetTokenExpiry,
  verifyToken
};