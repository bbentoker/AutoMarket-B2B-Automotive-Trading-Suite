const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WishlistOptions = sequelize.define(
  'WishlistOptions',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listing_vat_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'VAT type for the listing: "Excl. VAT" or "Incl. VAT"',
    },
    offered_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    offered_price_vat_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'VAT type for the offered price: "Excl. VAT" or "Incl. VAT"',
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'EUR',
    },
  },
  {
    tableName: 'wishlist_options',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = WishlistOptions;
