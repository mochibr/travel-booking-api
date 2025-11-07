const db = require('../config/database');

class VehicleGallery {
  static async create(galleryData) {
    const { user_id, vehicle_id, image_url, alt_text, sort_order } = galleryData;
    
    const [result] = await db.execute(
      `INSERT INTO vehicle_gallery (user_id, vehicle_id, image_url, alt_text, sort_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, vehicle_id, image_url, alt_text, sort_order || 0]
    );
    
    return result.insertId;
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
    const query = `
      UPDATE vehicle_gallery 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `;

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
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