const db = require('../config/database');

class HotelRoomTypeGallery {
  static async createMultiple(galleryItems) {
    if (galleryItems.length === 0) return [];
    
    const placeholders = galleryItems.map(() => '(?, ?)').join(', ');
    const values = [];
    
    galleryItems.forEach(item => {
      values.push(item.room_type_id, item.image);
    });
    
    const query = `INSERT INTO hotel_room_type_gallery (room_type_id, image) VALUES ${placeholders}`;
    
    const [result] = await db.execute(query, values);
    
    const insertedIds = [];
    for (let i = 0; i < galleryItems.length; i++) {
      insertedIds.push(result.insertId + i);
    }
    
    return insertedIds;
  }

  static async findByRoomTypeId(roomTypeId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_room_type_gallery WHERE room_type_id = ? ORDER BY created_at DESC',
      [roomTypeId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_type_gallery WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByRoomTypeId(roomTypeId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_type_gallery WHERE room_type_id = ?',
      [roomTypeId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomTypeGallery;