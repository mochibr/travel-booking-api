const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: errorMessages 
    });
  }
  next();
};

// Common validators
const emailValidator = body('email')
  .isEmail().withMessage('Please provide a valid email address')
  .normalizeEmail();

const passwordValidator = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const nameValidator = body('name')
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
  .trim();

// Registration validation
const validateRegistration = [
  nameValidator,
  emailValidator,
  passwordValidator,
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('email').custom(async (email) => {
    const exists = await User.emailExists(email);
    if (exists) throw new Error('Email already registered');
  }),
  handleValidationErrors
];

// Login validation
const validateLogin = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  emailValidator,
  handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
  passwordValidator,
  handleValidationErrors
];

// Update profile validation
const validateUpdateProfile = [
  nameValidator,
  emailValidator,
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 }).withMessage('Address must be less than 500 characters'),
  body('email').custom(async (email, { req }) => {
    const exists = await User.emailExists(email, req.user.id);
    if (exists) throw new Error('Email already registered with another account');
  }),
  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordValidator,
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
  handleValidationErrors
};