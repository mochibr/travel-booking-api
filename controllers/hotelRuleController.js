const HotelRule = require('../models/HotelRule');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotelRule = async (req, res) => {
  try {
    const ruleData = { ...req.body };

    // Handle icon upload
    if (req.file) {
      ruleData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-rule');
    }

    const ruleId = await HotelRule.create(ruleData);

    res.status(201).json({
      success: true,
      message: 'Hotel rule created successfully',
      data: { ruleId }
    });
  } catch (error) {
    console.error('Create hotel rule error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel rule'
    });
  }
};

const getHotelRules = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const rules = await HotelRule.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { rules }
    });
  } catch (error) {
    console.error('Get hotel rules error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel rules'
    });
  }
};

const getHotelRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await HotelRule.findById(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Hotel rule not found'
      });
    }

    res.json({
      success: true,
      data: { rule }
    });
  } catch (error) {
    console.error('Get hotel rule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel rule'
    });
  }
};

const updateHotelRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const existingRule = await HotelRule.findById(id);
    if (!existingRule) {
      return res.status(404).json({
        success: false,
        error: 'Hotel rule not found'
      });
    }

    // Handle icon upload
    if (req.file) {
      if (existingRule.icon) {
        await deleteFromS3(existingRule.icon);
      }
      updateData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-rule');
    }

    const updated = await HotelRule.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel rule updated successfully'
    });
  } catch (error) {
    console.error('Update hotel rule error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel rule'
    });
  }
};

const deleteHotelRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRule = await HotelRule.findById(id);
    if (!existingRule) {
      return res.status(404).json({
        success: false,
        error: 'Hotel rule not found'
      });
    }

    if (existingRule.icon) {
      await deleteFromS3(existingRule.icon);
    }

    const deleted = await HotelRule.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel rule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel rule'
    });
  }
};

module.exports = {
  createHotelRule,
  getHotelRules,
  getHotelRule,
  updateHotelRule,
  deleteHotelRule
};