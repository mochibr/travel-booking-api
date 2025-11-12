const HotelNearbyGallery = require('../models/HotelNearbyGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadNearbyImages = async (req, res) => {
  try {
    const { nearbyId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-nearby-gallery');
      
      galleryItems.push({
        hotel_nearby_id: nearbyId,
        image: imageUrl
      });
    }

    const galleryIds = await HotelNearbyGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} nearby place image(s) uploaded successfully`,
      data: {
        galleryIds,
        images: galleryItems.map((item, index) => ({
          galleryId: galleryIds[index],
          imageUrl: item.image
        }))
      }
    });
  } catch (error) {
    console.error('Upload nearby images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload nearby place images'
    });
  }
};

const getNearbyGallery = async (req, res) => {
  try {
    const { nearbyId } = req.params;
    
    const gallery = await HotelNearbyGallery.findByNearbyId(nearbyId);
    
    res.json({
      success: true,
      data: { gallery }
    });
  } catch (error) {
    console.error('Get nearby gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby place gallery'
    });
  }
};

const deleteNearbyImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await HotelNearbyGallery.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Nearby place image not found'
      });
    }

    await deleteFromS3(image.image);

    const deleted = await HotelNearbyGallery.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Nearby place image not found'
      });
    }

    res.json({
      success: true,
      message: 'Nearby place image deleted successfully'
    });
  } catch (error) {
    console.error('Delete nearby image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete nearby place image'
    });
  }
};

module.exports = {
  uploadNearbyImages,
  getNearbyGallery,
  deleteNearbyImage
};