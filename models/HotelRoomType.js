const db = require('../config/database');

class HotelRoomType {
  static async create(roomTypeData) {
    const { hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy } = roomTypeData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_room_type (hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy, is_deleted) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy]
    );
    
    return result.insertId;
  }

  static async findAllWithPagination({ 
    hotel_id = null,
    search = '',
    page = 1,
    limit = 10,
    sort_by = 'hrt.id',
    sort_order = 'DESC',
    is_deleted = 0  // Added this parameter with default value 0
  }) {
    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];
    const countParams = [];

    // Add is_deleted condition
    if (is_deleted !== undefined && is_deleted !== null) {
      whereConditions.push('hrt.is_deleted = ?');
      queryParams.push(is_deleted);
      countParams.push(is_deleted);
    }

    // Add hotel_id condition if provided
    if (hotel_id) {
      whereConditions.push('hrt.hotel_id = ?');
      queryParams.push(hotel_id);
      countParams.push(hotel_id);
    }

    // Add search condition if provided
    if (search && search.trim() !== '') {
      whereConditions.push('(hrt.name LIKE ? OR hrt.description LIKE ? OR h.name LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hrt.id', 'hrt.name', 'hrt.created_at', 'hrt.updated_at', 'hrt.hotel_id', 'h.name', 'hrt.max_occupancy', 'bed_type_name', 'view_type_name'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hrt.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Handle table prefix for sort columns
    let sortColumnWithPrefix = safeSortBy;
    if (safeSortBy === 'bed_type_name') {
      sortColumnWithPrefix = 'hbt.name';
    } else if (safeSortBy === 'view_type_name') {
      sortColumnWithPrefix = 'hvt.name';
    } else if (safeSortBy === 'hotel_name') {
      sortColumnWithPrefix = 'h.name';
    }

    // Main query with pagination
    const query = `
      SELECT 
        hrt.*,
        hbt.name as bed_type_name,
        hvt.name as view_type_name,
        h.name as hotel_name
      FROM hotel_room_type hrt 
      LEFT JOIN hotel_bed_type hbt ON hrt.bed_type_id = hbt.id 
      LEFT JOIN hotel_view_type hvt ON hrt.view_type_id = hvt.id 
      LEFT JOIN hotel h ON hrt.hotel_id = h.id
      ${whereClause}
      ORDER BY ${sortColumnWithPrefix} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_room_type hrt 
      LEFT JOIN hotel h ON hrt.hotel_id = h.id
      ${whereClause}
    `;

    try {
      // Execute count query first
      const [countResult] = await db.execute(countQuery, countParams);
      const totalRecords = countResult[0].total;

      // If no records found, return empty result early
      if (totalRecords === 0) {
        return {
          roomTypes: [],
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
      const [roomTypes] = await db.execute(query, [...queryParams, parseInt(limit), offset]);

      const totalPages = Math.ceil(totalRecords / limit);

      return {
        roomTypes,
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
      throw new Error(`Failed to fetch hotel room types: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.execute(
      `SELECT 
        hrt.id,
        hrt.hotel_id,
        hrt.name,
          h.name AS hotel_name
        FROM hotel_room_type hrt
        LEFT JOIN hotel h ON hrt.hotel_id = h.id
        WHERE 1=1 AND hrt.is_deleted = 0
        ORDER BY hrt.id DESC`
      );
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT 
          hrt.id,
          hrt.hotel_id,
          hrt.name,
          h.name AS hotel_name
      FROM hotel_room_type hrt
      LEFT JOIN hotel h ON hrt.hotel_id = h.id
      WHERE hrt.hotel_id = ? AND hrt.is_deleted = 0
      ORDER BY hrt.id DESC`,
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT hrt.*, hbt.name as bed_type_name, hvt.name as view_type_name 
       FROM hotel_room_type hrt 
       LEFT JOIN hotel_bed_type hbt ON hrt.bed_type_id = hbt.id 
       LEFT JOIN hotel_view_type hvt ON hrt.view_type_id = hvt.id 
       WHERE hrt.id = ?`,
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
    const query = `UPDATE hotel_room_type SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async archive(id) {
    const [result] = await db.execute(
      'UPDATE hotel_room_type SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async restore(id) {
    const [result] = await db.execute(
      'UPDATE hotel_room_type SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_type WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomType;