// controllers/unavailabilityController.js
const Unavailability = require('../models/Unavailability');

const createUnavailability = async (req, res) => {
  try {
    const { reference_id, reference_type, start_datetime, end_datetime, reason } = req.body;

    // Validate date range
    if (new Date(start_datetime) >= new Date(end_datetime)) {
      return res.status(400).json({
        success: false,
        error: 'End datetime must be after start datetime'
      });
    }

    // Check for overlapping unavailabilities
    const hasOverlap = await Unavailability.checkOverlap(
      reference_id, 
      reference_type, 
      start_datetime, 
      end_datetime
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        error: 'Overlapping unavailability period exists for this reference'
      });
    }

    const unavailabilityData = {
      reference_id,
      reference_type,
      start_datetime,
      end_datetime,
      reason: reason || null
    };

    const unavailabilityId = await Unavailability.create(unavailabilityData);

    res.status(201).json({
      success: true,
      message: 'Unavailability created successfully',
      data: { unavailabilityId }
    });
  } catch (error) {
    console.error('Create unavailability error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create unavailability'
    });
  }
};

const getAllUnavailabilities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      reference_id,
      reference_type,
      start_date,
      end_date,
      sort_by = 'start_datetime',
      sort_order = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);

    const filters = {
      page: pageNum,
      limit: limitNum,
      search,
      reference_id: reference_id || null,
      reference_type: reference_type || null,
      start_date: start_date || null,
      end_date: end_date || null,
      sort_by,
      sort_order
    };

    const result = await Unavailability.findAllWithFilters(filters);
    
    const totalPages = Math.ceil(result.pagination.total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        unavailabilities: result.unavailabilities,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_count: result.pagination.total,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? pageNum + 1 : null,
          prev_page: hasPrevPage ? pageNum - 1 : null,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get all unavailabilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailabilities'
    });
  }
};

const getUnavailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const unavailability = await Unavailability.findById(id);
    if (!unavailability) {
      return res.status(404).json({
        success: false,
        error: 'Unavailability not found'
      });
    }

    res.json({
      success: true,
      data: { unavailability }
    });
  } catch (error) {
    console.error('Get unavailability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailability'
    });
  }
};

const getUnavailabilityByReference = async (req, res) => {
  try {
    const { reference_id, reference_type } = req.params;
    
    const unavailabilities = await Unavailability.findByReference(reference_id, reference_type);

    res.json({
      success: true,
      data: { unavailabilities }
    });
  } catch (error) {
    console.error('Get unavailability by reference error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailabilities'
    });
  }
};

const updateUnavailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { reference_id, reference_type, start_datetime, end_datetime, reason } = req.body;
    
    // Check if unavailability exists
    const existingUnavailability = await Unavailability.findById(id);
    if (!existingUnavailability) {
      return res.status(404).json({
        success: false,
        error: 'Unavailability not found'
      });
    }

    // Validate date range
    if (start_datetime && end_datetime && new Date(start_datetime) >= new Date(end_datetime)) {
      return res.status(400).json({
        success: false,
        error: 'End datetime must be after start datetime'
      });
    }

    // Check for overlapping unavailabilities (excluding current one)
    const hasOverlap = await Unavailability.checkOverlap(
      reference_id || existingUnavailability.reference_id,
      reference_type || existingUnavailability.reference_type,
      start_datetime || existingUnavailability.start_datetime,
      end_datetime || existingUnavailability.end_datetime,
      id
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        error: 'Overlapping unavailability period exists for this reference'
      });
    }

    const updateData = {
      reference_id: reference_id || existingUnavailability.reference_id,
      reference_type: reference_type || existingUnavailability.reference_type,
      start_datetime: start_datetime || existingUnavailability.start_datetime,
      end_datetime: end_datetime || existingUnavailability.end_datetime,
      reason: reason !== undefined ? reason : existingUnavailability.reason
    };

    const updated = await Unavailability.update(id, updateData);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update unavailability'
      });
    }

    res.json({
      success: true,
      message: 'Unavailability updated successfully'
    });
  } catch (error) {
    console.error('Update unavailability error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update unavailability'
    });
  }
};

const deleteUnavailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if unavailability exists
    const unavailability = await Unavailability.findById(id);
    if (!unavailability) {
      return res.status(404).json({
        success: false,
        error: 'Unavailability not found'
      });
    }

    const deleted = await Unavailability.delete(id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete unavailability'
      });
    }

    res.json({
      success: true,
      message: 'Unavailability deleted successfully'
    });
  } catch (error) {
    console.error('Delete unavailability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete unavailability'
    });
  }
};

module.exports = {
  createUnavailability,
  getAllUnavailabilities,
  getUnavailability,
  getUnavailabilityByReference,
  updateUnavailability,
  deleteUnavailability
};