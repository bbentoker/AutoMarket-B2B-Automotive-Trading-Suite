const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NewsletterContact = require('../models/NewsletterContact');

const tokenExpiration = '1h';

const loginAdmin = async (email, password) => {
  const user = await User.findOne({ where: { email, role_id: 1 } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return { error: 'Invalid credentials', statusCode: 401 };
  }
  const token = jwt.sign(
    { id: user.id, role: 'admin' },
    process.env.JWT_SECRET || 'change_me_use_a_long_random_string', // SECURITY-SANITIZED: original fallback was weak
    {
      expiresIn: tokenExpiration,
    }
  );
  const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in milliseconds

  return { token, expirationDate };
};

const addAdmin = async (name, email, password) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return await User.create({
    name,
    email,
    password: hashedPassword,
    role_id: 1,
  });
};

const loginDealer = async (email, password) => {
  const user = await User.findOne({ where: { email, role_id: 2 } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return { error: 'Invalid credentials', statusCode: 401 };
  }
  if (user.status_id != 2) {
    return { error: 'Account is not active', statusCode: 401 };
  }
  const token = jwt.sign(
    {
      id: user.id,
      role: 'dealer',
      name: user.name,
      language: user.language,
    },
    process.env.JWT_SECRET || 'change_me_use_a_long_random_string', // SECURITY-SANITIZED: original fallback was weak
    {
      expiresIn: tokenExpiration,
    }
  );
  return { token };
};

const registerDealer = async ({
  name,
  email,
  password,
  company_name,
  phone_number,
  vat_number,
  status_id,
  language,
  country,
}) => {
  console.log(
    name,
    email,
    password,
    company_name,
    phone_number,
    vat_number,
    status_id,
    language,
    country
  );
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create user in database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    company_name,
    phone_number,
    vat_number,
    role_id: 2,
    status_id,
    language,
    country,
  });

  // Create newsletter contact entry for the dealer
  try {
    console.log(country);
    // Use the provided country ID directly
    if (country) {
      // Check if email already exists in newsletter contacts
      const existingNewsletterContact = await NewsletterContact.findOne({
        where: { email },
      });
      console.log(existingNewsletterContact);
      if (!existingNewsletterContact) {
        await NewsletterContact.create({
          name,
          company: company_name || '',
          email,
          country_id: country,
        });

        console.log(
          `Newsletter contact created for dealer: ${email} (country_id: ${country})`
        );
      } else {
        console.log(`Newsletter contact already exists for email: ${email}`);
      }
    } else {
      console.log(
        `Newsletter contact creation skipped - no country ID provided`
      );
    }
  } catch (error) {
    console.error('Error creating newsletter contact for dealer:', error);
    // Don't throw error here - we want the user creation to succeed even if newsletter contact creation fails
  }

  return user;
};

const registerScrapedDealer = async ({
  company_name,
  first_name,
  email,
  listingsitea_url,
}) => {
  // Generate password from first name
  const password = `${first_name}123`;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create user in database with defaults
  const user = await User.create({
    name: first_name,
    email,
    password: hashedPassword,
    company_name,
    phone_number: null, // Default to null
    vat_number: null, // Default to null
    role_id: 2, // Dealer role
    status_id: 2, // Default status (approved)
    language: 'en', // Default language
    country: null, // Default to null
    listingsitea_url: listingsitea_url, // Store the ListingSiteA URL in website field
  });

  return user;
};

module.exports = {
  loginAdmin,
  addAdmin,
  loginDealer,
  registerDealer,
  registerScrapedDealer,
};
