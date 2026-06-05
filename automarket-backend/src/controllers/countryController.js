const Country = require('../models/Country');

const countryController = {
  // Get all countries
  getAllCountries: async (req, res) => {
    try {
      const countries = await Country.findAll({
        order: [['name', 'ASC']], // Order alphabetically by name
      });

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching countries',
        error: error.message,
      });
    }
  },
};

module.exports = countryController;
