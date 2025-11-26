const VehicleGallery = require('../models/VehicleGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadVehicleImages = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { user_id } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image file is required'
      });
    }

    // Get current max sort_order for this vehicle
    const maxSortOrder = await VehicleGallery.getMaxSortOrder(vehicleId);
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

    // Upload all images to S3 and prepare gallery data
    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Upload image to S3
      const imageUrl = await uploadToS3(file, 'travel/vehicle/gallery');
      
      galleryItems.push({
        user_id: user_id,
        vehicle_id: vehicleId,
        image_url: imageUrl,
        alt_text: altTexts[i] || `Vehicle image ${currentSortOrder}`,
        sort_order: currentSortOrder
      });
      
      currentSortOrder++;
    }

    // Insert all gallery items
    const galleryIds = await VehicleGallery.createMultiple(galleryItems);

    res.status(201).json({
      success: true,
      message: `${galleryItems.length} vehicle image(s) uploaded successfully`,
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
    console.error('Upload vehicle images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload vehicle images'
    });
  }
};

const getVehicleGallery = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const gallery = await VehicleGallery.findByVehicleId(vehicleId);
    
    res.json({
      success: true,
      data: { gallery }
    });
  } catch (error) {
    console.error('Get vehicle gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle gallery'
    });
  }
};

const updateVehicleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, sort_order } = req.body;
    
    const updateData = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Check if a new image file is provided
    if (req.file) {
      // Get the current image to delete from S3
      const currentImage = await VehicleGallery.findById(id);
      if (currentImage && currentImage.image_url) {
        // Delete old image from S3
        await deleteFromS3(currentImage.image_url);
      }

      // Upload new image to S3
      const newImageUrl = await uploadToS3(req.file, 'travel/vehicle/gallery');
      updateData.image_url = newImageUrl;
    }

    const updated = await VehicleGallery.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle image not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle image updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle image'
    });
  }
};

const deleteVehicleImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image details before deletion
    const image = await VehicleGallery.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle image not found'
      });
    }

    // Delete image from S3
    await deleteFromS3(image.image_url);

    const deleted = await VehicleGallery.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle image not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle image deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle image'
    });
  }
};

module.exports = {
  uploadVehicleImages,
  getVehicleGallery,
  updateVehicleImage,
  deleteVehicleImage
};