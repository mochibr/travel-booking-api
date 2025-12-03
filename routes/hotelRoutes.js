const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');

// Import all controllers
const hotelTypeController = require('../controllers/hotelTypeController');
const hotelController = require('../controllers/hotelController');
const hotelNearbyController = require('../controllers/hotelNearbyController');
const hotelNearbyGalleryController = require('../controllers/hotelNearbyGalleryController');
const hotelRuleController = require('../controllers/hotelRuleController');
const hotelGalleryController = require('../controllers/hotelGalleryController');
const hotelFeatureTypeController = require('../controllers/hotelFeatureTypeController');
const hotelFeatureController = require('../controllers/hotelFeatureController');
const hotelBedTypeController = require('../controllers/hotelBedTypeController');
const hotelViewTypeController = require('../controllers/hotelViewTypeController');
const hotelRoomTypeController = require('../controllers/hotelRoomTypeController');
const hotelRoomTypeGalleryController = require('../controllers/hotelRoomTypeGalleryController');
const hotelRoomController = require('../controllers/hotelRoomController');
const hotelAmenityController = require('../controllers/hotelAmenityController');
const hotelRoomAmenityController = require('../controllers/hotelRoomAmenityController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Hotel Type Routes
router.post('/types', auth('admin'), hotelTypeController.createHotelType);
router.get('/types', hotelTypeController.getHotelTypes);
router.get('/types/all/list', hotelTypeController.getAllHotelTypes);
router.get('/types/:id', hotelTypeController.getHotelType);
router.put('/types/:id', auth('admin'), hotelTypeController.updateHotelType);
router.put('/types/:id/archive', auth('admin'), hotelTypeController.archiveHotelType);
router.put('/types/:id/restore', auth('admin'), hotelTypeController.restoreHotelType);
router.delete('/types/:id', auth('admin'), hotelTypeController.deleteHotelType);

// Hotel Nearby Routes
router.post('/nearby', auth('admin'), hotelNearbyController.createHotelNearby);
router.get('/nearby', hotelNearbyController.getHotelNearbyPlaces);
router.get('/:hotelId/nearby', hotelNearbyController.getHotelIdNearbyPlaces);
router.get('/nearby/:id', hotelNearbyController.getHotelNearby);
router.put('/nearby/:id', auth('admin'), hotelNearbyController.updateHotelNearby);
router.delete('/nearby/:id', auth('admin'), hotelNearbyController.deleteHotelNearby);

// Hotel Nearby Gallery Routes
router.post('/nearby/:nearbyId/gallery', auth('admin'), upload.array('images', 10), hotelNearbyGalleryController.uploadNearbyImages);
router.get('/nearby/:nearbyId/gallery', hotelNearbyGalleryController.getNearbyGallery);
router.put('/nearby/gallery/:id', auth('admin'), upload.single('image'), hotelNearbyGalleryController.updateNearbyImage);
router.delete('/nearby/gallery/:id', auth('admin'), hotelNearbyGalleryController.deleteNearbyImage);

// Hotel Rule Routes
router.post('/rules', auth('admin'), upload.single('icon'), hotelRuleController.createHotelRule);
router.get('/rules', hotelRuleController.getHotelRules);
router.get('/rules/:id', hotelRuleController.getHotelRule);
router.put('/rules/:id', auth('admin'), upload.single('icon'), hotelRuleController.updateHotelRule);
router.delete('/rules/:id', auth('admin'), hotelRuleController.deleteHotelRule);

// Hotel Gallery Routes
router.post('/:hotelId/gallery', auth('admin'), upload.array('images', 10), hotelGalleryController.uploadHotelImages);
router.get('/:hotelId/gallery', hotelGalleryController.getHotelGallery);
router.put('/gallery/:id', auth('admin'), upload.single('image'), hotelGalleryController.updateHotelGallery);
router.delete('/gallery/:id', auth('admin'), hotelGalleryController.deleteHotelImage);

// Hotel Feature Type Routes
router.post('/feature-types', auth('admin'), upload.single('icon'), hotelFeatureTypeController.createHotelFeatureType);
router.get('/feature-types', hotelFeatureTypeController.getHotelFeatureTypes);
router.get('/feature-types/all/list', hotelFeatureTypeController.getAllHotelFeatureTypes); 
router.get('/feature-types/:id', hotelFeatureTypeController.getHotelFeatureType);
router.put('/feature-types/:id', auth('admin'), upload.single('icon'), hotelFeatureTypeController.updateHotelFeatureType);
router.put('/feature-types/:id/archive', auth('admin'), hotelFeatureTypeController.archiveHotelFeatureType);
router.put('/feature-types/:id/restore', auth('admin'), hotelFeatureTypeController.restoreHotelFeatureType);
router.delete('/feature-types/:id', auth('admin'), hotelFeatureTypeController.deleteHotelFeatureType);

// Hotel Feature Routes
router.post('/features', auth('admin'), hotelFeatureController.createHotelFeature);
router.get('/features', hotelFeatureController.getHotelFeatures);
router.get('/features/:id', hotelFeatureController.getHotelFeature); 
router.put('/:hotelId/features', auth('admin'), hotelFeatureController.updateHotelFeatures);
router.delete('/features/:id', auth('admin'), hotelFeatureController.deleteHotelFeature);

// Hotel Bed Type Routes
router.post('/bed-types', auth('admin'), upload.single('icon'), hotelBedTypeController.createHotelBedType);
router.get('/bed-types', hotelBedTypeController.getHotelBedTypes);
router.get('/bed-types/all/list', hotelBedTypeController.getAllHotelBedTypes);
router.get('/bed-types/:id', hotelBedTypeController.getHotelBedType);
router.put('/bed-types/:id', auth('admin'), upload.single('icon'), hotelBedTypeController.updateHotelBedType);
router.put('/bed-types/:id/archive', auth('admin'), hotelBedTypeController.archiveHotelBedType);
router.put('/bed-types/:id/restore', auth('admin'), hotelBedTypeController.restoreHotelBedType);
router.delete('/bed-types/:id', auth('admin'), hotelBedTypeController.deleteHotelBedType);

// Hotel View Type Routes
router.post('/view-types', auth('admin'), upload.single('icon'), hotelViewTypeController.createHotelViewType);
router.get('/view-types', hotelViewTypeController.getHotelViewTypes);
router.get('/view-types/all/list', hotelViewTypeController.getAllHotelViewTypes);
router.get('/view-types/:id', hotelViewTypeController.getHotelViewType);
router.put('/view-types/:id', auth('admin'), upload.single('icon'), hotelViewTypeController.updateHotelViewType);
router.put('/view-types/:id/archive', auth('admin'), hotelViewTypeController.archiveHotelViewType);
router.put('/view-types/:id/restore', auth('admin'), hotelViewTypeController.restoreHotelViewType);
router.delete('/view-types/:id', auth('admin'), hotelViewTypeController.deleteHotelViewType);

// Hotel Room Type Routes
router.post('/room-types', auth('admin'), hotelRoomTypeController.createHotelRoomType);
router.get('/room-types', hotelRoomTypeController.getHotelRoomTypes);
router.get('/room-types/all/list', hotelRoomTypeController.getAllHotelRoomTypes);
router.get('/room-types/:hotelId/list', hotelRoomTypeController.getHotelRoomTypesByHotelId)
router.get('/room-types/:id', hotelRoomTypeController.getHotelRoomType);
router.put('/room-types/:id', auth('admin'), hotelRoomTypeController.updateHotelRoomType);
router.put('/room-types/:id/archive', auth('admin'), hotelRoomTypeController.archiveHotelRoomType);
router.put('/room-types/:id/restore', auth('admin'), hotelRoomTypeController.restoreHotelRoomType);
router.delete('/room-types/:id', auth('admin'), hotelRoomTypeController.deleteHotelRoomType);

// Hotel Room Type Gallery Routes
router.post('/room-types/:roomTypeId/gallery', auth('admin'), upload.array('images', 100), hotelRoomTypeGalleryController.uploadRoomTypeImages);
router.get('/room-types/:roomTypeId/gallery', hotelRoomTypeGalleryController.getRoomTypeGallery);
router.put('/room-types/gallery/:id', auth('admin'), upload.single('image'), hotelRoomTypeGalleryController.updateRoomTypeImage);
router.delete('/room-types/gallery/:id', auth('admin'), hotelRoomTypeGalleryController.deleteRoomTypeImage);;

// Hotel Room Routes
router.post('/rooms', auth('admin'), hotelRoomController.createHotelRoom);
router.get('/rooms', hotelRoomController.getHotelRooms);
router.get('/room-types/:roomTypeId/rooms', hotelRoomController.getHotelRoomsByType);
router.get('/rooms/:id', hotelRoomController.getHotelRoom);
router.put('/rooms/:id', auth('admin'), hotelRoomController.updateHotelRoom);
router.delete('/rooms/:id', auth('admin'), hotelRoomController.deleteHotelRoom);

// Hotel Amenity Routes
router.post('/amenities', auth('admin'), upload.single('icon'), hotelAmenityController.createHotelAmenity);
router.get('/amenities', hotelAmenityController.getHotelAmenities);
router.get('/amenities/all/list', hotelAmenityController.getAllHotelAmenities);
router.get('/amenities/:id', hotelAmenityController.getHotelAmenity);
router.put('/amenities/:id', auth('admin'), upload.single('icon'), hotelAmenityController.updateHotelAmenity);
router.put('/amenities/:id/archive', auth('admin'), hotelAmenityController.archiveHotelAmenity);
router.put('/amenities/:id/restore', auth('admin'), hotelAmenityController.restoreHotelAmenity);
router.delete('/amenities/:id', auth('admin'), hotelAmenityController.deleteHotelAmenity);

// Hotel Room Amenity Routes
router.post('/room-amenities', auth('admin'), hotelRoomAmenityController.createHotelRoomAmenity);
router.get('/room-amenities', hotelRoomAmenityController.getRoomAmenities);
router.get('/room-amenities/:roomId/lists', hotelRoomAmenityController.getRoomAmenitiesByRoomId);
router.get('/room-amenities/:id', hotelRoomAmenityController.getRoomAmenity);
router.put('/:roomId/room-amenities', auth('admin'), hotelRoomAmenityController.updateRoomAmenities);
router.delete('/room-amenities/:id', auth('admin'), hotelRoomAmenityController.deleteRoomAmenity);

// Hotel Routes
router.post('/', auth('admin'), upload.single('logo_image'), hotelController.createHotel);
router.get('/', hotelController.getHotels);
router.get('/all/list', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotel);
router.put('/:id', auth('admin'), upload.single('logo_image'), hotelController.updateHotel);
router.delete('/:id', auth('admin'), hotelController.deleteHotel);

module.exports = router;