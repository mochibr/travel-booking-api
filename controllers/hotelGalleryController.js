const HotelGallery = require('../models/HotelGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadHotelImages = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-gallery');
      
      galleryItems.push({
        hotel_id: hotelId,
        image: imageUrl
      });
    }

    const galleryIds = await HotelGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} hotel image(s) uploaded successfully`,
      data: {
        galleryIds,
        images: galleryItems.map((item, index) => ({
          galleryId: galleryIds[index],
          imageUrl: item.image
        }))
      }
    });
  } catch (error) {
    console.error('Upload hotel images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload hotel images'
    });
  }
};

const getHotelGallery = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const gallery = await HotelGallery.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { gallery }
    });
  } catch (error) {
    console.error('Get hotel gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel gallery'
    });
  }
};

const deleteHotelImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await HotelGallery.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Hotel image not found'
      });
    }

    await deleteFromS3(image.image);

    const deleted = await HotelGallery.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel image not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel image deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel image'
    });
  }
};

module.exports = {
  uploadHotelImages,
  getHotelGallery,
  deleteHotelImage
};