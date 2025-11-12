const HotelRoomAmenity = require('../models/HotelRoomAmenity');

const createHotelRoomAmenity = async (req, res) => {
  try {
    const roomAmenityData = { ...req.body };

    const roomAmenityId = await HotelRoomAmenity.create(roomAmenityData);

    res.status(201).json({
      success: true,
      message: 'Room amenity added successfully',
      data: { roomAmenityId }
    });
  } catch (error) {
    console.error('Create room amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add room amenity'
    });
  }
};

const getRoomAmenities = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const amenities = await HotelRoomAmenity.findByRoomId(roomId);
    
    res.json({
      success: true,
      data: { amenities }
    });
  } catch (error) {
    console.error('Get room amenities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room amenities'
    });
  }
};

const deleteRoomAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelRoomAmenity.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Room amenity not found'
      });
    }

    res.json({
      success: true,
      message: 'Room amenity removed successfully'
    });
  } catch (error) {
    console.error('Delete room amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove room amenity'
    });
  }
};

module.exports = {
  createHotelRoomAmenity,
  getRoomAmenities,
  deleteRoomAmenity
};