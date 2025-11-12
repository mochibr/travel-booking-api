const HotelType = require('../models/HotelType');

const createHotelType = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const hotelTypeId = await HotelType.create({
      user_id: user_id,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Hotel type created successfully',
      data: { hotelTypeId }
    });
  } catch (error) {
    console.error('Create hotel type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel type'
    });
  }
};

const getHotelTypes = async (req, res) => {
  try {
    const { 
      user_id, 
      search, 
      page = 1, 
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC',
      is_deleted = 0
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const isDeleted = is_deleted !== undefined ? parseInt(is_deleted) : 0;

    if (isDeleted !== 0 && isDeleted !== 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid is_deleted parameter. Must be 0 or 1.'
      });
    }

    const result = await HotelType.findWithPagination({
      user_id,
      search: search && search.trim() !== '' ? search.trim() : null,
      page: pageNum,
      limit: limitNum,
      sort_by,
      sort_order: sort_order.toUpperCase(),
      is_deleted: isDeleted
    });

    const totalPages = Math.ceil(result.totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        hotelTypes: result.hotelTypes,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_count: result.totalCount,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? pageNum + 1 : null,
          prev_page: hasPrevPage ? pageNum - 1 : null,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get hotel types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel types'
    });
  }
};

const getHotelType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hotelType = await HotelType.findById(id);

    if (!hotelType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel type not found'
      });
    }

    res.json({
      success: true,
      data: { hotelType }
    });
  } catch (error) {
    console.error('Get hotel type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel type'
    });
  }
};

const updateHotelType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const updated = await HotelType.update(id, { name });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel type updated successfully'
    });
  } catch (error) {
    console.error('Update hotel type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel type'
    });
  }
};

const deleteHotelType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HotelType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel type deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel type'
    });
  }
};

const archiveHotelType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelType.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel type archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel type'
    });
  }
};

const restoreHotelType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelType.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel type restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel type'
    });
  }
};

module.exports = {
  createHotelType,
  getHotelTypes,
  getHotelType,
  updateHotelType,
  deleteHotelType,
  archiveHotelType,
  restoreHotelType
};