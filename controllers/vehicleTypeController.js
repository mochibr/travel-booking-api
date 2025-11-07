const VehicleType = require('../models/VehicleType');

const createVehicleType = async (req, res) => {
  try {
    const { user_id, name, description } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const vehicleTypeId = await VehicleType.create({
      user_id: user_id,
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle type created successfully',
      data: { vehicleTypeId }
    });
  } catch (error) {
    console.error('Create vehicle type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create vehicle type'
    });
  }
};

/*
const getVehicleTypes = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    // const vehicleTypes = await VehicleType.findByUserId(user_id);
    let vehicleTypes;

    if (user_id) {
      // If user_id is provided, filter by user
      vehicleTypes = await VehicleType.findByUserId(user_id);
    } else {
      // If no user_id, get all vehicle types
      vehicleTypes = await VehicleType.findAll();
    }
    
    res.json({
      success: true,
      data: { vehicleTypes }
    });
  } catch (error) {
    console.error('Get vehicle types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle types'
    });
  }
}; */

const getVehicleTypes = async (req, res) => {
  try {
    const { 
      user_id, 
      search, 
      page = 1, 
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;
    
    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build search criteria
    const searchCriteria = {};
    
    if (user_id) {
      searchCriteria.user_id = user_id;
    }
    
    if (search && search.trim() !== '') {
      searchCriteria.search = search.trim();
    }

    // Get vehicle types with pagination and search
    const result = await VehicleType.findWithPagination({
      ...searchCriteria,
      page: pageNum,
      limit: limitNum,
      sort_by,
      sort_order: sort_order.toUpperCase()
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        vehicleTypes: result.vehicleTypes,
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
    console.error('Get vehicle types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle types'
    });
  }
};

const getVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicleType = await VehicleType.findById(id);

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle type not found'
      });
    }

    res.json({
      success: true,
      data: { vehicleType }
    });
  } catch (error) {
    console.error('Get vehicle type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle type'
    });
  }
};

const updateVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, name, description } = req.body;
    
    const updated = await VehicleType.update(id, user_id, { name, description });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle type not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle type updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle type'
    });
  }
};

const deleteVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await VehicleType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle type not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle type deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle type'
    });
  }
};

module.exports = {
  createVehicleType,
  getVehicleTypes,
  getVehicleType,
  updateVehicleType,
  deleteVehicleType
};