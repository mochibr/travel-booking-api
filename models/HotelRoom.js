const db = require('../config/database');

class HotelRoom {
  static async create(roomData) {
    const { room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status } = roomData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_room (room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_type_id, room_number, title, floor, base_price, ep, cp, mpp, extra_ep, extra_cp, extra_mpp, status]
    );
    
    return result.insertId;
  }

  static async findByRoomTypeId(roomTypeId) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name 
       FROM hotel_room hr 
       JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
       WHERE hr.room_type_id = ? 
       ORDER BY hr.room_number ASC`,
      [roomTypeId]
    );
    return rows;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name, hrt.hotel_id 
       FROM hotel_room hr 
       JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
       WHERE hrt.hotel_id = ? 
       ORDER BY hr.room_number ASC`,
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT hr.*, hrt.name as room_type_name, hrt.hotel_id 
       FROM hotel_room hr 
       JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id 
       WHERE hr.id = ?`,
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
    const query = `UPDATE hotel_room SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoom;