const db = require('../config/database');

async function createUsersTable() {
  try {
    const connection = await db.getConnection();
    
    console.log('Creating users table...');
    
    // Create users table with additional fields
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role_id INT NOT NULL DEFAULT 2,
        profile_picture VARCHAR(255),
        address TEXT,
        last_login DATETIME,
        status ENUM('active', 'inactive') DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expiry DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_reset_token (reset_token),
        INDEX idx_verification_token (verification_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Users table created successfully');
    
    // Create indexes
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_email_verified ON users(email_verified)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_role_id ON users(role_id)');
    
    connection.release();
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createUsersTable();