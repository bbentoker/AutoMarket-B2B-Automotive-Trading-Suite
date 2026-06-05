const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Offer = sequelize.define(
  'Offer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    offer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    counter_offer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    is_rejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Offer;
