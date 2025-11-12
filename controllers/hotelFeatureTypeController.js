const HotelFeatureType = require('../models/HotelFeatureType');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotelFeatureType = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const featureTypeData = {
      user_id: user_id,
      name
    };

    // Handle icon upload
    if (req.file) {
      featureTypeData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-feature-type');
    }
    
    const featureTypeId = await HotelFeatureType.create(featureTypeData);

    res.status(201).json({
      success: true,
      message: 'Hotel feature type created successfully',
      data: { featureTypeId }
    });
  } catch (error) {
    console.error('Create hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel feature type'
    });
  }
};

const getHotelFeatureTypes = async (req, res) => {
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

    const result = await HotelFeatureType.findWithPagination({
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
        featureTypes: result.featureTypes,
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
    console.error('Get hotel feature types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel feature types'
    });
  }
};

const getHotelFeatureType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const featureType = await HotelFeatureType.findById(id);

    if (!featureType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    res.json({
      success: true,
      data: { featureType }
    });
  } catch (error) {
    console.error('Get hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel feature type'
    });
  }
};

const updateHotelFeatureType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const existingFeatureType = await HotelFeatureType.findById(id);
    if (!existingFeatureType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    const updateData = { name };

    // Handle icon upload
    if (req.file) {
      if (existingFeatureType.icon) {
        await deleteFromS3(existingFeatureType.icon);
      }
      updateData.icon = await uploadToS3(req.file, 'travel/hotel/hotel-feature-type');
    }

    const updated = await HotelFeatureType.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel feature type updated successfully'
    });
  } catch (error) {
    console.error('Update hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel feature type'
    });
  }
};

const deleteHotelFeatureType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingFeatureType = await HotelFeatureType.findById(id);
    if (!existingFeatureType) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    if (existingFeatureType.icon) {
      await deleteFromS3(existingFeatureType.icon);
    }

    const deleted = await HotelFeatureType.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel feature type deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel feature type'
    });
  }
};

const archiveHotelFeatureType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const archived = await HotelFeatureType.archive(id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel feature type archived successfully'
    });
  } catch (error) {
    console.error('Archive hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive hotel feature type'
    });
  }
};

const restoreHotelFeatureType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restored = await HotelFeatureType.restore(id);
    if (!restored) {
      return res.status(404).json({
        success: false,
        error: 'Hotel feature type not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel feature type restored successfully'
    });
  } catch (error) {
    console.error('Restore hotel feature type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore hotel feature type'
    });
  }
};

module.exports = {
  createHotelFeatureType,
  getHotelFeatureTypes,
  getHotelFeatureType,
  updateHotelFeatureType,
  deleteHotelFeatureType,
  archiveHotelFeatureType,
  restoreHotelFeatureType
};