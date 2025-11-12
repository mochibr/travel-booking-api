const db = require('../config/database');

class HotelNearby {
  static async create(nearbyData) {
    const { hotel_id, title, description, distance, distance_unit } = nearbyData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_nearby (hotel_id, title, description, distance, distance_unit) 
       VALUES (?, ?, ?, ?, ?)`,
      [hotel_id, title, description, distance, distance_unit]
    );
    
    return result.insertId;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby WHERE id = ?',
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
    const query = `UPDATE hotel_nearby SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelNearby;