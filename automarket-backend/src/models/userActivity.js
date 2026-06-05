const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserActivity extends Model {}

UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'web click',
    },
    contacted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'UserActivity',
    tableName: 'user_activities',
    timestamps: false,
  }
);

module.exports = UserActivity;
