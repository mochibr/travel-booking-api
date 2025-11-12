const db = require('../config/database');

class HotelFeature {
  static async create(featureData) {
    const { hotel_id, feature_id } = featureData;
    
    const [result] = await db.execute(
      `INSERT INTO hotel_feature (hotel_id, feature_id) 
       VALUES (?, ?)`,
      [hotel_id, feature_id]
    );
    
    return result.insertId;
  }

  static async findByHotelId(hotelId) {
    const [rows] = await db.execute(
      `SELECT hf.*, hft.name, hft.icon 
       FROM hotel_feature hf 
       JOIN hotel_feature_type hft ON hf.feature_id = hft.id 
       WHERE hf.hotel_id = ?`,
      [hotelId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelFeature;