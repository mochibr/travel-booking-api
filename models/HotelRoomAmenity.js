const db = require('../config/database');

class HotelRoomAmenity {
  static async create(roomAmenityData) {
    const { room_id, amenity_id } = roomAmenityData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_room_amenity (room_id, amenity_id) 
       VALUES (?, ?)`,
      [room_id, amenity_id]
    );
    
    return result.insertId;
  }

  static async findByRoomId(roomId) {
    const [rows] = await db.execute(
      `SELECT hra.*, ha.name, ha.icon 
       FROM hotel_room_amenity hra 
       JOIN hotel_amenity ha ON hra.amenity_id = ha.id 
       WHERE hra.room_id = ?`,
      [roomId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByRoomId(roomId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE room_id = ?',
      [roomId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomAmenity;