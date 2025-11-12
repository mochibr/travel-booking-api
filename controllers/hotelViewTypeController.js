const HotelViewType = require('../models/HotelViewType');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotelViewType = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const viewTypeData = {
      user_id: user_id,
      name
    };

    // Handle icon upload
    if (req.file) {
      viewTypeData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-view-type');
    }
    
    const viewTypeId = await HotelViewType.create(viewTypeData);

    res.status(201).json({
      success: true,
      message: 'Hotel view type created successfully',
      data: { viewTypeId }
    });
  } catch (error) {
    console.error('Create hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel view type'
    });
  }
};

const getHotelViewTypes = async (req, res) => {
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

    const result = await HotelViewType.findWithPagination({
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
        viewTypes: result.viewTypes,
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
    console.error('Get hotel view types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel view types'
    });
  }
};

const getHotelViewType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const viewType = await HotelViewType.findById(id);

    if (!viewType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    res.json({
      success: true,
      data: { viewType }
    });
  } catch (error) {
    console.error('Get hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel view type'
    });
  }
};

const updateHotelViewType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const existingViewType = await HotelViewType.findById(id);
    if (!existingViewType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    const updateData = { name };

    // Handle icon upload
    if (req.file) {
      if (existingViewType.icon) {
        await deleteFromS3(existingViewType.icon);
      }
      updateData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-view-type');
    }

    const updated = await HotelViewType.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel view type updated successfully'
    });
  } catch (error) {
    console.error('Update hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel view type'
    });
  }
};

const deleteHotelViewType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingViewType = await HotelViewType.findById(id);
    if (!existingViewType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    if (existingViewType.icon) {
      await deleteFromS3(existingViewType.icon);
    }

    const deleted = await HotelViewType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel view type deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel view type'
    });
  }
};

const archiveHotelViewType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelViewType.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel view type archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel view type'
    });
  }
};

const restoreHotelViewType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelViewType.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel view type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel view type restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel view type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel view type'
    });
  }
};

module.exports = {
  createHotelViewType,
  getHotelViewTypes,
  getHotelViewType,
  updateHotelViewType,
  deleteHotelViewType,
  archiveHotelViewType,
  restoreHotelViewType
};