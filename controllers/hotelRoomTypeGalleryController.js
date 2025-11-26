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

    // Get current max sort_order for this room type
    const maxSortOrder = await HotelRoomTypeGallery.getMaxSortOrder(roomTypeId);
    let currentSortOrder = maxSortOrder + 1;

    // Process alt_text array if provided
    let altTexts = [];
    if (req.body.alt_text) {
      if (Array.isArray(req.body.alt_text)) {
        altTexts = req.body.alt_text.map(alt => 
          typeof alt === 'string' ? alt.split(',')[0] : alt
        );
      } else {
        altTexts = req.body.alt_text.split(',').map(alt => alt.trim());
      }
    }

    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-room-type-gallery');
      
      galleryItems.push({
        room_type_id: roomTypeId,
        image_url: imageUrl,
        alt_text: altTexts[i] || `Room type image ${currentSortOrder}`,
        sort_order: currentSortOrder
      });
      
      currentSortOrder++;
    }

    const galleryIds = await HotelRoomTypeGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} room type image(s) uploaded successfully`,
      data: {
        galleryIds,
        images: galleryItems.map((item, index) => ({
          galleryId: galleryIds[index],
          imageUrl: item.image_url,
          altText: item.alt_text,
          sortOrder: item.sort_order
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

    await deleteFromS3(image.image_url);

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

const updateRoomTypeImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, sort_order } = req.body;
    
    const updateData = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Check if a new image file is provided
    if (req.file) {
      // Get the current image to delete from S3
      const currentImage = await HotelRoomTypeGallery.findById(id);
      if (currentImage && currentImage.image_url) {
        // Delete old image from S3
        await deleteFromS3(currentImage.image_url);
      }

      // Upload new image to S3
      const newImageUrl = await uploadToS3(req.file, 'travel/hotel/hotel-room-type-gallery');
      updateData.image_url = newImageUrl;
    }

    const updated = await HotelRoomTypeGallery.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Room type image not found'
      });
    }

    res.json({
      success: true,
      message: 'Room type image updated successfully'
    });
  } catch (error) {
    console.error('Update room type image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update room type image'
    });
  }
};

module.exports = {
  uploadRoomTypeImages,
  getRoomTypeGallery,
  deleteRoomTypeImage,
  updateRoomTypeImage
};