const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusUpdate = sequelize.define(
  'StatusUpdate',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previous_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'status_updates',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = StatusUpdate;
