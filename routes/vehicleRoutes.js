const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const {
  validateCreateVehicleType,
  validateUpdateVehicleType,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateCreateVehicleService,
  validateCreateVehicleTyre,
  validateVehicleQuery
} = require('../middleware/vehicleValidation');

const vehicleTypeController = require('../controllers/vehicleTypeController');
const vehicleController = require('../controllers/vehicleController');
const vehicleServiceController = require('../controllers/vehicleServiceController');
const vehicleTyreController = require('../controllers/vehicleTyreController');
const vehicleGalleryController = require('../controllers/vehicleGalleryController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Vehicle Type Routes
router.post('/types', auth('admin'), validateCreateVehicleType, vehicleTypeController.createVehicleType);
router.get('/types', vehicleTypeController.getVehicleTypes);
router.get('/types/:id', vehicleTypeController.getVehicleType);
router.put('/types/:id', auth('admin'), validateUpdateVehicleType, vehicleTypeController.updateVehicleType);
router.delete('/types/:id', auth('admin'), vehicleTypeController.deleteVehicleType);

// Vehicle Routes
// router.post('/',  auth('admin'), upload.single('feature_image'), validateCreateVehicle, vehicleController.createVehicle);
// router.get('/', validateVehicleQuery, vehicleController.getVehicles);
// router.get('/:id', vehicleController.getVehicle);
// router.put('/:id', auth('admin'), upload.single('feature_image'), validateUpdateVehicle, vehicleController.updateVehicle);
// router.delete('/:id', auth('admin'), vehicleController.deleteVehicle);

// // Vehicle Service Routes
// router.post('/services', auth('admin'), validateCreateVehicleService, vehicleServiceController.createVehicleService);
// router.get('/services', vehicleServiceController.getAllVehicleServices);
// router.get('/:vehicleId/services', vehicleServiceController.getVehicleServices);
// router.get('/services/:id', vehicleServiceController.getVehicleService);
// router.put('/services/:id', auth('admin'), vehicleServiceController.updateVehicleService);
// router.delete('/services/:id', auth('admin'), vehicleServiceController.deleteVehicleService);

// Vehicle Routes
router.post('/', auth('admin'), upload.single('feature_image'), validateCreateVehicle, vehicleController.createVehicle);
router.get('/', validateVehicleQuery, vehicleController.getVehicles);

// 👇 Move all /services routes above /:id
router.post('/services', auth('admin'), validateCreateVehicleService, vehicleServiceController.createVehicleService);
router.get('/services', vehicleServiceController.getAllVehicleServices);
router.get('/services/:id', vehicleServiceController.getVehicleService);
router.put('/services/:id', auth('admin'), vehicleServiceController.updateVehicleService);
router.delete('/services/:id', auth('admin'), vehicleServiceController.deleteVehicleService);

// Vehicle Tyre Routes
router.post('/tyres',  auth('admin'), validateCreateVehicleTyre, vehicleTyreController.createVehicleTyre);
router.get('/tyres', vehicleTyreController.getAllVehicleTyres);
router.get('/tyres/:id', vehicleTyreController.getVehicleTyre);
router.put('/tyres/:id', auth('admin'), vehicleTyreController.updateVehicleTyre);
router.delete('/tyres/:id', auth('admin'), vehicleTyreController.deleteVehicleTyre);

// Now keep :id routes last
router.get('/:id', vehicleController.getVehicle);
router.put('/:id', auth('admin'), upload.single('feature_image'), validateUpdateVehicle, vehicleController.updateVehicle);
router.delete('/:id', auth('admin'), vehicleController.deleteVehicle);

// Vehicle Gallery Routes
router.post('/:vehicleId/gallery', auth('admin'), upload.single('image'), vehicleGalleryController.uploadVehicleImage);
router.get('/:vehicleId/gallery', vehicleGalleryController.getVehicleGallery);
router.put('/gallery/:id', auth('admin'), vehicleGalleryController.updateVehicleImage);
router.delete('/gallery/:id', auth('admin'), vehicleGalleryController.deleteVehicleImage);

module.exports = router;