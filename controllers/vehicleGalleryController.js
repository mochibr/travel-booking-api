const VehicleGallery = require('../models/VehicleGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');
const db = require('../config/database');

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
    const altTexts = req.body.alt_text ? 
      (Array.isArray(req.body.alt_text) ? req.body.alt_text : [req.body.alt_text]) 
      : [];

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

const updateVehicleImages = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const updates = JSON.parse(req.body.gallery || '[]');

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    const updatedItems = [];

    for (let i = 0; i < updates.length; i++) {
      const item = updates[i];
      const file = req.files ? req.files[i] : null;

      // If new image file uploaded, replace existing one
      let newImageUrl = null;
      if (file) {
        newImageUrl = await uploadToS3(file, 'travel/vehicle/gallery');
      }

      const queryParts = [];
      const values = [];

      if (item.alt_text) {
        queryParts.push('alt_text = ?');
        values.push(item.alt_text);
      }
      if (item.sort_order) {
        queryParts.push('sort_order = ?');
        values.push(item.sort_order);
      }
      if (newImageUrl) {
        queryParts.push('image_url = ?');
        values.push(newImageUrl);
      }

      if (queryParts.length > 0) {
        values.push(item.id, vehicleId);
        const query = `
          UPDATE vehicle_gallery 
          SET ${queryParts.join(', ')} 
          WHERE id = ? AND vehicle_id = ?
        `;
        await db.execute(query, values);
      }

      updatedItems.push({
        id: item.id,
        alt_text: item.alt_text || null,
        sort_order: item.sort_order || null,
        image_url: newImageUrl || null
      });
    }

    res.status(200).json({
      success: true,
      message: `${updatedItems.length} vehicle image(s) updated successfully`,
      data: updatedItems
    });
  } catch (error) {
    console.error('Update vehicle images error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle images'
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
  updateVehicleImages,
  deleteVehicleImage
};