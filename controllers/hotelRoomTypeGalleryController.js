const HotelRoomTypeGallery = require('../models/HotelRoomTypeGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadRoomTypeImages = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-room-type-gallery');
      
      galleryItems.push({
        room_type_id: roomTypeId,
        image: imageUrl
      });
    }

    const galleryIds = await HotelRoomTypeGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} room type image(s) uploaded successfully`,
      data: {
        galleryIds,
        images: galleryItems.map((item, index) => ({
          galleryId: galleryIds[index],
          imageUrl: item.image
        }))
      }
    });
  } catch (error) {
    console.error('Upload room type images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload room type images'
    });
  }
};

const getRoomTypeGallery = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    
    const gallery = await HotelRoomTypeGallery.findByRoomTypeId(roomTypeId);
    
    res.json({
      success: true,
      data: { gallery }
    });
  } catch (error) {
    console.error('Get room type gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room type gallery'
    });
  }
};

const deleteRoomTypeImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await HotelRoomTypeGallery.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Room type image not found'
      });
    }

    await deleteFromS3(image.image);

    const deleted = await HotelRoomTypeGallery.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Room type image not found'
      });
    }

    res.json({
      success: true,
      message: 'Room type image deleted successfully'
    });
  } catch (error) {
    console.error('Delete room type image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room type image'
    });
  }
};

module.exports = {
  uploadRoomTypeImages,
  getRoomTypeGallery,
  deleteRoomTypeImage
};