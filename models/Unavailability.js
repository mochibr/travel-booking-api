// models/Unavailability.js
const db = require('../config/database');

class Unavailability {
  static async create(unavailabilityData) {
    const { reference_id, reference_type, start_datetime, end_datetime, reason } = unavailabilityData;
    
    const [result] = await db.execute(
      `INSERT INTO unavailabilities (reference_id, reference_type, start_datetime, end_datetime, reason) 
       VALUES (?, ?, ?, ?, ?)`,
      [reference_id, reference_type, start_datetime, end_datetime, reason]
    );
    
    return result.insertId;
  }

  /*static async findAllWithFilters(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      reference_id = null,
      reference_type = null,
      start_date = null,
      end_date = null,
      sort_by = 'start_datetime',
      sort_order = 'DESC'
    } = filters;

    let query = `
      SELECT u.* 
      FROM unavailabilities u
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      query += ` AND (
        u.reason LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm);
      countParams.push(searchTerm);
    }

    // Reference ID filter
    if (reference_id) {
      query += ' AND u.reference_id = ?';
      params.push(reference_id);
      countParams.push(reference_id);
    }

    // Reference type filter
    if (reference_type) {
      query += ' AND u.reference_type = ?';
      params.push(reference_type);
      countParams.push(reference_type);
    }

    // Date range filter
    if (start_date) {
      query += ' AND u.start_datetime >= ?';
      params.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      query += ' AND u.end_datetime <= ?';
      params.push(end_date);
      countParams.push(end_date);
    }

    // Count total records
    let countQuery = `SELECT COUNT(*) as total FROM unavailabilities u WHERE 1=1`;

    if (search) {
      countQuery += ` AND u.reason LIKE ?`;
    }

    if (reference_id) {
      countQuery += ' AND u.reference_id = ?';
    }

    if (reference_type) {
      countQuery += ' AND u.reference_type = ?';
    }

    if (start_date) {
      countQuery += ' AND u.start_datetime >= ?';
    }

    if (end_date) {
      countQuery += ' AND u.end_datetime <= ?';
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Apply sorting
    const validSortColumns = ['id', 'reference_type', 'start_datetime', 'end_datetime', 'created_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'start_datetime';
    
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY u.${sortColumn} ${order}`;

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    return {
      unavailabilities: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }*/


static async findAllWithFilters(filters = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    reference_id = null,
    reference_type = null,
    start_date = null,
    end_date = null,
    sort_by = 'start_datetime',
    sort_order = 'DESC'
  } = filters;

  let query = `
    SELECT 
      u.*,
      CASE 
        WHEN u.reference_type = 'Driver' THEN d.name
        WHEN u.reference_type = 'Vehicle' THEN v.title
        WHEN u.reference_type = 'Hotel' THEN h.name
        ELSE NULL
      END as reference_name,
      CASE 
        WHEN u.reference_type = 'Driver' THEN d.id
        WHEN u.reference_type = 'Vehicle' THEN v.id
        WHEN u.reference_type = 'Hotel' THEN h.id
        ELSE NULL
      END as reference_primary_id
    FROM unavailabilities u
    LEFT JOIN drivers d ON u.reference_type = 'Driver' AND u.reference_id = d.id
    LEFT JOIN vehicles v ON u.reference_type = 'Vehicle' AND u.reference_id = v.id
    LEFT JOIN hotel h ON u.reference_type = 'Hotel' AND u.reference_id = h.id
    WHERE 1=1
  `;
  
  const params = [];
  const countParams = [];

  // Search filter
  if (search) {
    query += ` AND (
      u.reason LIKE ? OR
      d.name LIKE ? OR
      v.title LIKE ? OR
      h.name LIKE ?
    )`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Reference ID filter
  if (reference_id) {
    query += ' AND u.reference_id = ?';
    params.push(reference_id);
    countParams.push(reference_id);
  }

  // Reference type filter
  if (reference_type) {
    query += ' AND u.reference_type = ?';
    params.push(reference_type);
    countParams.push(reference_type);
  }

  // Date range filter
  if (start_date) {
    query += ' AND u.start_datetime >= ?';
    params.push(start_date);
    countParams.push(start_date);
  }

  if (end_date) {
    query += ' AND u.end_datetime <= ?';
    params.push(end_date);
    countParams.push(end_date);
  }

  // Count total records
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM unavailabilities u
    LEFT JOIN drivers d ON u.reference_type = 'Driver' AND u.reference_id = d.id
    LEFT JOIN vehicles v ON u.reference_type = 'Vehicle' AND u.reference_id = v.id
    LEFT JOIN hotel h ON u.reference_type = 'Hotel' AND u.reference_id = h.id
    WHERE 1=1
  `;

  // Apply the same filters to count query
  if (search) {
    countQuery += ` AND (
      u.reason LIKE ? OR
      d.name LIKE ? OR
      v.title LIKE ? OR
      h.name LIKE ?
    )`;
  }

  if (reference_id) {
    countQuery += ' AND u.reference_id = ?';
  }

  if (reference_type) {
    countQuery += ' AND u.reference_type = ?';
  }

  if (start_date) {
    countQuery += ' AND u.start_datetime >= ?';
  }

  if (end_date) {
    countQuery += ' AND u.end_datetime <= ?';
  }

  const [countResult] = await db.execute(countQuery, countParams);
  const total = countResult[0].total;

  // Apply sorting
  const validSortColumns = ['id', 'reference_type', 'start_datetime', 'end_datetime', 'created_at', 'reference_name'];
  let sortColumn;
  
  if (validSortColumns.includes(sort_by)) {
    if (sort_by === 'reference_name') {
      sortColumn = 'reference_name';
    } else {
      sortColumn = `u.${sort_by}`;
    }
  } else {
    sortColumn = 'u.start_datetime';
  }
  
  const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortColumn} ${order}`;

  // Apply pagination
  const offset = (page - 1) * limit;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const [rows] = await db.execute(query, params);

  return {
    unavailabilities: rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    }
  };
}   

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM unavailabilities WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByReference(reference_id, reference_type) {
    const [rows] = await db.execute(
      'SELECT * FROM unavailabilities WHERE reference_id = ? AND reference_type = ? ORDER BY start_datetime DESC',
      [reference_id, reference_type]
    );
    return rows;
  }

  static async checkOverlap(reference_id, reference_type, start_datetime, end_datetime, excludeId = null) {
    let query = `
      SELECT COUNT(*) as count 
      FROM unavailabilities 
      WHERE reference_id = ? AND reference_type = ? 
      AND (
        (start_datetime BETWEEN ? AND ?) OR
        (end_datetime BETWEEN ? AND ?) OR
        (start_datetime <= ? AND end_datetime >= ?)
      )
    `;
    
    const params = [reference_id, reference_type, start_datetime, end_datetime, start_datetime, end_datetime, start_datetime, end_datetime];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [result] = await db.execute(query, params);
    return result[0].count > 0;
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
      UPDATE unavailabilities 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM unavailabilities WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Unavailability;