const db = require('../config/database');

class Role {
  static async create(roleData) {
    const { name, description } = roleData;
    
    const [result] = await db.execute(
      `INSERT INTO roles (name, description) 
       VALUES (?, ?)`,
      [name, description]
    );
    
    return result.insertId;
  }

  static async findAllWithFilters(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filters;

    let query = `
      SELECT * FROM roles 
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      query += ` AND (
        name LIKE ? OR 
        description LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Count total records
    let countQuery = `SELECT COUNT(*) as total FROM roles WHERE 1=1`;

    if (search) {
      countQuery += ` AND (
        name LIKE ? OR 
        description LIKE ?
      )`;
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Apply sorting
    const validSortColumns = ['id', 'name', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    return {
      roles: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

static async findAllWithoutPagination() {
  const [rows] = await db.execute(
    'SELECT id,name FROM roles ORDER BY id DESC'
  );
  return rows;
}

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await db.execute(
      'SELECT * FROM roles WHERE name = ?',
      [name]
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
    const query = `
      UPDATE roles 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM roles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async checkIfUsed(id) {
    // Check if role is being used by any users
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id]
    );
    return result[0].count > 0;
  }
}

module.exports = Role;