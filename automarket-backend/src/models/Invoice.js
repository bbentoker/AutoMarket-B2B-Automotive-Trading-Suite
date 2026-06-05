const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define(
  'Invoice',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when invoice was marked as paid',
    },
    invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'listings',
        key: 'id',
      },
      comment: 'Optional reference to related listing',
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Invoice;
