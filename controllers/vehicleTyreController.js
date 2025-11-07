const VehicleTyre = require('../models/VehicleTyre');

const createVehicleTyre = async (req, res) => {
  try {
    const tyreData = {
      ...req.body
    };

    const tyreId = await VehicleTyre.create(tyreData);

    res.status(201).json({
      success: true,
      message: 'Vehicle tyre service created successfully',
      data: { tyreId }
    });
  } catch (error) {
    console.error('Create vehicle tyre error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create vehicle tyre service'
    });
  }
};

const getAllVehicleTyres = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      vehicle_id,
      user_id,
      user_name,
      tyre_brand,
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
      user_name: user_name || null,
      tyre_brand: tyre_brand || null,
      start_date: start_date || null,
      end_date: end_date || null,
      sort_by,
      sort_order
    };

    const result = await VehicleTyre.findAllWithFilters(filters);
    
    res.json({
      success: true,
      data: {
        tyres: result.tyres,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get all vehicle tyres error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle tyres'
    });
  }
};

const getVehicleTyre = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tyre = await VehicleTyre.findById(id);
    if (!tyre) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle tyre service not found'
      });
    }

    res.json({
      success: true,
      data: { tyre }
    });
  } catch (error) {
    console.error('Get vehicle tyre error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle tyre service'
    });
  }
};


const updateVehicleTyre = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updated = await VehicleTyre.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle tyre service not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle tyre service updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle tyre error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update vehicle tyre service'
    });
  }
};


const deleteVehicleTyre = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await VehicleTyre.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle tyre service not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle tyre service deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle tyre error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle tyre service'
    });
  }
};

module.exports = {
  createVehicleTyre,
  getAllVehicleTyres,
  getVehicleTyre,
  updateVehicleTyre,
  deleteVehicleTyre
};