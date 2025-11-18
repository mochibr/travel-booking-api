const HotelGallery = require('../models/HotelGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadHotelImages = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { user_id } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    // Get current max sort_order for this hotel
    const maxSortOrder = await HotelGallery.getMaxSortOrder(hotelId);
    let currentSortOrder = maxSortOrder + 1;

    // Process alt_text array if provided
    const altTexts = req.body.alt_text ? 
      (Array.isArray(req.body.alt_text) ? req.body.alt_text : [req.body.alt_text]) 
      : [];

    // Upload all images to S3 and prepare gallery data
    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Upload image to S3
      const imageUrl = await uploadToS3(file, 'travel/hotel/hotel-gallery');
      
      galleryItems.push({
        user_id: user_id,
        hotel_id: hotelId,
        image_url: imageUrl,
        alt_text: altTexts[i] || `Hotel image ${currentSortOrder}`,
        sort_order: currentSortOrder
      });
      
      currentSortOrder++;
    }

    // Insert all gallery items
    const galleryIds = await HotelGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} hotel image(s) uploaded successfully`,
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

const updateHotelGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, sort_order } = req.body;
    
    const updateData = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Check if a new image file is provided
    if (req.file) {
      // Get the current image to delete from S3
      const currentImage = await HotelGallery.findById(id);
      if (currentImage && currentImage.image_url) {
        // Delete old image from S3
        await deleteFromS3(currentImage.image_url);
      }

      // Upload new image to S3
      const newImageUrl = await uploadToS3(req.file, 'travel/hotel/hotel-gallery');
      updateData.image_url = newImageUrl;
    }

    const updated = await HotelGallery.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel image not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel image updated successfully'
    });
  } catch (error) {
    console.error('Update Hotel image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update Hotel image'
    });
  }
};


module.exports = {
  uploadHotelImages,
  getHotelGallery,
  deleteHotelImage,
  updateHotelGallery
};