const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_report_options', {
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
        onDelete: 'CASCADE',
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('user_report_options', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_report_options');
  },
};
