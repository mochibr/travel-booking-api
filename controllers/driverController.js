const Driver = require('../models/Driver');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');

const createDriver = async (req, res) => {
  try {
    const { user_id, ...driverData } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if license number already exists
    const licenseExists = await Driver.licenseNumberExists(driverData.license_number, user_id);
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        error: 'License number already exists'
      });
    }

    const driverDataWithUser = {
      user_id: user_id,
      ...driverData
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.id_proof) {
        driverDataWithUser.id_proof = await uploadToS3(req.files.id_proof[0], 'travel/driver/id-proof');
      }
      if (req.files.driver_photo) {
        driverDataWithUser.driver_photo = await uploadToS3(req.files.driver_photo[0], 'travel/driver/photos');
      }
    }

    const driverId = await Driver.create(driverDataWithUser);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: { driverId }
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create driver'
    });
  }
};

const getDrivers = async (req, res) => {
  try {
    const { 
      user_id,
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
    if (search && search.trim() !== '') filters.search = search.trim();

    const result = await Driver.findAllWithPagination(filters);
    
    const totalPages = Math.ceil(result.totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: { 
        drivers: result.drivers,
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
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers'
    });
  }
};

const allDrivers = async (req, res) => {
  try {

    const drivers = await Driver.all();
    
    res.json({
      success: true,
      data: { 
        drivers,
        count: drivers.length
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers'
    });
  }
};

const getDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: { driver }
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver'
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingDriver = await Driver.findById(id);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check license number uniqueness if being updated
    if (updateData.license_number && updateData.license_number !== existingDriver.license_number) {
      const licenseExists = await Driver.licenseNumberExists(updateData.license_number, existingDriver.user_id, id);
      if (licenseExists) {
        return res.status(400).json({
          success: false,
          error: 'License number already exists'
        });
      }
    }

    // Handle file uploads - only update if new files are provided
    if (req.files) {
      if (req.files.id_proof && req.files.id_proof[0]) {
        // Delete old id proof from S3 only if it exists
        if (existingDriver.id_proof) {
          await deleteFromS3(existingDriver.id_proof);
        }
        // Upload new id proof to S3
        updateData.id_proof = await uploadToS3(req.files.id_proof[0], 'travel/driver/id-proof');
      }
      
      if (req.files.driver_photo && req.files.driver_photo[0]) {
        // Delete old driver photo from S3 only if it exists
        if (existingDriver.driver_photo) {
          await deleteFromS3(existingDriver.driver_photo);
        }
        // Upload new driver photo to S3
        updateData.driver_photo = await uploadToS3(req.files.driver_photo[0], 'travel/driver/photos');
      }
    }

    // Remove image fields from updateData if no new files were uploaded
    // This ensures existing images are preserved
    if (!req.files || !req.files.id_proof) {
      delete updateData.id_proof;
    }
    if (!req.files || !req.files.driver_photo) {
      delete updateData.driver_photo;
    }

    const updated = await Driver.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update driver'
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingDriver = await Driver.findById(id);
    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Delete files from S3
    if (existingDriver.id_proof) {
      await deleteFromS3(existingDriver.id_proof);
    }
    if (existingDriver.driver_photo) {
      await deleteFromS3(existingDriver.driver_photo);
    }

    const deleted = await Driver.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete driver'
    });
  }
};

const getLicenseExpiryAlerts = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const expiringLicenses = await Driver.checkLicenseExpiry(user_id);

    res.json({
      success: true,
      data: {
        expiringLicenses,
        count: expiringLicenses.length
      }
    });
  } catch (error) {
    console.error('Get license expiry alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch license expiry alerts'
    });
  }
};

const getDriversByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const drivers = await Driver.findByUserId(userId);

    res.json({
      success: true,
      data: {
        drivers,
        count: drivers.length
      }
    });
  } catch (error) {
    console.error('Get drivers by user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers by user'
    });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  allDrivers,
  updateDriver,
  deleteDriver,
  getLicenseExpiryAlerts,
  getDriversByUser
};