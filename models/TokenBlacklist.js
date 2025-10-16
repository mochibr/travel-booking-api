const { pool } = require('../config/database');

class TokenBlacklist {
    // Add token to blacklist
    static async add(token, expiresAt) {
        await pool.query(
            'INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)',
            [token, expiresAt]
        );
    }

    // Check if token is blacklisted
    static async isBlacklisted(token) {
        const [rows] = await pool.query(
            'SELECT id FROM token_blacklist WHERE token = ?',
            [token]
        );
        return rows.length > 0;
    }

    // Clean up expired tokens (can be run periodically)
    static async cleanExpired() {
        await pool.query(
            'DELETE FROM token_blacklist WHERE expires_at < NOW()'
        );
    }
}

module.exports = TokenBlacklist;

