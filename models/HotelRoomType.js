const db = require('../config/database');

class HotelRoomType {
  static async create(roomTypeData) {
    const { hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy } = roomTypeData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_room_type (hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy, is_deleted) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [hotel_id, name, description, size_sq_m, bed_type_id, view_type_id, max_occupancy]
    );
    
    return result.insertId;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT hrt.*, hbt.name as bed_type_name, hvt.name as view_type_name 
       FROM hotel_room_type hrt 
       LEFT JOIN hotel_bed_type hbt ON hrt.bed_type_id = hbt.id 
       LEFT JOIN hotel_view_type hvt ON hrt.view_type_id = hvt.id 
       WHERE hrt.hotel_id = ? AND hrt.is_deleted = 0 
       ORDER BY hrt.created_at DESC`,
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT hrt.*, hbt.name as bed_type_name, hvt.name as view_type_name 
       FROM hotel_room_type hrt 
       LEFT JOIN hotel_bed_type hbt ON hrt.bed_type_id = hbt.id 
       LEFT JOIN hotel_view_type hvt ON hrt.view_type_id = hvt.id 
       WHERE hrt.id = ?`,
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
    const query = `UPDATE hotel_room_type SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async archive(id) {
    const [result] = await db.execute(
      'UPDATE hotel_room_type SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async restore(id) {
    const [result] = await db.execute(
      'UPDATE hotel_room_type SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_type WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomType;