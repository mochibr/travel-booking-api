const db = require('../config/database');

class HotelRoom {
  static async create(roomData) {
    const { room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status } = roomData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_room (room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status]
    );
    
    return result.insertId;
  }

  static async findAllWithPagination(options = {}) {
    const {
      hotel_id = null,
      room_type_id = null,
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'hr.id',
      sort_order = 'DESC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];

    // Add hotel_id condition if provided
    if (hotel_id) {
      whereConditions.push('hrt.hotel_id = ?');
      queryParams.push(hotel_id);
    }

    // Add room_type_id condition if provided
    if (room_type_id) {
      whereConditions.push('hr.room_type_id = ?');
      queryParams.push(room_type_id);
    }

    // Add search condition if provided
    if (search && search.trim() !== '') {
      whereConditions.push('(hr.room_number LIKE ? OR hr.title LIKE ? OR hrt.name LIKE ? OR h.name LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hr.id', 'hr.room_number', 'hr.title', 'hr.floor', 'hr.base_price', 'hr.status', 'hr.created_at', 'hr.updated_at', 'hrt.name', 'h.name'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hr.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query with pagination
    const query = `
      SELECT 
        hr.*,
        hrt.name as room_type_name,
        hrt.hotel_id,
        h.name as hotel_name,
        hbt.name as bed_type_name,
        hvt.name as view_type_name
      FROM hotel_room hr 
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
      JOIN hotel h ON hrt.hotel_id = h.id
      LEFT JOIN hotel_bed_type hbt ON hrt.bed_type_id = hbt.id 
      LEFT JOIN hotel_view_type hvt ON hrt.view_type_id = hvt.id 
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_room hr 
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
      JOIN hotel h ON hrt.hotel_id = h.id
      ${whereClause}
    `;

    try {
      // Execute count query first
      const [countResult] = await db.execute(countQuery, queryParams);
      const totalRecords = countResult[0].total;

      // If no records found, return empty result early
      if (totalRecords === 0) {
        return {
          rooms: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_records: 0,
            has_next: false,
            has_prev: false,
            limit: parseInt(limit)
          }
        };
      }

      // Execute main query
      const [rooms] = await db.execute(query, [...queryParams, parseInt(limit), offset]);

      const totalPages = Math.ceil(totalRecords / limit);

      return {
        rooms,
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
      throw new Error(`Failed to fetch hotel rooms: ${error.message}`);
    }
  }

  // Keep the original methods for backward compatibility
  static async findByRoomTypeId(roomTypeId) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name 
      FROM hotel_room hr 
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
      WHERE hr.room_type_id = ? 
      ORDER BY hr.room_number ASC`,
      [roomTypeId]
    );
    return rows;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name, hrt.hotel_id 
      FROM hotel_room hr 
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
      WHERE hrt.hotel_id = ? 
      ORDER BY hr.room_number ASC`,
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name, hrt.hotel_id 
       FROM hotel_room hr 
       JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
       WHERE hr.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE hotel_room SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoom;