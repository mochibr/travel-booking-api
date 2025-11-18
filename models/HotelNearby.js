const db = require('../config/database');

class HotelNearby {
  static async create(nearbyData) {
    const { hotel_id, title, description, distance, distance_unit } = nearbyData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_nearby (hotel_id, title, description, distance, distance_unit) 
       VALUES (?, ?, ?, ?, ?)`,
      [hotel_id, title, description, distance, distance_unit]
    );
    
    return result.insertId;
  }

  static async findWithFilters(filters) {
    let query = `
      SELECT SQL_CALC_FOUND_ROWS * 
      FROM hotel_nearby 
      WHERE 1=1
    `;
    const queryParams = [];

    // Add hotel_id filter if provided
    if (filters.hotel_id) {
      query += ` AND hotel_id = ?`;
      queryParams.push(filters.hotel_id);
    }

    // Add search filter if provided
    if (filters.search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Add sorting
    const validSortColumns = ['id', 'title', 'distance', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'created_at';
    const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(filters.limit, filters.offset);

    // Execute query
    const [rows] = await db.execute(query, queryParams);
    
    // Get total count
    const [countRows] = await db.execute('SELECT FOUND_ROWS() as total');
    const total = countRows[0].total;

    return {
      data: rows,
      total: total
    };
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby WHERE id = ?',
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
    const query = `UPDATE hotel_nearby SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelNearby;