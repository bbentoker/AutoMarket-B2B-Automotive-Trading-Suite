const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('newsletters', 'email_type', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'newsletter',
      comment: 'Type of email: newsletter, reservation, counterOffer, welcome, stage, password_reset, weekly_report, etc.',
    });

    await queryInterface.addColumn('newsletters', 'recipient_email', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      comment: 'Email address of the recipient',
    });

    await queryInterface.addColumn('newsletters', 'mailgun_message_id', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Mailgun message ID for tracking',
    });

    await queryInterface.addColumn('newsletters', 'sent_at', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the email was sent',
    });

    // Update existing records to have proper recipient_email
    await queryInterface.sequelize.query(`
      UPDATE newsletters 
      SET recipient_email = (
        SELECT email 
        FROM users 
        WHERE users.id = newsletters.newsletter_contact_id
      )
      WHERE recipient_email = ''
    `);

    // Make listing_id nullable for non-listing related emails
    await queryInterface.changeColumn('newsletters', 'listing_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Listings',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('newsletters', 'email_type');
    await queryInterface.removeColumn('newsletters', 'recipient_email');
    await queryInterface.removeColumn('newsletters', 'mailgun_message_id');
    await queryInterface.removeColumn('newsletters', 'sent_at');
    
    // Revert listing_id to not null
    await queryInterface.changeColumn('newsletters', 'listing_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Listings',
        key: 'id',
      },
    });
  }
};
