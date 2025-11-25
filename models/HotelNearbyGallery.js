const db = require('../config/database');

class HotelNearbyGallery {

  static async getMaxSortOrder(nearbyId) {
    const [rows] = await db.execute(
      'SELECT MAX(sort_order) as maxSortOrder FROM hotel_nearby_gallery WHERE hotel_nearby_id = ?',
      [nearbyId]
    );
    return rows[0].maxSortOrder || 0;
  }

  static async createMultiple(galleryItems) {
    if (galleryItems.length === 0) return [];
    
    const placeholders = galleryItems.map(() => '(?, ?, ?, ?)').join(', ');
    const values = [];
    
    galleryItems.forEach(item => {
      values.push(
        item.hotel_nearby_id,
        item.image_url,
        item.alt_text || null,
        item.sort_order || 0
      );
    });
    
    const query = `
      INSERT INTO hotel_nearby_gallery (hotel_nearby_id, image_url, alt_text, sort_order) 
      VALUES ${placeholders}
    `;
    
    const [result] = await db.execute(query, values);
    
    // Return array of inserted IDs
    const insertedIds = [];
    for (let i = 0; i < galleryItems.length; i++) {
      insertedIds.push(result.insertId + i);
    }
    
    return insertedIds;
  }

  static async findByNearbyId(nearbyId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby_gallery WHERE hotel_nearby_id = ? ORDER BY sort_order ASC, created_at DESC',
      [nearbyId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_nearby_gallery WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, updateData) {
    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const setClause = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(updateData), id];
    
    const [result] = await db.execute(
      `UPDATE hotel_nearby_gallery 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
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