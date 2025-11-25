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
    const { 
      hotel_id,
      search,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Convert page and limit to numbers with validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
    const offset = (pageNum - 1) * limitNum;

    // Build filter object (hotel_id is now optional)
    const filters = {
      hotel_id: hotel_id ? parseInt(hotel_id) : null,
      search: search || null,
      page: pageNum,
      limit: limitNum,
      offset: offset,
      sort_by: sort_by,
      sort_order: sort_order.toUpperCase()
    };

    // Get nearby places with filters and pagination
    const result = await HotelNearby.findWithFilters(filters);
    
    const totalPages = Math.ceil(result.total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        nearbyPlaces: result.data,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_count: result.total,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? pageNum + 1 : null,
          prev_page: hasPrevPage ? pageNum - 1 : null,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get hotel nearby places error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel nearby places'
    });
  }
};

const getHotelIdNearbyPlaces = async (req, res) => {
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
  getHotelIdNearbyPlaces,
  getHotelNearbyPlaces,
  getHotelNearby,
  updateHotelNearby,
  deleteHotelNearby
};