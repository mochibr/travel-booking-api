const db = require('../config/database');

class HotelNearbyGallery {
  static async createMultiple(galleryItems) {
    if (galleryItems.length === 0) return [];
    
    const placeholders = galleryItems.map(() => '(?, ?)').join(', ');
    const values = [];
    
    galleryItems.forEach(item => {
      values.push(item.hotel_nearby_id, item.image);
    });
    
    const query = `INSERT INTO hotel_nearby_gallery (hotel_nearby_id, image) VALUES ${placeholders}`;
    
    const [result] = await db.execute(query, values);
    
    const insertedIds = [];
    for (let i = 0; i < galleryItems.length; i++) {
      insertedIds.push(result.insertId + i);
    }
    
    return insertedIds;
  }

  static async findByNearbyId(nearbyId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby_gallery WHERE hotel_nearby_id = ? ORDER BY created_at DESC',
      [nearbyId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby_gallery WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByNearbyId(nearbyId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_nearby_gallery WHERE hotel_nearby_id = ?',
      [nearbyId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelNearbyGallery;