const User = require('../models/user');
const { Op } = require('sequelize');

async function start() {
  const usersListingSiteA = await User.findAll({
    where: {
      listingsitea_url: {
        [Op.ne]: null,
      },
    },
    raw: true, // This will return plain objects instead of Sequelize models
  });

  console.log(usersListingSiteA);
}

start();
