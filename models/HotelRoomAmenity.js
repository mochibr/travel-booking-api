const db = require('../config/database');

class HotelRoomAmenity {
  static async create(amenityData) {
    const { room_id, amenity_ids } = amenityData;
    
    // Validate input
    if (!room_id || !amenity_ids || !Array.isArray(amenity_ids) || amenity_ids.length === 0) {
      throw new Error('room_id and amenity_ids array are required');
    }

    const connection = await db.getConnection();
    
    try {
      // Start transaction using connection.query instead of execute
      await connection.query('START TRANSACTION');

      const insertQuery = `INSERT INTO hotel_room_amenity (room_id, amenity_id) VALUES ?`;
      const values = amenity_ids.map(amenity_id => [room_id, amenity_id]);
      
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

  static async update(roomId, amenityIds) {
    // Validate input
    if (!roomId || !amenityIds || !Array.isArray(amenityIds)) {
      throw new Error('room_id and amenity_ids array are required');
    }

    const connection = await db.getConnection();
    
    try {
      // Start transaction
      await connection.query('START TRANSACTION');

      // First, delete all existing amenities for this room
      await connection.query('DELETE FROM hotel_room_amenity WHERE room_id = ?', [roomId]);

      // If amenityIds array is not empty, insert the new amenities
      if (amenityIds.length > 0) {
        const insertQuery = `INSERT INTO hotel_room_amenity (room_id, amenity_id) VALUES ?`;
        const values = amenityIds.map(amenityId => [roomId, amenityId]);
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
      room_id = null,
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'hra.id',
      sort_order = 'DESC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];

    // Add room_id condition if provided
    if (room_id) {
      whereConditions.push('hra.room_id = ?');
      queryParams.push(room_id);
    }

    // Add search condition if provided
    if (search) {
      whereConditions.push('(ha.name LIKE ? OR hr.room_number LIKE ? OR hr.title LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hra.id', 'ha.name', 'hra.created_at', 'hra.updated_at', 'hra.room_id', 'hr.room_number', 'hr.title'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hra.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query with pagination
    const query = `
      SELECT 
        hra.id,
        hra.room_id,
        hra.amenity_id,
        hra.created_at,
        hra.updated_at,
        ha.name,
        ha.icon,
        hr.room_number,
        hr.title as room_title
      FROM hotel_room_amenity hra 
      JOIN hotel_amenity ha ON hra.amenity_id = ha.id 
      JOIN hotel_room hr ON hra.room_id = hr.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_room_amenity hra 
      JOIN hotel_amenity ha ON hra.amenity_id = ha.id 
      JOIN hotel_room hr ON hra.room_id = hr.id
      ${whereClause}
    `;

    try {
      // Execute both queries
      const [amenities] = await db.execute(query, [...queryParams, parseInt(limit), offset]);
      const [countResult] = await db.execute(countQuery, queryParams);

      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        amenities,
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
      throw new Error(`Failed to fetch room amenities: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hra.id,
          hra.room_id,
          hra.amenity_id,
          hra.created_at,
          hra.updated_at,
          ha.name,
          ha.icon,
          hr.room_number,
          hr.title as room_title,
        FROM hotel_room_amenity hra 
        JOIN hotel_amenity ha ON hra.amenity_id = ha.id 
        JOIN hotel_room hr ON hra.room_id = hr.id
        WHERE hra.id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to fetch room amenity: ${error.message}`);
    }
  }

  // Keep the original method for backward compatibility
  static async findByRoomId(roomId) {
    const [rows] = await db.execute(
      `SELECT 
        hra.id,
        hra.room_id,
        hra.amenity_id,
        hra.created_at,
        hra.updated_at,
        ha.name,
        ha.icon
      FROM hotel_room_amenity hra 
      JOIN hotel_amenity ha ON hra.amenity_id = ha.id 
      WHERE hra.room_id = ?`,
      [roomId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByRoomId(roomId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE room_id = ?',
      [roomId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomAmenity;