const HotelNearbyGallery = require('../models/HotelNearbyGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadNearbyImages = async (req, res) => {
  try {
    const { nearbyId } = req.params;
    const { user_id } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    // Get current max sort_order for this nearby place
    const maxSortOrder = await HotelNearbyGallery.getMaxSortOrder(nearbyId);
    let currentSortOrder = maxSortOrder + 1;

    // Process alt_text array if provided
    const altTexts = req.body.alt_text ? 
      (Array.isArray(req.body.alt_text) ? req.body.alt_text : [req.body.alt_text]) 
      : [];

    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-nearby-gallery');
      
      galleryItems.push({
        hotel_nearby_id: nearbyId,
        image_url: imageUrl,
        alt_text: altTexts[i] || `Nearby place image ${currentSortOrder}`,
        sort_order: currentSortOrder
      });
      
      currentSortOrder++;
    }

    const galleryIds = await HotelNearbyGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} nearby place image(s) uploaded successfully`,
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

    await deleteFromS3(image.image_url);

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

const updateNearbyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, sort_order } = req.body;
    
    const updateData = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Check if a new image file is provided
    if (req.file) {
      // Get the current image to delete from S3
      const currentImage = await HotelNearbyGallery.findById(id);
      if (currentImage && currentImage.image_url) {
        // Delete old image from S3
        await deleteFromS3(currentImage.image_url);
      }

      // Upload new image to S3
      const newImageUrl = await uploadToS3(req.file, 'travel/hotel/hotel-nearby-gallery');
      updateData.image_url = newImageUrl;
    }

    const updated = await HotelNearbyGallery.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Nearby place image not found'
      });
    }

    res.json({
      success: true,
      message: 'Nearby place image updated successfully'
    });
  } catch (error) {
    console.error('Update nearby image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update nearby place image'
    });
  }
};

module.exports = {
  uploadNearbyImages,
  getNearbyGallery,
  deleteNearbyImage,
  updateNearbyImage
};