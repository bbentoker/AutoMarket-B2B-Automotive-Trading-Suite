const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Listing = require('./Listing');

const ListingPhotos = sequelize.define(
  'ListingPhotos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Listing,
        key: 'id',
      },
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'listing_photos',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Listing.hasMany(ListingPhotos, {
  foreignKey: 'listing_id',
  as: 'photos',
});

ListingPhotos.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
});

module.exports = ListingPhotos;
