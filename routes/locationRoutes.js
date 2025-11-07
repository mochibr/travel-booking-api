const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Country routes
router.get('/countries', locationController.getCountries);
router.get('/countries/:id', locationController.getCountryById);

// State routes
router.get('/states/country/:countryId', locationController.getStatesByCountry);
router.get('/states/:id', locationController.getStateById);

// City routes
router.get('/cities/state/:stateId', locationController.getCitiesByState);
router.get('/cities/:id', locationController.getCityById);

module.exports = router;