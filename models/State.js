const db = require('../config/database');

class State {
  static async findByCountryId(countryId) {
    const [rows] = await db.execute('SELECT * FROM `states` WHERE `country_id` = ?', [countryId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM `states` WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = State;