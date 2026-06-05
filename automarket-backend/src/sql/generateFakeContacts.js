const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const NewsletterContact = require('../models/NewsletterContact');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const TOTAL_CONTACTS = 5000;

function generateContact(i) {
  return {
    name: `Contact${i}`,
    company: `Company${i}`,
    email: `contact${i}@email.com`,
    country_id: 3, // country_id
    created_at: new Date(),
    updated_at: new Date(),
  };
}

async function main() {
  await sequelize.authenticate();
  // await NewsletterContact.sync(); // Uncomment if you want Sequelize to create the table if it doesn't exist

  const values = [];
  for (let i = 1; i <= TOTAL_CONTACTS; i++) {
    values.push(generateContact(i));
  }

  // Split into batches to avoid SQL packet size issues
  const BATCH_SIZE = 500;
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE);
    await NewsletterContact.bulkCreate(batch);
    console.log(`Inserted batch ${i / BATCH_SIZE + 1}`);
  }

  await sequelize.close();
  console.log('All contacts inserted!');
}

main().catch((err) => {
  console.error('Error:', err);
});
