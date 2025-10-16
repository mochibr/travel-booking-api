const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Create a new user
    static async create(userData) {
        const { name, email, password, phone } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone]
        );
        
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Check if email exists
    static async emailExists(email) {
        const [rows] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        return rows.length > 0;
    }
}

module.exports = User;

