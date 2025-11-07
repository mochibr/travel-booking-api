const { body, param, query, validationResult } = require('express-validator');
const VehicleType = require('../models/VehicleType');
const Vehicle = require('../models/Vehicle');

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

// Vehicle Type Validators
const validateCreateVehicleType = [
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('name')
    .notEmpty().withMessage('Vehicle type name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Vehicle type name must be between 2 and 100 characters')
    .custom(async (name, { req }) => {
      const user_id = req.body.user_id;
      const exists = await VehicleType.nameExists(name, user_id);
      if (exists) throw new Error('Vehicle type name already exists');
    }),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

const validateUpdateVehicleType = [
  param('id').isInt({ min: 1 }).withMessage('Invalid vehicle type ID'),
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('name')
    .notEmpty().withMessage('Vehicle type name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Vehicle type name must be between 2 and 100 characters')
    .custom(async (name, { req }) => {
      const user_id = req.body.user_id;
      const exists = await VehicleType.nameExists(name, user_id, req.params.id);
      if (exists) throw new Error('Vehicle type name already exists');
    }),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

// Vehicle Validators
const validateCreateVehicle = [
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('vehicle_type_id')
    .isInt({ min: 1 }).withMessage('Valid vehicle type is required')
    .custom(async (vehicle_type_id, { req }) => {
      const user_id = req.body.user_id;
      const vehicleType = await VehicleType.findById(vehicle_type_id, user_id);
      if (!vehicleType) throw new Error('Invalid vehicle type');
    }),
  body('make').notEmpty().withMessage('Make is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('registration_number')
    .optional()
    .custom(async (registration_number, { req }) => {
      if (registration_number) {
        const user_id = req.body.user_id;
        const exists = await Vehicle.registrationNumberExists(registration_number, user_id);
        if (exists) throw new Error('Registration number already exists');
      }
    }),
  body('year_manufactured')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year manufactured'),
  body('sitting_capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Sitting capacity must be at least 1'),
  body('luggage_capacity')
    .optional()
    .isInt({ min: 0 }).withMessage('Luggage capacity cannot be negative'),
  body('purchase_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase amount must be a positive number'),
  body('loan_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Loan price must be a positive number'),
  body('emi_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('EMI amount must be a positive number'),
  body('number_of_emi_months')
    .optional()
    .isInt({ min: 1 }).withMessage('Number of EMI months must be at least 1'),
  body('emi_date')
    .optional()
    .isInt({ min: 1, max: 31 }).withMessage('EMI date must be between 1 and 31'),
  handleValidationErrors
];

const validateUpdateVehicle = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid vehicle ID'),

  body('vehicle_type_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid vehicle type is required')
    .custom(async (vehicle_type_id) => {
      if (vehicle_type_id) {
        const vehicleType = await VehicleType.findById(vehicle_type_id);
        if (!vehicleType) throw new Error('Invalid vehicle type');
      }
    }),

  body('registration_number')
    .optional()
    .custom(async (registration_number, { req }) => {
      if (registration_number) {
        const exists = await Vehicle.registrationNumberExists(
          registration_number,
          req.params.id
        );
        if (exists) throw new Error('Registration number already exists');
      }
    }),

  body('year_manufactured')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year manufactured'),

  body('sitting_capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sitting capacity must be at least 1'),

  body('purchase_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase amount must be a positive number'),

  handleValidationErrors
];


// Vehicle Service Validators
const validateCreateVehicleService = [
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('vehicle_id')
    .isInt({ min: 1 }).withMessage('Valid vehicle is required')
    .custom(async (vehicle_id, { req }) => {
      const user_id = req.body.user_id;
      const vehicle = await Vehicle.findById(vehicle_id, user_id);
      if (!vehicle) throw new Error('Invalid vehicle');
    }),
  body('service_date')
    .isDate().withMessage('Valid service date is required'),
  body('next_service_date')
    .optional()
    .isDate().withMessage('Valid next service date is required'),
  body('odometer_reading')
    .optional()
    .isInt({ min: 0 }).withMessage('Odometer reading must be a positive number'),
  handleValidationErrors
];

// Vehicle Tyre Validators
const validateCreateVehicleTyre = [
  body('user_id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('vehicle_id')
    .isInt({ min: 1 }).withMessage('Valid vehicle is required')
    .custom(async (vehicle_id, { req }) => {
      const user_id = req.body.user_id;
      const vehicle = await Vehicle.findById(vehicle_id, user_id);
      if (!vehicle) throw new Error('Invalid vehicle');
    }),
  body('service_date')
    .isDate().withMessage('Valid service date is required'),
  body('next_service_date')
    .optional()
    .isDate().withMessage('Valid next service date is required'),
  body('odometer_reading')
    .optional()
    .isInt({ min: 0 }).withMessage('Odometer reading must be a positive number'),
  handleValidationErrors
];

// Query Validators
const validateVehicleQuery = [
  query('vehicle_type_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid vehicle type ID'),

  query('make')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Make filter too long'),

  query('registration_number')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Registration number filter too long'),

  handleValidationErrors
];

module.exports = {
  validateCreateVehicleType,
  validateUpdateVehicleType,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateCreateVehicleService,
  validateCreateVehicleTyre,
  validateVehicleQuery
};