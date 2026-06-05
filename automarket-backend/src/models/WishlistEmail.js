const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WishlistEmail = sequelize.define(
  'WishlistEmail',
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
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    mailgun_message_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Mailgun message ID for tracking email opens',
    },
    is_opened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the email has been opened',
    },
    when_opened: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the email was opened',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the email was sent',
    },
  },
  {
    tableName: 'wishlist_emails',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_wishlist_emails_user_id',
      },
      {
        fields: ['mailgun_message_id'],
        name: 'idx_wishlist_emails_mailgun_message_id',
        unique: true,
      },
      {
        fields: ['is_opened'],
        name: 'idx_wishlist_emails_is_opened',
      },
      {
        fields: ['sent_at'],
        name: 'idx_wishlist_emails_sent_at',
      },
    ],
  }
);

module.exports = WishlistEmail;
