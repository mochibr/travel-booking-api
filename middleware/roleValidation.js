// middleware/roleValidation.js
const { body, validationResult } = require('express-validator');

const validateCreateRole = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9_ ]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces and underscores'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

const validateUpdateRole = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9_ ]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces and underscores'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

module.exports = {
  validateCreateRole,
  validateUpdateRole
};