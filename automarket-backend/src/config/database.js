const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: process.env.DB_SSL_MODE ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  }
);

module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
