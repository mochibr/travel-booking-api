// routes/unavailabilityRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  validateCreateUnavailability,
  validateUpdateUnavailability
} = require('../middleware/unavailabilityValidation');

const unavailabilityController = require('../controllers/unavailabilityController');

const router = express.Router();

// Unavailability Routes
router.post('/', auth('admin'), validateCreateUnavailability, unavailabilityController.createUnavailability);
router.get('/', unavailabilityController.getAllUnavailabilities);
router.get('/:id', unavailabilityController.getUnavailability);
router.get('/reference/:reference_id/:reference_type', unavailabilityController.getUnavailabilityByReference);
router.put('/:id', auth('admin'), validateUpdateUnavailability, unavailabilityController.updateUnavailability);
router.delete('/:id', auth('admin'), unavailabilityController.deleteUnavailability);

module.exports = router;