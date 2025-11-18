const db = require('../config/database');

class Vehicle {
  static async create(vehicleData) {
    const {
      user_id, country_id, state_id, city_id, vehicle_type_id,
      chassis_number, make, title, model, year_manufactured, color, trim, fuel_type,
      registration_number, base_location, registration_expiry_date,
      sitting_capacity, luggage_capacity, speed_limit,
      purchase_date, purchase_amount, loan_price, number_of_emi_months, emi_amount, emi_date,
      insurer, insurance_policy_number, insurance_start_date, insurance_expiry_date,
      pollution_certificate_expiry_date, fitness_expiry_date, passing_expiry_date,
      mv_tax_expiry_date, auth_date_expiry,
      odometer_reading, feature_image, notes
    } = vehicleData;
    
    const [result] = await db.execute(
      `INSERT INTO vehicles (
        user_id, country_id, state_id, city_id, vehicle_type_id,
        chassis_number, make, title, model, year_manufactured, color, trim, fuel_type,
        registration_number, base_location, registration_expiry_date,
        sitting_capacity, luggage_capacity, speed_limit,
        purchase_date, purchase_amount, loan_price, number_of_emi_months, emi_amount, emi_date,
        insurer, insurance_policy_number, insurance_start_date, insurance_expiry_date,
        pollution_certificate_expiry_date, fitness_expiry_date, passing_expiry_date,
        mv_tax_expiry_date, auth_date_expiry,
        odometer_reading, feature_image, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, country_id, state_id, city_id, vehicle_type_id,
        chassis_number, make, title, model, year_manufactured, color, trim, fuel_type,
        registration_number, base_location, registration_expiry_date,
        sitting_capacity, luggage_capacity, speed_limit,
        purchase_date, purchase_amount, loan_price, number_of_emi_months, emi_amount, emi_date,
        insurer, insurance_policy_number, insurance_start_date, insurance_expiry_date,
        pollution_certificate_expiry_date, fitness_expiry_date, passing_expiry_date,
        mv_tax_expiry_date, auth_date_expiry,
        odometer_reading, feature_image, notes
      ]
    );
    
    return result.insertId;
  }

  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT v.*, vt.name as vehicle_type_name 
      FROM vehicles v 
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id 
      WHERE v.user_id = ?
    `;
    const params = [userId];

    if (filters.vehicle_type_id) {
      query += ' AND v.vehicle_type_id = ?';
      params.push(filters.vehicle_type_id);
    }

    if (filters.make) {
      query += ' AND v.make LIKE ?';
      params.push(`%${filters.make}%`);
    }

    if (filters.registration_number) {
      query += ' AND v.registration_number LIKE ?';
      params.push(`%${filters.registration_number}%`);
    }

    query += ' ORDER BY v.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findAllWithPagination({ 
    user_id, 
    vehicle_type_id, 
    search, 
    status, 
    page, 
    limit, 
    sort_by, 
    sort_order 
  }) {
    // Calculate offset inside the method
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        v.*, 
        vt.name as vehicle_type_name,
        u.name as user_name,
        c.name as country_name,
        s.name as state_name,
        city.name as city_name
      FROM vehicles v 
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id 
      LEFT JOIN users u ON v.user_id = u.id 
      LEFT JOIN countries c ON v.country_id = c.id
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN cities city ON v.city_id = city.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total_count 
      FROM vehicles v 
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    // Add filters
    if (user_id) {
      query += ' AND v.user_id = ?';
      countQuery += ' AND v.user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    if (vehicle_type_id) {
      query += ' AND v.vehicle_type_id = ?';
      countQuery += ' AND v.vehicle_type_id = ?';
      params.push(vehicle_type_id);
      countParams.push(vehicle_type_id);
    }

    if (status) {
      query += ' AND v.status = ?';
      countQuery += ' AND v.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (v.chassis_number LIKE ? OR v.make LIKE ? OR v.title LIKE ? OR v.model LIKE ? OR v.fuel_type LIKE ? OR v.registration_number LIKE ?)';
      countQuery += ' AND (v.chassis_number LIKE ? OR v.make LIKE ? OR v.title LIKE ? OR v.model LIKE ? OR v.fuel_type LIKE ? OR v.registration_number LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const validSortColumns = ['id', 'make', 'model', 'year', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY v.${sortColumn} ${order}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      // Execute count query
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      // Execute data query
      const [rows] = await db.execute(query, params);
      
      return {
        vehicles: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findById(id) {
    let query = `
      SELECT 
        v.*, 
        vt.name as vehicle_type_name,
        u.name as user_name,
        c.name as country_name,
        s.name as state_name,
        city.name as city_name
      FROM vehicles v 
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id 
      LEFT JOIN users u ON v.user_id = u.id 
      LEFT JOIN countries c ON v.country_id = c.id
      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN cities city ON v.city_id = city.id
      WHERE v.id = ?
    `;
    const params = [id];
    
    const [rows] = await db.execute(query, params);
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
    const query = `UPDATE vehicles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM vehicles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async registrationNumberExists(registrationNumber, userId, excludeId = null) {
    let query = 'SELECT id FROM vehicles WHERE registration_number = ? AND user_id = ?';
    const params = [registrationNumber, userId];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = Vehicle;