const db = require('../config/database');

class HotelRule {
  static async create(ruleData) {
    const { hotel_id, icon, title } = ruleData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_rule (hotel_id, icon, title) 
       VALUES (?, ?, ?)`,
      [hotel_id, icon, title]
    );
    
    return result.insertId;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_rule WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_rule WHERE id = ?',
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
    const query = `UPDATE hotel_rule SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_rule WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRule;