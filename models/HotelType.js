const db = require('../config/database');

class HotelType {
  static async create(hotelTypeData) {
    const { user_id, name } = hotelTypeData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_type (user_id, name, is_deleted) 
       VALUES (?, ?, 0)`,
      [user_id, name]
    );
    
    return result.insertId;
  }

  static async findAll({ is_deleted = 0 } = {}) {
    let query = 'SELECT id, name FROM hotel_type WHERE 1=1';
    const params = [];

    if (is_deleted !== undefined && is_deleted !== null) {
      query += ' AND is_deleted = ?';
      params.push(is_deleted);
    }

    query += ' ORDER BY name ASC';

    try {
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

 static async findWithPagination({ 
    user_id, 
    search, 
    page, 
    limit, 
    sort_by, 
    sort_order, 
    is_deleted = 0 
  }) {
    let query = `
      SELECT 
        ht.*, 
        u.name as user_name 
      FROM hotel_type ht 
      LEFT JOIN users u ON ht.user_id = u.id 
      WHERE 1=1
    `;
    
    let countQuery = 'SELECT COUNT(*) as total_count FROM hotel_type ht WHERE 1=1';
    const params = [];
    const countParams = [];

    if (is_deleted !== undefined && is_deleted !== null) {
      query += ' AND ht.is_deleted = ?';
      countQuery += ' AND ht.is_deleted = ?';
      params.push(is_deleted);
      countParams.push(is_deleted);
    }

    if (user_id) {
      query += ' AND ht.user_id = ?';
      countQuery += ' AND ht.user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND ht.name LIKE ?';
      countQuery += ' AND ht.name LIKE ?';
      params.push(searchTerm);
      countParams.push(searchTerm);
    }

    const validSortColumns = ['id', 'name', 'created_at', 'updated_at', 'user_name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    // Handle table prefix for sort columns
    let sortColumnWithPrefix = sortColumn;
    if (sortColumn === 'user_name') {
      sortColumnWithPrefix = 'u.name'; // Sort by user name from users table
    } else {
      sortColumnWithPrefix = `ht.${sortColumn}`; // Sort by hotel_type columns
    }
    
    query += ` ORDER BY ${sortColumnWithPrefix} ${order}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    try {
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      const [rows] = await db.execute(query, params);
      
      return {
        hotelTypes: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_type WHERE id = ?',
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
    const query = `UPDATE hotel_type SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async archive(id) {
    const [result] = await db.execute(
      'UPDATE hotel_type SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async restore(id) {
    const [result] = await db.execute(
      'UPDATE hotel_type SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_type WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelType;