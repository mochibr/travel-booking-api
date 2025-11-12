const db = require('../config/database');

class HotelBedType {
  static async create(bedTypeData) {
    const { user_id, name, icon } = bedTypeData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_bed_type (user_id, name, icon, is_deleted) 
       VALUES (?, ?, ?, 0)`,
      [user_id, name, icon]
    );
    
    return result.insertId;
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
    let query = 'SELECT * FROM hotel_bed_type WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total_count FROM hotel_bed_type WHERE 1=1';
    const params = [];
    const countParams = [];

    if (is_deleted !== undefined && is_deleted !== null) {
      query += ' AND is_deleted = ?';
      countQuery += ' AND is_deleted = ?';
      params.push(is_deleted);
      countParams.push(is_deleted);
    }

    if (user_id) {
      query += ' AND user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND name LIKE ?';
      countQuery += ' AND name LIKE ?';
      params.push(searchTerm);
      countParams.push(searchTerm);
    }

    const validSortColumns = ['id', 'name', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    try {
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      const [rows] = await db.execute(query, params);
      
      return {
        bedTypes: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_bed_type WHERE id = ?',
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
    const query = `UPDATE hotel_bed_type SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async archive(id) {
    const [result] = await db.execute(
      'UPDATE hotel_bed_type SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async restore(id) {
    const [result] = await db.execute(
      'UPDATE hotel_bed_type SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_bed_type WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelBedType;