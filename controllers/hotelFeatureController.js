const HotelFeature = require('../models/HotelFeature');

const createHotelFeature = async (req, res) => {
  try {
    const { hotel_id, feature_ids } = req.body;

    // Validate required fields
    if (!hotel_id || !feature_ids || !Array.isArray(feature_ids)) {
      return res.status(400).json({
        success: false,
        error: 'hotel_id and feature_ids array are required'
      });
    }

    const featureId = await HotelFeature.create({ hotel_id, feature_ids });

    res.status(201).json({
      success: true,
      message: 'Hotel features added successfully',
      data: { featureId }
    });
  } catch (error) {
    console.error('Create hotel feature error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add hotel features'
    });
  }
};

const updateHotelFeatures = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { feature_ids } = req.body;

    // Validate required fields
    if (!feature_ids || !Array.isArray(feature_ids)) {
      return res.status(400).json({
        success: false,
        error: 'feature_ids array is required'
      });
    }

    const updated = await HotelFeature.update(hotelId, feature_ids);

    res.json({
      success: true,
      message: 'Hotel features updated successfully',
      data: { updated }
    });
  } catch (error) {
    console.error('Update hotel features error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel features'
    });
  }
};

const getHotelFeatures = async (req, res) => {
  try {
    const {
      hotel_id, // Now optional query parameter
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;

    const result = await HotelFeature.findAllWithPagination(
      { 
        hotel_id: hotel_id ? parseInt(hotel_id) : null,
        search, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        sort_by, 
        sort_order 
      }
    );
    
    res.json({
      success: true,
      data: {
        features: result.features,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get hotel features error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel features'
    });
  }
};

const getHotelFeature = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Feature ID is required'
      });
    }

    const feature = await HotelFeature.findById(id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature not found'
      });
    }

    res.json({
      success: true,
      data: { feature }
    });
  } catch (error) {
    console.error('Get hotel feature error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel feature'
    });
  }
};

const getHotelFeaturesByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Validate required field
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: 'Hotel ID is required'
      });
    }

    const features = await HotelFeature.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { 
        features,
        count: features.length
      }
    });
  } catch (error) {
    console.error('Get hotel features by hotel ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel features'
    });
  }
};

const deleteHotelFeature = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelFeature.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel feature removed successfully'
    });
  } catch (error) {
    console.error('Delete hotel feature error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove hotel feature'
    });
  }
};

module.exports = {
  createHotelFeature,
  updateHotelFeatures,
  getHotelFeatures,
  getHotelFeature,
  getHotelFeaturesByHotelId,
  deleteHotelFeature
};