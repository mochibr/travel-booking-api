const HotelRoomType = require('../models/HotelRoomType');

const createHotelRoomType = async (req, res) => {
  try {
    const roomTypeData = { ...req.body };

    const roomTypeId = await HotelRoomType.create(roomTypeData);

    res.status(201).json({
      success: true,
      message: 'Hotel room type created successfully',
      data: { roomTypeId }
    });
  } catch (error) {
    console.error('Create hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel room type'
    });
  }
};

const getHotelRoomTypes = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const roomTypes = await HotelRoomType.findByHotelId(hotelId);
    
    res.json({
      success: true,
      data: { roomTypes }
    });
  } catch (error) {
    console.error('Get hotel room types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel room types'
    });
  }
};

const getHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const roomType = await HotelRoomType.findById(id);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room type not found'
      });
    }

    res.json({
      success: true,
      data: { roomType }
    });
  } catch (error) {
    console.error('Get hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel room type'
    });
  }
};

const updateHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updated = await HotelRoomType.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room type updated successfully'
    });
  } catch (error) {
    console.error('Update hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel room type'
    });
  }
};

const deleteHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelRoomType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room type deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel room type'
    });
  }
};

const archiveHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelRoomType.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room type archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel room type'
    });
  }
};

const restoreHotelRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelRoomType.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room type restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel room type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel room type'
    });
  }
};

module.exports = {
  createHotelRoomType,
  getHotelRoomTypes,
  getHotelRoomType,
  updateHotelRoomType,
  deleteHotelRoomType,
  archiveHotelRoomType,
  restoreHotelRoomType
};