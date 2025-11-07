const express = require('express');
const multer = require('multer');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword
} = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads (memory storage for S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', auth(), getMe);
router.put('/update-profile', auth(), upload.single('profile_picture'), validateUpdateProfile, updateProfile);
router.post('/change-password', auth(), validateChangePassword, changePassword);
router.post('/logout', auth(), logout);

module.exports = router;