const mysql = require('mysql2/promise');
const config = require('./env.config');
const logger = require('./logger.config');

// Create a connection pool for better performance and scalability
const pool = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    port: config.database.port,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        logger.info('Database connected successfully');
        connection.release();
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);
        throw error;
    }
};

// Graceful shutdown
const closeConnection = async () => {
    try {
        await pool.end();
        logger.info('Database connection pool closed');
    } catch (error) {
        logger.error(`Error closing database pool: ${error.message}`);
    }
};

module.exports = { pool, testConnection, closeConnection };

