const HotelRoomAmenity = require('../models/HotelRoomAmenity');

const createHotelRoomAmenity = async (req, res) => {
  try {
    const { room_id, amenity_ids } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!room_id || !amenity_ids || !Array.isArray(amenity_ids)) {
      return res.status(400).json({
        success: false,
        error: 'room_id and amenity_ids array are required'
      });
    }

    const amenityId = await HotelRoomAmenity.create({ room_id, amenity_ids });

    res.status(201).json({
      success: true,
      message: 'Room amenities added successfully',
      data: { amenityId }
    });
  } catch (error) {
    console.error('Create room amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add room amenities'
    });
  }
};

const updateRoomAmenities = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { amenity_ids } = req.body;

    // Validate required fields
    if (!amenity_ids || !Array.isArray(amenity_ids)) {
      return res.status(400).json({
        success: false,
        error: 'amenity_ids array is required'
      });
    }

    const updated = await HotelRoomAmenity.update(roomId, amenity_ids);

    res.json({
      success: true,
      message: 'Room amenities updated successfully',
      data: { updated }
    });
  } catch (error) {
    console.error('Update room amenities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update room amenities'
    });
  }
};

const getRoomAmenities = async (req, res) => {
  try {
    const {
      room_id, // Now optional query parameter
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;

    const result = await HotelRoomAmenity.findAllWithPagination(
      { 
        room_id: room_id ? parseInt(room_id) : null,
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
        amenities: result.amenities,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get room amenities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room amenities'
    });
  }
};

const getRoomAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate required field
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Room amenity ID is required'
      });
    }

    const amenity = await HotelRoomAmenity.findById(id);
    
    if (!amenity) {
      return res.status(404).json({
        success: false,
        error: 'Room amenity not found'
      });
    }

    res.json({
      success: true,
      data: { amenity }
    });
  } catch (error) {
    console.error('Get room amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room amenity'
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
  updateRoomAmenities,
  getRoomAmenities,
  getRoomAmenity,
  deleteRoomAmenity
};