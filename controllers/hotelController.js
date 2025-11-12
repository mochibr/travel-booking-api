const Hotel = require('../models/Hotel');
const HotelGallery = require('../models/HotelGallery');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createHotel = async (req, res) => {
  try {
    const { user_id, ...hotelData } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const hotelDataWithUser = {
      user_id: user_id,
      ...hotelData
    };

    // Handle logo image upload
    if (req.file) {
      hotelDataWithUser.logo_image = await uploadToS3(req.file, 'travel/hotel/logo-image');
    }

    const hotelId = await Hotel.create(hotelDataWithUser);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotelId }
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create hotel'
    });
  }
};

const getHotels = async (req, res) => {
  try {
    const { 
      user_id,
      hotel_type_id,
      search,
      page = 1, 
      limit = 10,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);

    const filters = {
      page: pageNum,
      limit: limitNum,
      sort_by,
      sort_order: sort_order.toUpperCase()
    };
    
    if (user_id) filters.user_id = parseInt(user_id);
    if (hotel_type_id) filters.hotel_type_id = parseInt(hotel_type_id);
    if (search && search.trim() !== '') filters.search = search.trim();

    const result = await Hotel.findAllWithPagination(filters);
    
    const totalPages = Math.ceil(result.totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: { 
        hotels: result.hotels,
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
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotels'
    });
  }
};

const getHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel'
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    if (req.file) {
      if (existingHotel.logo_image) {
        await deleteFromS3(existingHotel.logo_image);
      }
      updateData.logo_image = await uploadToS3(req.file, 'travel/hotel/logo-image');
    }

    const updated = await Hotel.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully'
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update hotel'
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    if (existingHotel.logo_image) {
      await deleteFromS3(existingHotel.logo_image);
    }

    const deleted = await Hotel.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hotel'
    });
  }
};

module.exports = {
  createHotel,
  getHotels,
  getHotel,
  updateHotel,
  deleteHotel
};