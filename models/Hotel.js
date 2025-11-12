const db = require('../config/database');

class Hotel {
  static async create(hotelData) {
    const {
      user_id, country_id, state_id, city_id, hotel_type_id,
      logo_image, name, sub_title, address, city, country,
      phone_number, email, description, latitude, longitude,
      rating, terms_and_conditions
    } = hotelData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel (
        user_id, country_id, state_id, city_id, hotel_type_id,
        logo_image, name, sub_title, address, city, country,
        phone_number, email, description, latitude, longitude,
        rating, terms_and_conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, country_id, state_id, city_id, hotel_type_id,
        logo_image, name, sub_title, address, city, country,
        phone_number, email, description, latitude, longitude,
        rating, terms_and_conditions
      ]
    );
    
    return result.insertId;
  }

  static async findAllWithPagination({ 
    user_id, 
    hotel_type_id, 
    search, 
    page, 
    limit, 
    sort_by, 
    sort_order 
  }) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT h.*, ht.name as hotel_type_name 
      FROM hotel h 
      LEFT JOIN hotel_type ht ON h.hotel_type_id = ht.id 
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total_count 
      FROM hotel h 
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    if (user_id) {
      query += ' AND h.user_id = ?';
      countQuery += ' AND h.user_id = ?';
      params.push(user_id);
      countParams.push(user_id);
    }

    if (hotel_type_id) {
      query += ' AND h.hotel_type_id = ?';
      countQuery += ' AND h.hotel_type_id = ?';
      params.push(hotel_type_id);
      countParams.push(hotel_type_id);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ' AND (h.name LIKE ? OR h.sub_title LIKE ? OR h.address LIKE ? OR h.city LIKE ? OR h.country LIKE ?)';
      countQuery += ' AND (h.name LIKE ? OR h.sub_title LIKE ? OR h.address LIKE ? OR h.city LIKE ? OR h.country LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const validSortColumns = ['id', 'name', 'rating', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const order = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY h.${sortColumn} ${order}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [countResult] = await db.execute(countQuery, countParams);
      const totalCount = countResult[0].total_count;

      const [rows] = await db.execute(query, params);
      
      return {
        hotels: rows,
        totalCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT h.*, ht.name as hotel_type_name 
       FROM hotel h 
       LEFT JOIN hotel_type ht ON h.hotel_type_id = ht.id 
       WHERE h.id = ?`,
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
    const query = `UPDATE hotel SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Hotel;