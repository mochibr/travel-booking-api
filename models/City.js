const db = require('../config/database');

class City {
  static async findByStateId(stateId) {
    const [rows] = await db.execute('SELECT * FROM `cities` WHERE `state_id` = ?', [stateId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM `cities` WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = City;