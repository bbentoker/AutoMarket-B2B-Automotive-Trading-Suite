const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WishlistClick = sequelize.define(
  'WishlistClick',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wishlist_option_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'wishlist_clicks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = WishlistClick;
