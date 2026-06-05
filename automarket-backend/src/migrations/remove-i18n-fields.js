'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create the listing_translations table
    await queryInterface.createTable('listing_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      language: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      brand_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      model: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      transmission_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      features: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. Create a unique index on listing_id and language
    await queryInterface.addIndex(
      'listing_translations',
      ['listing_id', 'language'],
      {
        unique: true,
      }
    );

    // 3. Add the new fields to the listings table
    await queryInterface.addColumn('listings', 'seller_email', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('listings', 'seller_phone_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('listings', 'co2_emissions', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // 4. Remove the i18n fields (this depends on how sequelize-i18n stored them)
    // If fields were stored as brand_name_en, brand_name_de, etc.
    const languages = ['en', 'de', 'it', 'fr', 'nl'];
    const fields = [
      'brand_name',
      'model',
      'color',
      'fuel_type',
      'transmission_type',
      'features',
    ];

    // Remove each language-specific field
    for (const field of fields) {
      for (const lang of languages) {
        try {
          await queryInterface.removeColumn('listings', `${field}_${lang}`);
        } catch (error) {
          console.log(`Column ${field}_${lang} might not exist, skipping`);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Drop the listing_translations table
    await queryInterface.dropTable('listing_translations');

    // 2. Remove the new fields from listings table
    await queryInterface.removeColumn('listings', 'seller_email');
    await queryInterface.removeColumn('listings', 'seller_phone_number');
    await queryInterface.removeColumn('listings', 'co2_emissions');

    // 3. Re-add the i18n fields (note: data will be lost)
    const languages = ['en', 'de', 'it', 'fr', 'nl'];
    const fields = [
      'brand_name',
      'model',
      'color',
      'fuel_type',
      'transmission_type',
      'features',
    ];

    // Add each language-specific field
    for (const field of fields) {
      for (const lang of languages) {
        // Define field type based on original field
        let type;
        if (field === 'features') {
          type = Sequelize.TEXT;
        } else if (field === 'model') {
          type = Sequelize.STRING(255);
        } else {
          type = Sequelize.STRING(100);
        }

        await queryInterface.addColumn('listings', `${field}_${lang}`, {
          type: type,
          allowNull: true,
        });
      }
    }
  },
};
