const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeeklyReportEmail = sequelize.define(
  'WeeklyReportEmail',
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
        model: 'Users',
        key: 'id',
      },
      comment: 'ID of the user who received the weekly report',
    },
    recipient_email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Email address of the recipient',
    },
    mailgun_message_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Mailgun message ID for tracking',
    },
    week_start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Start date of the week this report covers',
    },
    week_end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'End date of the week this report covers',
    },
    week_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Week number of the year (1-53)',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Year of the report',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the email was sent',
    },
    is_opened: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the email was opened',
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the email was opened',
    },
    language: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'en',
      comment: 'Language code of the email (en, nl, fr, it, de)',
    },
  },
  {
    tableName: 'weekly_report_emails',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['mailgun_message_id'],
        unique: true,
      },
      {
        fields: ['week_start_date', 'week_end_date'],
      },
      {
        fields: ['year', 'week_number'],
      },
    ],
  }
);

module.exports = WeeklyReportEmail;
