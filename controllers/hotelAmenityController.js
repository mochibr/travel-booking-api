const HotelAmenity = require('../models/HotelAmenity');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotelAmenity = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const amenityData = {
      user_id: user_id,
      name
    };

    // Handle icon upload
    if (req.file) {
      amenityData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-amenity');
    }
    
    const amenityId = await HotelAmenity.create(amenityData);

    res.status(201).json({
      success: true,
      message: 'Hotel amenity created successfully',
      data: { amenityId }
    });
  } catch (error) {
    console.error('Create hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel amenity'
    });
  }
};

const getHotelAmenities = async (req, res) => {
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

    const result = await HotelAmenity.findWithPagination({
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
        amenities: result.amenities,
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
    console.error('Get hotel amenities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel amenities'
    });
  }
};

const getHotelAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const amenity = await HotelAmenity.findById(id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    res.json({
      success: true,
      data: { amenity }
    });
  } catch (error) {
    console.error('Get hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel amenity'
    });
  }
};

const updateHotelAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const existingAmenity = await HotelAmenity.findById(id);
    if (!existingAmenity) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    const updateData = { name };

    // Handle icon upload
    if (req.file) {
      if (existingAmenity.icon) {
        await deleteFromS3(existingAmenity.icon);
      }
      updateData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-amenity');
    }

    const updated = await HotelAmenity.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel amenity updated successfully'
    });
  } catch (error) {
    console.error('Update hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel amenity'
    });
  }
};

const deleteHotelAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingAmenity = await HotelAmenity.findById(id);
    if (!existingAmenity) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    if (existingAmenity.icon) {
      await deleteFromS3(existingAmenity.icon);
    }

    const deleted = await HotelAmenity.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel amenity deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel amenity'
    });
  }
};

const archiveHotelAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelAmenity.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel amenity archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel amenity'
    });
  }
};

const restoreHotelAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelAmenity.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel amenity not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel amenity restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel amenity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel amenity'
    });
  }
};

module.exports = {
  createHotelAmenity,
  getHotelAmenities,
  getHotelAmenity,
  updateHotelAmenity,
  deleteHotelAmenity,
  archiveHotelAmenity,
  restoreHotelAmenity
};