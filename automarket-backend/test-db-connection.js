// SECURITY-SANITIZED: Hardcoded production DB credentials were removed.
// Copy .env.example to .env and configure your local database.
require('dotenv').config();

const sequelize = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);

    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('⏰ Current database time:', result[0][0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
