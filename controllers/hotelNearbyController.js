const HotelNearby = require('../models/HotelNearby');

const createHotelNearby = async (req, res) => {
  try {
    const nearbyData = { ...req.body };

    const nearbyId = await HotelNearby.create(nearbyData);

    res.status(201).json({
      success: true,
      message: 'Hotel nearby place created successfully',
      data: { nearbyId }
    });
  } catch (error) {
    console.error('Create hotel nearby error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel nearby place'
    });
  }
};

const getHotelNearbyPlaces = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const nearbyPlaces = await HotelNearby.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { nearbyPlaces }
    });
  } catch (error) {
    console.error('Get hotel nearby places error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel nearby places'
    });
  }
};

const getHotelNearby = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nearbyPlace = await HotelNearby.findById(id);
    if (!nearbyPlace) {
      return res.status(404).json({
        success: false,
        error: 'Hotel nearby place not found'
      });
    }

    res.json({
      success: true,
      data: { nearbyPlace }
    });
  } catch (error) {
    console.error('Get hotel nearby error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel nearby place'
    });
  }
};

const updateHotelNearby = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updated = await HotelNearby.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel nearby place not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel nearby place updated successfully'
    });
  } catch (error) {
    console.error('Update hotel nearby error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel nearby place'
    });
  }
};

const deleteHotelNearby = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelNearby.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel nearby place not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel nearby place deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel nearby error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel nearby place'
    });
  }
};

module.exports = {
  createHotelNearby,
  getHotelNearbyPlaces,
  getHotelNearby,
  updateHotelNearby,
  deleteHotelNearby
};