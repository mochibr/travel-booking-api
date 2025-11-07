const VehicleGallery = require('../models/VehicleGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const uploadVehicleImage = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { user_id, alt_text, sort_order } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Upload image to S3
    const imageUrl = await uploadToS3(req.file, 'travel/vehicle/gallery');

    const galleryId = await VehicleGallery.create({
      user_id: user_id,
      vehicle_id: vehicleId,
      image_url: imageUrl,
      alt_text: alt_text || null,
      sort_order: sort_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle image uploaded successfully',
      data: { galleryId, imageUrl }
    });
  } catch (error) {
    console.error('Upload vehicle image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload vehicle image'
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
  uploadVehicleImage,
  getVehicleGallery,
  updateVehicleImage,
  deleteVehicleImage
};