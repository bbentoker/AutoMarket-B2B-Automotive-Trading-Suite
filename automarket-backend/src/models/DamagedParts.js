const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DamagedParts = sequelize.define(
  'DamagedParts',
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
    part_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'damaged_parts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = DamagedParts;
