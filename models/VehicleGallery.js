const db = require('../config/database');

class VehicleGallery {

  static async getMaxSortOrder(vehicleId) {
    const [rows] = await db.execute(
      'SELECT MAX(sort_order) as maxSortOrder FROM vehicle_gallery WHERE vehicle_id = ?',
      [vehicleId]
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
        item.vehicle_id,
        item.image_url,
        item.alt_text || null,
        item.sort_order || 0
      );
    });
    
    const query = `
      INSERT INTO vehicle_gallery (user_id, vehicle_id, image_url, alt_text, sort_order) 
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

  static async findByVehicleId(vehicleId) {
    const query = `
      SELECT vg.*, v.make, v.model, v.registration_number 
      FROM vehicle_gallery vg 
      JOIN vehicles v ON vg.vehicle_id = v.id 
      WHERE vg.vehicle_id = ?
      ORDER BY vg.sort_order ASC, vg.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [vehicleId]);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT vg.*, v.make, v.model, v.registration_number 
      FROM vehicle_gallery vg 
      JOIN vehicles v ON vg.vehicle_id = v.id 
      WHERE vg.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async delete(id) {
    const [result] = await db.execute(
      `DELETE FROM vehicle_gallery 
      WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static async updateSortOrder(vehicleId, galleryItems, userId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of galleryItems) {
        await connection.execute(
          'UPDATE vehicle_gallery SET sort_order = ? WHERE id = ? AND vehicle_id = ? AND user_id = ?',
          [item.sort_order, item.id, vehicleId, userId]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = VehicleGallery;