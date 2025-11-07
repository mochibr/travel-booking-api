const express = require('express');
const {
  adminLogin,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, adminLogin);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// Protected admin routes
router.get('/me', auth('admin'), getMe);
router.post('/logout', auth('admin'), logout);

module.exports = router;