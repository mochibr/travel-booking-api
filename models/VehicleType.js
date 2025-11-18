const db = require('../config/database');

class VehicleType {
  static async create(vehicleTypeData) {
    const { user_id, name, description } = vehicleTypeData;
    
    const [result] = await db.execute(
      `INSERT INTO vehicle_types (user_id, name, description) 
       VALUES (?, ?, ?)`,
      [user_id, name, description]
    );
    
    return result.insertId;
  }

  static async archive(id) {
    const [result] = await db.execute(
      'UPDATE vehicle_types SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async restore(id) {
    const [result] = await db.execute(
      'UPDATE vehicle_types SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findById(id, includeArchived = false) {
    let query = `
      SELECT 
        vt.*,
        u.name as user_name
      FROM vehicle_types vt 
      LEFT JOIN users u ON vt.user_id = u.id 
      WHERE vt.id = ?
    `;
    const params = [id];
    
    if (!includeArchived) {
      query += ' AND vt.is_deleted = 0';
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0 ? rows[0] : null;
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
        vt.*,
        u.name as user_name
      FROM vehicle_types vt 
      LEFT JOIN users u ON vt.user_id = u.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total_count FROM vehicle_types WHERE 1=1';
    const params = [];
    const countParams = [];

    // Handle archive filtering based on is_deleted parameter
    if (is_deleted !== undefined && is_deleted !== null) {
      query += ' AND vt.is_deleted = ?';
      countQuery += ' AND is_deleted = ?';
      params.push(is_deleted);
      countParams.push(is_deleted);
    }

    // Add user filter if provided
    if (user_id) {
      query += ' AND vt.user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    // Add search filter if provided
    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (vt.name LIKE ? OR vt.description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Add sorting - allow ID sorting
    const validSortColumns = ['id', 'name', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY vt.${sortColumn} ${order}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    try {
      // Execute count query
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      // Execute data query
      const [rows] = await db.execute(query, params);
      
      return {
        vehicleTypes: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async update(id, userId, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id, userId);
    const query = `UPDATE vehicle_types SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM vehicle_types WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async nameExists(name, userId, excludeId = null) {
    let query = 'SELECT id FROM vehicle_types WHERE name = ? AND user_id = ?';
    const params = [name, userId];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = VehicleType;