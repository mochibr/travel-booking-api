const HotelFeature = require('../models/HotelFeature');

const createHotelFeature = async (req, res) => {
  try {
    const featureData = { ...req.body };

    const featureId = await HotelFeature.create(featureData);

    res.status(201).json({
      success: true,
      message: 'Hotel feature added successfully',
      data: { featureId }
    });
  } catch (error) {
    console.error('Create hotel feature error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add hotel feature'
    });
  }
};

const getHotelFeatures = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const features = await HotelFeature.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { features }
    });
  } catch (error) {
    console.error('Get hotel features error:', error);
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
  getHotelFeatures,
  deleteHotelFeature
};