const express = require('express');
const auth = require('../middleware/auth');

// Import driver controller
const driverController = require('../controllers/driverController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Define upload fields for driver documents using the upload middleware
const uploadFields = upload.fields([
  { name: 'id_proof', maxCount: 1 },
  { name: 'driver_photo', maxCount: 1 }
]);

// Driver Routes
router.post('/', auth('admin'), uploadFields, driverController.createDriver);
router.get('/', driverController.getDrivers);
router.get('/all/list', driverController.allDrivers);
router.get('/:id', driverController.getDriver);
router.put('/:id', auth('admin'), uploadFields, driverController.updateDriver);
router.delete('/:id', auth('admin'), driverController.deleteDriver);

// Driver License Expiry Alerts
router.get('/license-expiry/:user_id', driverController.getLicenseExpiryAlerts);

// Driver by User Routes
router.get('/user/:userId', driverController.getDriversByUser);

module.exports = router;