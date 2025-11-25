const db = require('../config/database');

class HotelFeature {
  static async create(featureData) {
    const { hotel_id, feature_ids } = featureData;
    
    // Validate input
    if (!hotel_id || !feature_ids || !Array.isArray(feature_ids) || feature_ids.length === 0) {
      throw new Error('hotel_id and feature_ids array are required');
    }

    const connection = await db.getConnection();
    
    try {
      // Start transaction using connection.query instead of execute
      await connection.query('START TRANSACTION');

      const insertQuery = `INSERT INTO hotel_feature (hotel_id, feature_id) VALUES ?`;
      const values = feature_ids.map(feature_id => [hotel_id, feature_id]);
      
      const [result] = await connection.query(insertQuery, [values]);
      
      // Commit transaction
      await connection.query('COMMIT');
      
      return result.insertId; // Returns the first insert ID
    } catch (error) {
      // Rollback transaction on error
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  }

  static async update(hotelId, featureIds) {
    // Validate input
    if (!hotelId || !featureIds || !Array.isArray(featureIds)) {
      throw new Error('hotel_id and feature_ids array are required');
    }

    const connection = await db.getConnection();
    
    try {
      // Start transaction
      await connection.query('START TRANSACTION');

      // First, delete all existing features for this hotel
      await connection.query('DELETE FROM hotel_feature WHERE hotel_id = ?', [hotelId]);

      // If featureIds array is not empty, insert the new features
      if (featureIds.length > 0) {
        const insertQuery = `INSERT INTO hotel_feature (hotel_id, feature_id) VALUES ?`;
        const values = featureIds.map(featureId => [hotelId, featureId]);
        await connection.query(insertQuery, [values]);
      }

      // Commit transaction
      await connection.query('COMMIT');
      
      return true;
    } catch (error) {
      // Rollback transaction on error
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  }

  static async findAllWithPagination(options = {}) {
    const {
      hotel_id = null,
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'hf.id',
      sort_order = 'DESC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];

    // Add hotel_id condition if provided
    if (hotel_id) {
      whereConditions.push('hf.hotel_id = ?');
      queryParams.push(hotel_id);
    }

    // Add search condition if provided
    if (search) {
      whereConditions.push('(hft.name LIKE ? OR h.name LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hf.id', 'hft.name', 'hf.created_at', 'hf.updated_at', 'hf.hotel_id', 'h.name'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hf.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query with pagination
    const query = `
      SELECT 
        hf.id,
        hf.hotel_id,
        hf.feature_id,
        hf.created_at,
        hf.updated_at,
        hft.name,
        hft.icon,
        h.name as hotel_name
      FROM hotel_feature hf 
      JOIN hotel_feature_type hft ON hf.feature_id = hft.id 
      LEFT JOIN hotel h ON hf.hotel_id = h.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_feature hf 
      JOIN hotel_feature_type hft ON hf.feature_id = hft.id 
      LEFT JOIN hotel h ON hf.hotel_id = h.id
      ${whereClause}
    `;

    try {
      // console.log('Executing query with params:', [...queryParams, parseInt(limit), offset]);
      // console.log('Query:', query);
      
      // Execute both queries
      const [features] = await db.execute(query, [...queryParams, parseInt(limit), offset]);
      const [countResult] = await db.execute(countQuery, queryParams);

      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        features,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_records: totalRecords,
          has_next: page < totalPages,
          has_prev: page > 1,
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      console.error('Database error in findAllWithPagination:', error);
      throw new Error(`Failed to fetch hotel features: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hf.id,
          hf.hotel_id,
          hf.feature_id,
          hf.created_at,
          hf.updated_at,
          hft.name,
          hft.icon
        FROM hotel_feature hf 
        JOIN hotel_feature_type hft ON hf.feature_id = hft.id 
        WHERE hf.id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to fetch hotel feature: ${error.message}`);
    }
  }

  // Keep the original method for backward compatibility
  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT 
        hf.id,
        hf.hotel_id,
        hf.feature_id,
        hf.created_at,
        hf.updated_at,
        hft.name,
        hft.icon,
        hft.description
      FROM hotel_feature hf 
      JOIN hotel_feature_type hft ON hf.feature_id = hft.id 
      WHERE hf.hotel_id = ?`,
      [hotelId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelFeature;