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

  // In your VehicleType model
 static async findWithPagination({ user_id, search, page, limit, sort_by, sort_order }) {
  let query = 'SELECT * FROM vehicle_types WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total_count FROM vehicle_types WHERE 1=1';
  const params = [];
  const countParams = [];

  // Add user filter if provided
  if (user_id) {
    query += ' AND user_id = ?';
    countQuery += ' AND user_id = ?';
    params.push(user_id);
    countParams.push(user_id);
  }

  // Add search filter if provided
  if (search) {
    const searchTerm = `%${search}%`;
    query += ' AND (name LIKE ? OR description LIKE ?)';
    countQuery += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  // Add sorting - allow ID sorting
  const validSortColumns = ['id', 'name', 'created_at', 'updated_at'];
  const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
  const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortColumn} ${order}`;

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

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM vehicle_types WHERE user_id = ? ORDER BY name',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM vehicle_types WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
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