const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserReportOptions = sequelize.define(
  'UserReportOptions',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    suggestions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    when_to_send: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_sending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'user_report_options',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = UserReportOptions;
