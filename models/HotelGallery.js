const db = require('../config/database');

class HotelGallery {
  static async createMultiple(galleryItems) {
    if (galleryItems.length === 0) return [];
    
    const placeholders = galleryItems.map(() => '(?, ?)').join(', ');
    const values = [];
    
    galleryItems.forEach(item => {
      values.push(item.hotel_id, item.image);
    });
    
    const query = `INSERT INTO hotel_gallery (hotel_id, image) VALUES ${placeholders}`;
    
    const [result] = await db.execute(query, values);
    
    const insertedIds = [];
    for (let i = 0; i < galleryItems.length; i++) {
      insertedIds.push(result.insertId + i);
    }
    
    return insertedIds;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_gallery WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_gallery WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_gallery WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelGallery;