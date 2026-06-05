const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResetPasswordCode = sequelize.define(
  'ResetPasswordCode',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'reset_password_codes',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = ResetPasswordCode;
