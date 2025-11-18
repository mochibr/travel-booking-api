const Vehicle = require('../models/Vehicle');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createVehicle = async (req, res) => {
  try {
    const { user_id, ...vehicleData } = req.body;

    console.log(req.body);
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const vehicleDataWithUser = {
      user_id: user_id,
      ...vehicleData
    };

    // Handle feature image upload
    if (req.file) {
      vehicleDataWithUser.feature_image = await uploadToS3(req.file, 'travel/vehicle');
    }

    const vehicleId = await Vehicle.create(vehicleDataWithUser);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { vehicleId }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create vehicle'
    });
  }
};

const getVehicles = async (req, res) => {
  try {
    const { 
      user_id,
      vehicle_type_id,
      search,
      page = 1, 
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC',
      status
    } = req.query;
    
    // Convert page and limit to integers with validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Max 100 per page

    // Build filters object
    const filters = {
      page: pageNum,
      limit: limitNum,
      sort_by,
      sort_order: sort_order.toUpperCase()
    };
    
    // Add optional filters
    if (user_id) filters.user_id = parseInt(user_id);
    if (vehicle_type_id) filters.vehicle_type_id = parseInt(vehicle_type_id);
    if (status) filters.status = status;
    if (search && search.trim() !== '') filters.search = search.trim();

    const result = await Vehicle.findAllWithPagination(filters);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(result.totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: { 
        vehicles: result.vehicles,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_count: result.totalCount,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? pageNum + 1 : null,
          prev_page: hasPrevPage ? pageNum - 1 : null,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
};
const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: { vehicle }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle'
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Handle feature image upload
    if (req.file) {
      // Delete old feature image from S3
      if (existingVehicle.feature_image) {
        await deleteFromS3(existingVehicle.feature_image);
      }

      // Upload new feature image to S3
      updateData.feature_image = await uploadToS3(req.file, 'travel/vehicle');
    }

    const updated = await Vehicle.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle'
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle exists and get feature image
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Delete feature image from S3
    if (existingVehicle.feature_image) {
      await deleteFromS3(existingVehicle.feature_image);
    }

    const deleted = await Vehicle.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
};


module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
};