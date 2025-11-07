const db = require('../config/database');

class VehicleTyre {
  static async create(tyreData) {
    const { user_id, vehicle_id, expense_id, tyre_brand, tyre_model, tyre_serial_number, odometer_reading, service_date, next_service_date, notes } = tyreData;
    
    const [result] = await db.execute(
      `INSERT INTO vehicle_tyre (user_id, vehicle_id, expense_id, tyre_brand, tyre_model, tyre_serial_number, odometer_reading, service_date, next_service_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, vehicle_id, expense_id, tyre_brand, tyre_model, tyre_serial_number, odometer_reading, service_date, next_service_date, notes]
    );
    
    return result.insertId;
  }

  static async findAllWithFilters(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      vehicle_id = null,
      user_id = null,
      user_name = null,
      start_date = null,
      end_date = null,
      tyre_brand = null,
      sort_by = 'service_date',
      sort_order = 'DESC'
    } = filters;

    let query = `
      SELECT vt.*, v.make, v.model, v.registration_number, u.name as user_name, u.id as user_id
      FROM vehicle_tyre vt 
      JOIN vehicles v ON vt.vehicle_id = v.id
      LEFT JOIN users u ON vt.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      query += ` AND (
        v.make LIKE ? OR 
        v.model LIKE ? OR 
        v.registration_number LIKE ? OR 
        vt.tyre_brand LIKE ? OR
        vt.tyre_model LIKE ? OR
        vt.tyre_serial_number LIKE ? OR
        vt.notes LIKE ? OR
        u.name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Vehicle filter
    if (vehicle_id) {
      query += ' AND vt.vehicle_id = ?';
      params.push(vehicle_id);
      countParams.push(vehicle_id);
    }

    // User ID filter
    if (user_id) {
      query += ' AND vt.user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    // User name filter
    if (user_name) {
      query += ' AND u.name LIKE ?';
      const userNameTerm = `%${user_name}%`;
      params.push(userNameTerm);
      countParams.push(userNameTerm);
    }

    // Tyre brand filter
    if (tyre_brand) {
      query += ' AND vt.tyre_brand LIKE ?';
      const brandTerm = `%${tyre_brand}%`;
      params.push(brandTerm);
      countParams.push(brandTerm);
    }

    // Date range filter
    if (start_date) {
      query += ' AND vt.service_date >= ?';
      params.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      query += ' AND vt.service_date <= ?';
      params.push(end_date);
      countParams.push(end_date);
    }

    // Count total records
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM vehicle_tyre vt 
      JOIN vehicles v ON vt.vehicle_id = v.id
      LEFT JOIN users u ON vt.user_id = u.id
      WHERE 1=1
    `;

    // Apply the same filters to count query
    if (search) {
      countQuery += ` AND (
        v.make LIKE ? OR 
        v.model LIKE ? OR 
        v.registration_number LIKE ? OR 
        vt.tyre_brand LIKE ? OR
        vt.tyre_model LIKE ? OR
        vt.tyre_serial_number LIKE ? OR
        vt.notes LIKE ? OR
        u.name LIKE ?
      )`;
    }

    if (vehicle_id) {
      countQuery += ' AND vt.vehicle_id = ?';
    }

    if (user_id) {
      countQuery += ' AND vt.user_id = ?';
    }

    if (user_name) {
      countQuery += ' AND u.name LIKE ?';
    }

    if (tyre_brand) {
      countQuery += ' AND vt.tyre_brand LIKE ?';
    }

    if (start_date) {
      countQuery += ' AND vt.service_date >= ?';
    }

    if (end_date) {
      countQuery += ' AND vt.service_date <= ?';
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Apply sorting
    const validSortColumns = ['id', 'service_date', 'next_service_date', 'odometer_reading', 'created_at', 'user_name', 'tyre_brand'];
    const sortColumn = validSortColumns.includes(sort_by) ? 
      (sort_by === 'user_name' ? 'u.name' : 
      sort_by === 'tyre_brand' ? 'vt.tyre_brand' : `vt.${sort_by}`) : 
      'vt.service_date';
    
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    return {
      tyres: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async findByVehicleId(vehicleId, userId = null) {
    let query = `
      SELECT vt.*, v.make, v.model, v.registration_number 
      FROM vehicle_tyre vt 
      JOIN vehicles v ON vt.vehicle_id = v.id 
      WHERE vt.vehicle_id = ?
    `;
    const params = [vehicleId];
    
    if (userId) {
      query += ' AND vt.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY vt.service_date DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT vt.*, v.make, v.model, v.registration_number 
      FROM vehicle_tyre vt 
      JOIN vehicles v ON vt.vehicle_id = v.id 
      WHERE vt.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
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
      UPDATE vehicle_tyre 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      `DELETE FROM vehicle_tyre 
      WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

}

module.exports = VehicleTyre;