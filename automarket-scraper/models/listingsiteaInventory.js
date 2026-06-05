// MIRROR of automarket-backend/src/models/listingsiteaInventory.js
// Keep field definitions in sync with the canonical backend model.
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ListingSiteAInventory extends Model {
    static associate(models) {
    }
  }

  ListingSiteAInventory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      sequelize,
      modelName: 'ListingSiteAInventory',
      tableName: 'listingsitea_inventory',
      timestamps: true,
      underscored: true,
    }
  );

  return ListingSiteAInventory;
}; 