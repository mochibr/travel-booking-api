const db = require('../config/database');

class Country {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM `countries`');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM `countries` WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Country;