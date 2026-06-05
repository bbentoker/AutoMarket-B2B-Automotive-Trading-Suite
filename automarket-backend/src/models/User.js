const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    zoho_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    company_name: {
      type: DataTypes.STRING(100),
    },
    phone_number: {
      type: DataTypes.STRING(100),
    },
    vat_number: {
      type: DataTypes.STRING(100),
    },
    website: {
      type: DataTypes.STRING(255),
    },
    billing_street: {
      type: DataTypes.STRING(255),
    },
    billing_city: {
      type: DataTypes.STRING(100),
    },
    billing_state: {
      type: DataTypes.STRING(100),
    },
    billing_country: {
      type: DataTypes.STRING(100),
    },
    billing_code: {
      type: DataTypes.STRING(50),
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'en',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    listingsitea_url: {
      type: DataTypes.STRING(255),
    },
    listingsitea_url_add_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
