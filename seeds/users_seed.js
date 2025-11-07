const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    const connection = await db.getConnection();
    
    console.log('Seeding users data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await connection.execute(
      `INSERT INTO users (name, email, password, role_id, email_verified, phone) 
       VALUES (?, ?, ?, ?, TRUE, ?) 
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), password = VALUES(password), role_id = VALUES(role_id)`,
      ['Administrator', 'admin@example.com', adminPassword, 1, '+1234567890']
    );

    // Create regular user
    const userPassword = await bcrypt.hash('User123!', 12);
    await connection.execute(
      `INSERT INTO users (name, email, password, role_id, email_verified, phone, address) 
       VALUES (?, ?, ?, ?, TRUE, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), password = VALUES(password), role_id = VALUES(role_id)`,
      ['John Doe', 'user@example.com', userPassword, 2, '+1234567891', '123 Main St, City, Country']
    );

    // Create another test user
    const testPassword = await bcrypt.hash('Test123!', 12);
    await connection.execute(
      `INSERT INTO users (name, email, password, role_id, email_verified) 
       VALUES (?, ?, ?, ?, FALSE) 
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), password = VALUES(password), role_id = VALUES(role_id)`,
      ['Test User', 'test@example.com', testPassword, 2]
    );

    console.log('✅ Users seeded successfully');
    
    // Display seeded users
    const [users] = await connection.execute('SELECT id, name, email, role_id, email_verified FROM users');
    console.log('\n📊 Seeded Users:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role_id} - Verified: ${user.email_verified}`);
    });
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();