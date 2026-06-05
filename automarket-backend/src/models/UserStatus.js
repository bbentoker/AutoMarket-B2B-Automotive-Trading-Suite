const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserStatus = sequelize.define(
  'UserStatus',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'user_status',
    timestamps: false,
  }
);

module.exports = UserStatus;
