const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Country = sequelize.define(
  'Country',
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
    code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'countries',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Country;
