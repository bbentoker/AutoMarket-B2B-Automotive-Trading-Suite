const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ZohoToken = sequelize.define(
  'ZohoToken',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'zoho_tokens',
    timestamps: false,
  }
);

module.exports = ZohoToken;
