const HotelRoom = require('../models/HotelRoom');

const createHotelRoom = async (req, res) => {
  try {
    const roomData = { ...req.body };

    const roomId = await HotelRoom.create(roomData);

    res.status(201).json({
      success: true,
      message: 'Hotel room created successfully',
      data: { roomId }
    });
  } catch (error) {
    console.error('Create hotel room error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel room'
    });
  }
};

const getHotelRooms = async (req, res) => {
  try {
    const {
      hotel_id, // Now optional query parameter
      room_type_id, // Optional room type filter
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;

    const result = await HotelRoom.findAllWithPagination(
      { 
        hotel_id: hotel_id ? parseInt(hotel_id) : null,
        room_type_id: room_type_id ? parseInt(room_type_id) : null,
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
        rooms: result.rooms,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get hotel rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel rooms'
    });
  }
};

const getHotelRoomsByType = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    
    const rooms = await HotelRoom.findByRoomTypeId(roomTypeId);
    
    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    console.error('Get hotel rooms by type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel rooms'
    });
  }
};

const getHotelRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await HotelRoom.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room not found'
      });
    }

    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get hotel room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel room'
    });
  }
};

const updateHotelRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const updated = await HotelRoom.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room updated successfully'
    });
  } catch (error) {
    console.error('Update hotel room error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel room'
    });
  }
};

const deleteHotelRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelRoom.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel room not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel room deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel room'
    });
  }
};

module.exports = {
  createHotelRoom,
  getHotelRooms,
  getHotelRoomsByType,
  getHotelRoom,
  updateHotelRoom,
  deleteHotelRoom
};