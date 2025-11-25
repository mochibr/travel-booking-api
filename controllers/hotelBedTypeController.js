const HotelBedType = require('../models/HotelBedType');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotelBedType = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const bedTypeData = {
      user_id: user_id,
      name
    };

    // Handle icon upload
    if (req.file) {
      bedTypeData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-bed-type');
    }
    
    const bedTypeId = await HotelBedType.create(bedTypeData);

    res.status(201).json({
      success: true,
      message: 'Hotel bed type created successfully',
      data: { bedTypeId }
    });
  } catch (error) {
    console.error('Create hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel bed type'
    });
  }
};

const getAllHotelBedTypes = async (req, res) => {
  try {
    const bedTypes = await HotelBedType.findAll();
    
    res.json({
      success: true,
      data: { 
        bedTypes,
        count: bedTypes.length
      }
    });
  } catch (error) {
    console.error('Get all hotel bed types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel bed types'
    });
  }
};

const getHotelBedTypes = async (req, res) => {
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

    const result = await HotelBedType.findWithPagination({
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
        bedTypes: result.bedTypes,
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
    console.error('Get hotel bed types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel bed types'
    });
  }
};

const getHotelBedType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bedType = await HotelBedType.findById(id);

    if (!bedType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    res.json({
      success: true,
      data: { bedType }
    });
  } catch (error) {
    console.error('Get hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel bed type'
    });
  }
};

const updateHotelBedType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const existingBedType = await HotelBedType.findById(id);
    if (!existingBedType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    const updateData = { name };

    // Handle icon upload
    if (req.file) {
      if (existingBedType.icon) {
        await deleteFromS3(existingBedType.icon);
      }
      updateData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-bed-type');
    }

    const updated = await HotelBedType.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel bed type updated successfully'
    });
  } catch (error) {
    console.error('Update hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel bed type'
    });
  }
};

const deleteHotelBedType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingBedType = await HotelBedType.findById(id);
    if (!existingBedType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    if (existingBedType.icon) {
      await deleteFromS3(existingBedType.icon);
    }

    const deleted = await HotelBedType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel bed type deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel bed type'
    });
  }
};

const archiveHotelBedType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelBedType.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel bed type archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel bed type'
    });
  }
};

const restoreHotelBedType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelBedType.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel bed type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel bed type restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel bed type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel bed type'
    });
  }
};

module.exports = {
  createHotelBedType,
  getAllHotelBedTypes,
  getHotelBedTypes,
  getHotelBedType,
  updateHotelBedType,
  deleteHotelBedType,
  archiveHotelBedType,
  restoreHotelBedType
};