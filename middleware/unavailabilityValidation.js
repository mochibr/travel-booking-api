// middleware/unavailabilityValidation.js
const { body, validationResult } = require('express-validator');

const validateCreateUnavailability = [
  body('reference_id')
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),
  
  body('reference_type')
    .isIn(['Driver', 'Hotel', 'Vehicle'])
    .withMessage('Reference type must be Driver, Hotel, or Vehicle'),
  
  body('start_datetime')
    .isISO8601()
    .withMessage('Start datetime must be a valid ISO 8601 date'),
  
  body('end_datetime')
    .isISO8601()
    .withMessage('End datetime must be a valid ISO 8601 date'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason must not exceed 1000 characters'),

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

const validateUpdateUnavailability = [
  body('reference_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),
  
  body('reference_type')
    .optional()
    .isIn(['Driver', 'Hotel', 'Vehicle'])
    .withMessage('Reference type must be Driver, Hotel, or Vehicle'),
  
  body('start_datetime')
    .optional()
    .isISO8601()
    .withMessage('Start datetime must be a valid ISO 8601 date'),
  
  body('end_datetime')
    .optional()
    .isISO8601()
    .withMessage('End datetime must be a valid ISO 8601 date'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason must not exceed 1000 characters'),

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
  validateCreateUnavailability,
  validateUpdateUnavailability
};