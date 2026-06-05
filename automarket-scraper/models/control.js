// MIRROR — table defined in automarket-backend/src/sql/create_tables.sql (listingsitea_controls)
// No canonical Sequelize model in backend; this is the scraper write-side model.
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Control extends Model {
    static associate(models) {
      // No associations needed
    }
  }

  Control.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Control',
      tableName: 'listingsitea_controls',
      timestamps: false,
    }
  );

  return Control;
};
