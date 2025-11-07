const VehicleService = require('../models/VehicleService');

const createVehicleService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body
    };

    const serviceId = await VehicleService.create(serviceData);

    res.status(201).json({
      success: true,
      message: 'Vehicle service created successfully',
      data: { serviceId }
    });
  } catch (error) {
    console.error('Create vehicle service error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create vehicle service'
    });
  }
};

const getAllVehicleServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      vehicle_id,
      user_id,
      user_name, // Add user_name parameter
      start_date,
      end_date,
      sort_by = 'service_date',
      sort_order = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      vehicle_id: vehicle_id || null,
      user_id: user_id || null,
      user_name: user_name || null, // Add user_name to filters
      start_date: start_date || null,
      end_date: end_date || null,
      sort_by,
      sort_order
    };

    const result = await VehicleService.findAllWithFilters(filters);
    
    res.json({
      success: true,
      data: {
        services: result.services,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get all vehicle services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle services'
    });
  }
};

const getVehicleService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await VehicleService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get vehicle service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle service'
    });
  }
};

const updateVehicleService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updated = await VehicleService.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle service not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle service updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle service error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle service'
    });
  }
};

const deleteVehicleService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await VehicleService.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle service not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle service deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle service'
    });
  }
};

module.exports = {
  createVehicleService,
  getAllVehicleServices,
  getVehicleService,
  updateVehicleService,
  deleteVehicleService
};