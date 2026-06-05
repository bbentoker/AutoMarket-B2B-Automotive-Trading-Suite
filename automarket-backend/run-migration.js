const { Sequelize } = require('sequelize');
const migration = require('./src/migrations/add-email-tracking-fields.js');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function runMigration() {
  try {
    console.log('🚀 Starting migration: add-email-tracking-fields');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    console.log('✅ Migration completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run the migration
runMigration();
