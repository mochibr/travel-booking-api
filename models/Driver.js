const db = require('../config/database');

class Driver {
  static async create(driverData) {
    const {
      user_id, name, license_number, license_expiry, contact_number,
      id_proof, driver_photo, address, emergency_contact_number,
      whatsapp_number, driving_skill, notes
    } = driverData;

    const [result] = await db.execute(
      `INSERT INTO drivers (
        user_id, name, license_number, license_expiry, contact_number,
        id_proof, driver_photo, address, emergency_contact_number,
        whatsapp_number, driving_skill, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, name, license_number, license_expiry, contact_number,
        id_proof, driver_photo, address, emergency_contact_number,
        whatsapp_number, driving_skill, notes
      ]
    );

    return result.insertId;
  }

    static async all() {
    let query = 'SELECT id, name FROM drivers';

    query += ' ORDER BY id DESC';

    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findAllWithPagination({
    user_id,
    search,
    page = 1,
    limit = 10,
    sort_by = 'id',
    sort_order = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, u.name as user_name
      FROM drivers d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total_count
      FROM drivers d
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    if (user_id) {
      query += ' AND d.user_id = ?';
      countQuery += ' AND d.user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (d.name LIKE ? OR d.license_number LIKE ? OR d.contact_number LIKE ?)';
      countQuery += ' AND (d.name LIKE ? OR d.license_number LIKE ? OR d.contact_number LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const validSortColumns = ['id', 'name', 'license_number', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY d.${sortColumn} ${order}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      const [rows] = await db.execute(query, params);
      
      return {
        drivers: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT d.*, u.name as user_name
       FROM drivers d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM drivers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
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
    const query = `UPDATE drivers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM drivers WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async licenseNumberExists(licenseNumber, userId, excludeId = null) {
    let query = 'SELECT id FROM drivers WHERE license_number = ? AND user_id = ?';
    const params = [licenseNumber, userId];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  static async checkLicenseExpiry(userId) {
    const [rows] = await db.execute(
      `SELECT id, name, license_number, license_expiry 
       FROM drivers 
       WHERE user_id = ? AND license_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY license_expiry ASC`,
      [userId]
    );
    return rows;
  }
}

module.exports = Driver;