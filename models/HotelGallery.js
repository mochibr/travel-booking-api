const db = require('../config/database');

class HotelGallery {

  static async getMaxSortOrder(hotelId) {
    const [rows] = await db.execute(
      'SELECT MAX(sort_order) as maxSortOrder FROM hotel_gallery WHERE hotel_id = ?',
      [hotelId]
    );
    return rows[0].maxSortOrder || 0;
  }

  static async createMultiple(galleryItems) {
    if (galleryItems.length === 0) return [];
    
    const placeholders = galleryItems.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const values = [];
    
    galleryItems.forEach(item => {
      values.push(
        item.user_id,
        item.hotel_id,
        item.image_url,
        item.alt_text || null,
        item.sort_order || 0
      );
    });
    
    const query = `
      INSERT INTO hotel_gallery (user_id, hotel_id, image_url, alt_text, sort_order) 
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

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_gallery WHERE hotel_id = ? ORDER BY created_at DESC;',
      [hotelId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hotel_gallery WHERE id = ?;',
      [id]
    );
    return rows;
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
        `UPDATE hotel_gallery 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
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