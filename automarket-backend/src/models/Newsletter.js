const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Newsletter = sequelize.define(
  'Newsletter',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for non-listing related emails
      references: {
        model: 'Listings',
        key: 'id',
      },
    },
    newsletter_contact_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'newsletter_contacts',
        key: 'id',
      },
    },
    email_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'newsletter',
    },
    recipient_email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Email address of the recipient',
    },
    is_opened: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    mailgun_message_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Mailgun message ID for tracking',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'newsletters',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Newsletter;
