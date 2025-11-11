const db = require('../config/database');
const VehicleType = require('../models/VehicleType');
const Vehicle = require('../models/Vehicle');
const VehicleService = require('../models/VehicleService');
const VehicleTyre = require('../models/VehicleTyre');
const VehicleGallery = require('../models/VehicleGallery');
const { deleteFromS3 } = require('../utils/s3Config');

const getAllVehicleTypes = async (req, res) => {
  try {
    // Get all vehicle types without pagination, search, or filters
    const [rows] = await db.execute('SELECT * FROM vehicle_types ORDER BY name ASC');
    
    res.json({
      success: true,
      data: {
        vehicleTypes: rows
      }
    });
  } catch (error) {
    console.error('Get all vehicle types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle types'
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    // Get all vehicles without pagination, search, or filters
    const [rows] = await db.execute(`
      SELECT v.*, vt.name as vehicle_type_name 
      FROM vehicles v 
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id 
      ORDER BY v.created_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        vehicles: rows
      }
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle exists and get feature image
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Delete feature image from S3
    if (existingVehicle.feature_image) {
      await deleteFromS3(existingVehicle.feature_image);
    }

    // Delete vehicle gallery images first
    const galleryImages = await VehicleGallery.findByVehicleId(id);
    for (const image of galleryImages) {
      await deleteFromS3(image.image_url);
    }
    
    // Delete gallery images from database
    await db.execute('DELETE FROM vehicle_gallery WHERE vehicle_id = ?', [id]);
    
    // Delete related services
    await db.execute('DELETE FROM vehicle_services WHERE vehicle_id = ?', [id]);
    
    // Delete related tyre services
    await db.execute('DELETE FROM vehicle_tyre WHERE vehicle_id = ?', [id]);

    // Finally delete the vehicle
    const deleted = await Vehicle.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
};

const deleteVehicleServiceByVehicleId = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(vehicle_id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Delete all services for this vehicle
    const [result] = await db.execute(
      'DELETE FROM vehicle_services WHERE vehicle_id = ?',
      [vehicle_id]
    );

    res.json({
      success: true,
      message: `All vehicle services for vehicle ${vehicle_id} deleted successfully`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    console.error('Delete vehicle services by vehicle ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle services'
    });
  }
};

const deleteVehicleTyreServiceByVehicleId = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(vehicle_id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Delete all tyre services for this vehicle
    const [result] = await db.execute(
      'DELETE FROM vehicle_tyre WHERE vehicle_id = ?',
      [vehicle_id]
    );

    res.json({
      success: true,
      message: `All vehicle tyre services for vehicle ${vehicle_id} deleted successfully`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    console.error('Delete vehicle tyre services by vehicle ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle tyre services'
    });
  }
};

const deleteVehicleGalleryByVehicleId = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(vehicle_id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Get all gallery images for this vehicle
    const galleryImages = await VehicleGallery.findByVehicleId(vehicle_id);
    
    // Delete images from S3
    for (const image of galleryImages) {
      await deleteFromS3(image.image_url);
    }

    // Delete gallery images from database
    const [result] = await db.execute(
      'DELETE FROM vehicle_gallery WHERE vehicle_id = ?',
      [vehicle_id]
    );

    res.json({
      success: true,
      message: `All vehicle gallery images for vehicle ${vehicle_id} deleted successfully`,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    console.error('Delete vehicle gallery by vehicle ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle gallery images'
    });
  }
};

module.exports = {
  getAllVehicleTypes,
  getAllVehicles,
  deleteVehicle,
  deleteVehicleServiceByVehicleId,
  deleteVehicleTyreServiceByVehicleId,
  deleteVehicleGalleryByVehicleId
};