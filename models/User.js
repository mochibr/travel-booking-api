const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create user
  static async create(userData) {
    const { name, email, password, phone, role_id = 2, address, verification_token } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, phone, role_id, address, verification_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role_id, address, verification_token]
    );
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, name, email, phone, role_id, profile_picture, address, 
              last_login, status, created_at, updated_at, email_verified 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // Update user profile
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
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result] = await db.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  // Update last login
  static async updateLastLogin(id) {
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  }

  // Update reset token
  static async updateResetToken(email, token, expiry) {
    const [result] = await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [token, expiry, email]
    );
    return result.affectedRows > 0;
  }

  // Find by reset token
  static async findByResetToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    return rows[0];
  }

  // Clear reset token
  static async clearResetToken(id) {
    await db.execute(
      'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [id]
    );
  }

  // Find by verification token
  static async findByVerificationToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE verification_token = ?',
      [token]
    );
    return rows[0];
  }

  // Verify email
  static async verifyEmail(id) {
    const [result] = await db.execute(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = User;