const User = require('../models/User');
const Advert = require('../models/advert');
const UserStatus = require('../models/UserStatus');
const Role = require('../models/Role');
const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const ListingPhotos = require('../models/ListingPhotos');
const DamagedParts = require('../models/DamagedParts');
const Country = require('../models/Country');
const SavedListings = require('../models/SavedListings');
const UserReportOptions = require('../models/UserReportOptions');
const UserWishlistSendingOptions = require('../models/UserWishlistSendingOptions');
const WishlistOptions = require('../models/WishlistOptions');
const WishlistClick = require('../models/WishlistClick');
const ListingSiteAInventory = require('../models/listingsiteaInventory');
const bcrypt = require('bcrypt');
const { Op, Sequelize } = require('sequelize');
const UserActivity = require('../models/userActivity');
const LoginCode = require('../models/LoginCode');

const emailService = require('../services/emailService');
const loginCodeService = require('../services/loginCodeService');
const NewsletterContact = require('../models/NewsletterContact');
const Newsletter = require('../models/Newsletter');
const WeeklyReportEmail = require('../models/WeeklyReportEmail');
const { sendNewsletterEmails } = require('../cron/sendNewsletters');
const emailRateLimiter = require('../utils/rateLimiter');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const {
  calculateReport,
  generateWeeklyReportEmailData,
  getAdjustedPrices,
} = require('../services/reportService');
const { convertSwedishTimeToUTC } = require('../utils/timezoneUtils');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY,
  url: 'https://api.eu.mailgun.net', // Use EU region
});

const userController = {
  // Get all users with role_id 2 (dealers) with pagination
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        where: { role_id: 2 }, // Only users with role_id 2
        attributes: [
          'id',
          'name',
          'company_name',
          'email',
          'role_id',
          'status_id',
          'created_at',
          'updated_at',
        ],
        order: [['created_at', 'DESC']],
      });

      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all users with scraped listings (users who have listingsitea_url and their adverts)
  getAllUsersWithScrapedListings: async (req, res) => {
    try {
      // First, fetch all users with listingsitea_url
      const users = await User.findAll({
        where: {
          role_id: 2, // Only users with role_id 2 (dealers)
          listingsitea_url: { [Op.ne]: null }, // Users who have listingsitea_url
        },
        attributes: [
          'id',
          'name',
          'company_name',
          'email',
          'role_id',
          'status_id',
          'listingsitea_url',
          'listingsitea_url_add_date',
          'created_at',
          'updated_at',
        ],
        order: [['created_at', 'DESC']],
      });
      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a user by ID
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, status_id } = req.body;

      // Find the user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has role_id 2
      if (user.role_id !== 2) {
        return res
          .status(403)
          .json({ error: 'Can only update users with role_id 2' });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({
          where: { email, id: { [require('sequelize').Op.ne]: id } },
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Email is already taken' });
        }
      }

      // Update user fields
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (status_id !== undefined) updateData.status_id = status_id;

      await user.update(updateData);

      res.status(200).json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          status_id: user.status_id,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Change user language
  changeLanguage: async (req, res) => {
    try {
      const { language } = req.body;

      // Validate required field
      if (!language) {
        return res.status(400).json({ error: 'Language is required' });
      }

      // Validate language format (2-5 characters, common language codes)
      const languageRegex = /^[a-z]{2,5}$/i;
      if (!languageRegex.test(language)) {
        return res.status(400).json({
          error:
            'Invalid language format. Use language codes like "en", "de", "fr", etc.',
        });
      }

      // Find and update the user
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the user's language
      await user.update({ language: language.toLowerCase() });

      res.status(200).json({
        message: 'Language updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all user statuses
  getAllUserStatuses: async (req, res) => {
    try {
      const userStatuses = await UserStatus.findAll({
        attributes: ['id', 'name'],
        order: [['id', 'ASC']],
      });

      res.status(200).json({
        userStatuses,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Make an offer on a listing
  makeOffer: async (req, res) => {
    try {
      const { listing_id, offer } = req.body;

      // Validate required fields
      if (!listing_id || !offer) {
        return res
          .status(400)
          .json({ error: 'listing_id and offer amount are required' });
      }

      // Validate offer amount is positive
      if (offer <= 0) {
        return res
          .status(400)
          .json({ error: 'Offer amount must be greater than zero' });
      }

      // Check if listing exists
      const listing = await Listing.findByPk(listing_id, {
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            attributes: ['id', 'url'],
            limit: 1,
            separate: true,
            order: [['id', 'ASC']],
          },
        ],
      });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if listing is deleted
      if (listing.is_deleted) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if listing status allows offers (must be 1 or 3)
      if (![1, 3].includes(listing.status_id)) {
        return res.status(400).json({
          error: 'Cannot make offer on this listing',
          current_status: listing.status_id,
        });
      }

      // Get dealer information
      const dealer = await User.findByPk(req.user.id);
      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      // Check if user already has an offer on this listing
      const existingOffer = await Offer.findOne({
        where: {
          dealer_id: req.user.id,
          listing_id: listing_id,
        },
      });

      if (existingOffer) {
        return res.status(400).json({
          error: 'You have already made an offer on this listing',
        });
      }

      // Create the offer
      const newOffer = await Offer.create({
        dealer_id: req.user.id,
        listing_id: listing_id,
        offer: offer,
        is_approved: false,
        counter_offer: null,
      });

      // Update listing status and mark as not viewed
      await listing.update({
        status_id: 3, // Offers status
        is_viewed: false,
      });

      // Send stage-based offers email to the dealer
      try {
        const emailData = {
          vendorAccountName: dealer.name,
          dealerName: dealer.name, // Add this for consistency
          brand: listing.brand_name,
          model: listing.model,
          vinNumber: listing.vin_number,
          registrationNumber: listing.registration_number,
          offerAmount: offer,
          offer_amount: offer, // Add this for consistency
          listingPrice: listing.listing_price,
        };

        await emailService.sendStageEmail(
          'Offers',
          dealer.email,
          emailData,
          dealer.language || 'en',
          listing
        );
      } catch (emailError) {
        console.error('Failed to send offers stage email:', emailError);
        // Don't fail the operation if email sending fails
      }

      res.status(201).json({
        message: 'Offer created successfully',
        data: {
          offer: newOffer,
          listing_id,
          dealer_id: req.user.id,
          offer_amount: offer,
        },
      });
    } catch (error) {
      console.error('Error in makeOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },

  reserveListing: async (req, res) => {
    try {
      const { listing_id } = req.body;

      if (!listing_id) {
        return res.status(400).json({ error: 'listing_id is required' });
      }

      // Find the listing
      const listing = await Listing.findOne({
        where: {
          id: listing_id,
          is_deleted: false,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            attributes: ['url'],
            limit: 1,
            separate: true,
            order: [['id', 'ASC']],
          },
        ],
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if listing status is valid for reservation (must be 1 or 3)
      if (![1, 3].includes(listing.status_id)) {
        return res.status(400).json({
          error: 'Listing cannot be reserved. Invalid status.',
          current_status: listing.status_id,
        });
      }

      // Get dealer information
      const dealer = await User.findByPk(req.user.id);
      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      // Check if listing is already assigned to another dealer
      if (listing.assigned_to_id && listing.assigned_to_id !== req.user.id) {
        return res.status(400).json({
          error: 'Listing is already reserved by another dealer',
        });
      }

      // Update listing status and assigned_to
      await listing.update({
        status_id: 2, // Reserved status
        assigned_to_id: req.user.id,
        is_viewed: false,
      });

      // Send stage-based reservation email to the dealer
      try {
        const emailData = {
          vendorAccountName: dealer.name,
          dealerName: dealer.name, // Add this for consistency
          brand: listing.brand_name,
          model: listing.model,
          vinNumber: listing.vin_number,
          registrationNumber: listing.registration_number,
          listingPrice: listing.listing_price,
          currency: listing.currency,
        };

        await emailService.sendStageEmail(
          'Reserved',
          dealer.email,
          emailData,
          dealer.language || 'en',
          listing
        );
      } catch (emailError) {
        console.error('Failed to send reservation stage email:', emailError);
        // Don't fail the reservation if email sending fails
      }

      res.status(200).json({
        message: 'Listing reserved successfully',
        data: {
          listing_id,
          dealer_id: req.user.id,
          status_id: listing.status_id,
        },
      });
    } catch (error) {
      console.error('Error in reserveListing:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Extract data logic for reuse in other controllers
  getFilteredListingsData: async (req) => {
    const {
      brand,
      model,
      year,
      mileage,
      price,
      power,
      plateNumber,
      bodyType,
      fuelType,
      transmission,
      driveType,
      seats,
      color,
      referenceNumber,
    } = req.query;
    // Build the where clause
    const whereClause = {
      // Only show listings with status_id 1 or 3
      status_id: {
        [Op.in]: [1, 3],
      },
      is_deleted: false,
    };

    // Filter by brand and model in their specific columns
    const brandModelConditions = [];

    if (brand) {
      brandModelConditions.push(
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('brand_name')), {
          [Op.like]: `%${brand.toLowerCase()}%`,
        })
      );
    }

    if (model) {
      brandModelConditions.push(
        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('model')), {
          [Op.like]: `%${model.toLowerCase()}%`,
        })
      );
    }

    if (brandModelConditions.length > 0) {
      whereClause[Op.and] = brandModelConditions;
    }

    // Filter by reference number if provided (case-insensitive partial match)
    if (referenceNumber) {
      whereClause.reference_no = Sequelize.where(
        Sequelize.fn('UPPER', Sequelize.col('reference_no')),
        { [Op.like]: `%${referenceNumber.toUpperCase()}%` }
      );
    }

    // Filter by year if provided
    if (year) {
      // wrong logic
      // const [minYear, maxYear] = year.split('-').map((y) => y.trim());
      // const yearCondition = Sequelize.literal(
      //   `EXTRACT(YEAR FROM first_registration) BETWEEN ${minYear} AND ${maxYear}`
      // );
      // if (whereClause[Op.and]) {
      //   whereClause[Op.and].push(yearCondition);
      // } else {
      //   whereClause[Op.and] = [yearCondition];
      // }
    }

    // Filter by mileage if provided
    if (mileage) {
      const [minMileage, maxMileage] = mileage
        .split('-')
        .map((m) => parseInt(m.trim()));
      const mileageCondition = {
        km_stand: {
          [Op.between]: [minMileage, maxMileage],
        },
      };

      if (whereClause[Op.and]) {
        whereClause[Op.and].push(mileageCondition);
      } else {
        whereClause[Op.and] = [mileageCondition];
      }
    }

    // Filter by price if provided
    if (price) {
      const { min, max } = JSON.parse(
        typeof price === 'string' ? price : JSON.stringify(price)
      );
      const priceCondition = Sequelize.literal(
        `CAST("listing_price" AS INTEGER) BETWEEN ${parseInt(min)} AND ${parseInt(max)}`
      );
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(priceCondition);
    }

    // Filter by power/horsepower if provided
    if (power) {
      //  problematic
      // const { min, max } = JSON.parse(
      //   typeof power === 'string' ? power : JSON.stringify(power)
      // );
      // const powerCondition = Sequelize.literal(
      //   `CAST(REGEXP_REPLACE(horsepower, '[^0-9]', '', 'g') AS INTEGER) BETWEEN ${parseInt(min)} AND ${parseInt(max)}`
      // );
      // whereClause[Op.and] = whereClause[Op.and] || [];
      // whereClause[Op.and].push(powerCondition);
    }

    // Filter by seats if provided
    if (seats) {
      const [minSeats, maxSeats] = seats
        .split('-')
        .map((s) => parseInt(s.trim()));
      const seatsCondition = Sequelize.literal(
        `CAST("seat" AS INTEGER) BETWEEN ${minSeats} AND ${maxSeats}`
      );
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(seatsCondition);
    }

    // Add string-based filters
    const stringFilters = {
      plateNumber: 'registration_number',
      bodyType: 'features',
      fuelType: 'fuel_type',
      transmission: 'transmission_type',
      driveType: 'features',
      color: 'color',
    };

    Object.entries(stringFilters).forEach(([filterKey, columnName]) => {
      const value = req.query[filterKey];
      if (value) {
        const condition = Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col(columnName)),
          { [Op.like]: `%${value.toLowerCase()}%` }
        );
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(condition);
      }
    });

    // Get paginated results
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // update listing creation for options 48 , 72 and 120 hours
    const { count, rows: listings } = await Listing.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['url'],
          limit: 1, // Only get the first photo
          separate: true, // This ensures we get exactly one photo per listing
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
      ],
      attributes: [
        'id',
        'brand_name',
        'model',
        'first_registration',
        'fuel_type',
        'transmission_type',
        'km_stand',
        'listing_price',
        'currency',
        'features',
        'status_id',
        'created_at',
        'vat_or_margin',
        [
          Sequelize.literal(`
            EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
          `),
          'remaining_hours',
        ],
      ],
    });

    // Format the remaining time for each listing and add the first photo
    const formattedListings = listings.map((listing) => {
      const remainingHours = parseFloat(
        listing.getDataValue('remaining_hours')
      );
      const hours = Math.floor(remainingHours);
      const minutes = Math.round((remainingHours - hours) * 60);
      const listingJson = listing.toJSON();

      return {
        ...listingJson,
        remaining_time: `${hours}h ${minutes}m`,
        remaining_hours: undefined, // Remove the raw remaining_hours field
        first_photo: listingJson.photos?.[0]?.url || null, // Add the first photo URL if it exists
        photos: undefined, // Remove the photos array since we only need the first one
      };
    });

    const totalPages = Math.ceil(count / limit);

    return {
      listings: formattedListings,
      pagination: {
        currentPage: page,
        totalPages,
        totalListings: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  // Get filtered listings based on brand, model, year, and mileage
  getFilteredListings: async (req, res) => {
    try {
      const data = await userController.getFilteredListingsData(req);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getFilteredListings:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single listing without photos
  getListingInfo: async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);

      if (!listingId || isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }

      const listing = await Listing.findOne({
        where: {
          id: listingId,
          is_deleted: false,
        },
        attributes: [
          'id',
          'brand_name',
          'model',
          'first_registration',
          'fuel_type',
          'transmission_type',
          'km_stand',
          'listing_price',
          'currency',
          'features',
          'status_id',
          'created_at',
          'color',
          'horsepower',
          'registration_number',
          'vin_number',
          'internal_url',
          'vat_or_margin',
          'seat',
          'reference_no',
          'previous_accidents',
          'logo_filename',
          'vat_or_margin',
          [
            Sequelize.literal(`
              EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
            `),
            'remaining_hours',
          ],
        ],
      });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if the current user has made an offer for this listing
      let userOffer = null;
      let savedListing = null;

      if (req.user && req.user.id) {
        // Check for user offer
        userOffer = await Offer.findOne({
          where: {
            dealer_id: req.user.id,
            listing_id: listingId,
          },
          attributes: [
            'id',
            'offer',
            'is_approved',
            'counter_offer',
            'created_at',
          ],
        });

        // Check if the current user has saved this listing
        savedListing = await SavedListings.findOne({
          where: {
            user_id: req.user.id,
            listing_id: listingId,
          },
        });
      }

      // Convert listing to JSON and conditionally add is_saved field
      const listingData = listing.toJSON();
      if (req.user && req.user.id) {
        listingData.is_saved = !!savedListing; // Convert to boolean
      }

      res.status(200).json({
        listing: listingData,
        offer_made: userOffer
          ? {
              amount: userOffer.offer,
              is_approved: userOffer.is_approved,
              counter_offer: userOffer.counter_offer,
              created_at: userOffer.created_at,
            }
          : null,
      });
    } catch (error) {
      console.error('Error in getListingInfo:', error);
      res.status(500).json({ error: error.message });
    }
  },
  getListingInfoBasic: async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);

      if (!listingId || isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }

      const listing = await Listing.findOne({
        where: {
          id: listingId,
          is_deleted: false,
        },
        attributes: [
          'id',
          'brand_name',
          'model',
          'first_registration',
          'fuel_type',
          'transmission_type',
          'km_stand',
          'listing_price',
          'currency',
          'features',
          'status_id',
          'created_at',
          'color',
          'horsepower',
          'registration_number',
          'vin_number',
          'internal_url',
          'vat_or_margin',
          'seat',
          'previous_accidents',
          'reference_no',
          'logo_filename',
          'belgium_price',
          'avg_selling_time',
          'listingsitea_link',
          'location',
          'vehicle_category',
          'interior_color',
          'trim_package',
          'engine',
          'service_history',
          'number_of_owners',
          [
            Sequelize.literal(`
              EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
            `),
            'remaining_hours',
          ],
        ],
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if the current user has saved this listing (only if user is authenticated)
      let savedListing = null;
      if (req.user && req.user.id) {
        savedListing = await SavedListings.findOne({
          where: {
            user_id: req.user.id,
            listing_id: listingId,
          },
        });
      }

      // Convert listing to JSON and conditionally add is_saved field
      const listingData = listing.toJSON();
      if (req.user && req.user.id) {
        listingData.is_saved = !!savedListing; // Convert to boolean
      }

      res.status(200).json({
        listing: listingData,
      });
    } catch (error) {
      console.error('Error in getListingInfoBasic:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get photos for a listing
  getListingPhotos: async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);

      if (!listingId || isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }

      const photos = await ListingPhotos.findAll({
        where: {
          listing_id: listingId,
        },
        attributes: ['id', 'url'],
        order: [['id', 'ASC']], // Order by ID to preserve original input order
      });

      res.status(200).json({
        photos,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getListingPhotosDamaged: async (req, res) => {
    // return the damaged parts photos for a listing
    try {
      const listingId = parseInt(req.params.id);

      if (!listingId || isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }
      const damagedParts = await DamagedParts.findAll({
        where: {
          listing_id: listingId,
        },
      });
      res.status(200).json({
        damagedParts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Get similar listings based on a specific listing ID
  getListingsBasedOn: async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);

      if (!listingId || isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID' });
      }

      // Get the original listing to find similar ones
      const originalListing = await Listing.findOne({
        where: {
          id: listingId,
          is_deleted: false,
        },
      });

      if (!originalListing) {
        return res.status(404).json({ error: 'Original listing not found' });
      }

      // Get paginated results
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Build where clause for similar listings
      const similarWhereClause = {
        id: { [Op.ne]: listingId }, // Exclude the original listing
        is_deleted: false,
        status_id: { [Op.in]: [1, 3] }, // Only active listings
        [Op.or]: [
          { brand_name: originalListing.brand_name }, // Same brand
          { model: originalListing.model }, // Same model
          {
            [Op.and]: [
              { fuel_type: originalListing.fuel_type }, // Same fuel type
              { transmission_type: originalListing.transmission_type }, // Same transmission
            ],
          },
        ],
      };

      // First get similar listings
      const { count: similarCount, rows: similarListings } =
        await Listing.findAndCountAll({
          where: similarWhereClause,
          limit,
          offset,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: ListingPhotos,
              as: 'photos',
              attributes: ['url'],
              limit: 1,
              separate: true,
              order: [['id', 'ASC']], // Order by ID to preserve original input order
            },
          ],
          attributes: [
            'id',
            'brand_name',
            'model',
            'first_registration',
            'fuel_type',
            'transmission_type',
            'km_stand',
            'listing_price',
            'features',
            'status_id',
            'created_at',
            [
              Sequelize.literal(`
              EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
            `),
              'remaining_hours',
            ],
          ],
        });

      let allListings = [...similarListings];
      let totalCount = similarCount;

      // If we have fewer listings than the limit, fill with general listings
      if (similarListings.length < limit) {
        const remainingSlots = limit - similarListings.length;
        const similarListingIds = similarListings.map((listing) => listing.id);

        // Build where clause for general listings (excluding similar ones and original)
        const generalWhereClause = {
          id: {
            [Op.notIn]: [...similarListingIds, listingId],
          },
          is_deleted: false,
          status_id: { [Op.in]: [1, 3] },
        };

        const { count: generalCount, rows: generalListings } =
          await Listing.findAndCountAll({
            where: generalWhereClause,
            limit: remainingSlots,
            offset: 0, // Always start from beginning for general listings
            order: [['created_at', 'DESC']],
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                attributes: ['url'],
                limit: 1,
                separate: true,
                order: [['id', 'ASC']], // Order by ID to preserve original input order
              },
            ],
            attributes: [
              'id',
              'brand_name',
              'model',
              'first_registration',
              'fuel_type',
              'transmission_type',
              'km_stand',
              'listing_price',
              'features',
              'status_id',
              'created_at',
              [
                Sequelize.literal(`
                EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
              `),
                'remaining_hours',
              ],
            ],
          });

        // Add general listings to fill the remaining slots
        allListings = [...allListings, ...generalListings];
        totalCount = similarCount + generalCount;
      }

      // Format the listings in the same way as getFilteredListings
      const formattedListings = allListings.map((listing) => {
        const remainingHours = parseFloat(
          listing.getDataValue('remaining_hours')
        );
        const hours = Math.floor(remainingHours);
        const minutes = Math.round((remainingHours - hours) * 60);
        const listingJson = listing.toJSON();

        return {
          ...listingJson,
          remaining_time: `${hours}h ${minutes}m`,
          remaining_hours: undefined,
          first_photo: listingJson.photos?.[0]?.url || null,
          photos: undefined,
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        listings: formattedListings,
        pagination: {
          currentPage: page,
          totalPages,
          totalListings: totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Error in getListingsBasedOn:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Add user activity for a listing
  addUserActivity: async (req, res) => {
    try {
      const { listing_id, user_id, type } = req.body;

      if (!listing_id || !user_id) {
        return res
          .status(400)
          .json({ error: 'listing_id and user_id are required' });
      }

      const newActivity = await UserActivity.create({
        listing_id,
        user_id,
        type,
      });

      res.status(201).json({
        message: 'User activity added successfully',
        activity: newActivity,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addNewsletterActivity: async (req, res) => {
    try {
      const { newsletter_id } = req.body;
      const newsLetter = await Newsletter.findOne({
        where: {
          id: newsletter_id,
        },
      });
      if (!newsLetter) {
        return res.status(404).json({ error: 'Newsletter not found' });
      }
      const contact = await NewsletterContact.findOne({
        where: {
          id: newsLetter.newsletter_contact_id,
        },
      });
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      const newActivity = await UserActivity.create({
        user_id: contact.id,
        type: 'car clicked from newsletter',
      });
      res.status(201).json({
        message: 'Newsletter activity added successfully',
        activity: newActivity,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  addWeeklyReportActivity: async (req, res) => {
    try {
      const {
        report_id,
        listing_id,
        activity_type = 'weekly report clicked',
      } = req.body;

      // Validate required parameters
      if (!report_id || !listing_id) {
        return res.status(400).json({
          error: 'report_id and listing_id are required',
        });
      }

      // Find the weekly report record
      const report = await WeeklyReportEmail.findOne({
        where: {
          id: report_id,
        },
      });

      if (!report) {
        return res.status(404).json({ error: 'Weekly report not found' });
      }

      // Validate listing exists and is not deleted
      const listing = await Listing.findOne({
        where: {
          id: listing_id,
          is_deleted: false,
        },
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found or deleted' });
      }

      // Create the activity record
      const newActivity = await UserActivity.create({
        type: activity_type,
        user_id: report.user_id,
        listing_id: listing_id,
        activity_date: new Date(),
      });

      console.log(
        `📊 Weekly report activity created: ${activity_type} for listing ${listing_id} by user ${report.user_id}`
      );

      res.status(201).json({
        message: 'Weekly report activity added successfully',
        activity: {
          id: newActivity.id,
          type: newActivity.type,
          user_id: newActivity.user_id,
          listing_id: newActivity.listing_id,
          activity_date: newActivity.activity_date,
          weekly_report_email_id: report_id,
        },
      });
    } catch (error) {
      console.error('Error adding weekly report activity:', error);
      res.status(500).json({ error: error.message });
    }
  },
  getAllUserActivities: async (req, res) => {
    try {
      // Get web click activities with User information
      const webClickActivities = await UserActivity.findAll({
        where: {
          type: 'web click',
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
            required: false, // Make user optional
          },
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'brand_name',
              'model',
              'registration_number',
              'listing_price',
            ],
            where: {
              is_deleted: false,
            },
            required: false, // Make listing optional
          },
        ],
        order: [['activity_date', 'DESC']], // Order by activity_date, latest first
      });

      // Get email opened activities from WeeklyReportEmail model
      const emailOpenedActivities = await WeeklyReportEmail.findAll({
        where: {
          is_opened: true,
        },
        raw: true,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'company_name'],
            raw: true,
            required: false, // Make user optional
          },
        ],
        order: [['opened_at', 'DESC']], // Order by opened_at, latest first
      });

      // Get weekly report click activities
      const weeklyReportClickActivities = await UserActivity.findAll({
        where: {
          type: 'weekly report clicked',
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'company_name'],
            required: false, // Make user optional
          },
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'brand_name',
              'model',
              'registration_number',
              'listing_price',
            ],
            where: {
              is_deleted: false,
            },
            required: false, // Make listing optional
          },
        ],
        order: [['activity_date', 'DESC']], // Order by activity_date, latest first
      });

      // Get weekly report email opened activities from UserActivity table (these have listing info)
      const weeklyReportEmailOpenedFromUserActivity =
        await UserActivity.findAll({
          where: {
            type: 'weekly report email opened',
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'company_name'],
              required: false, // Make user optional
            },
            {
              model: Listing,
              as: 'listing',
              attributes: [
                'id',
                'brand_name',
                'model',
                'registration_number',
                'listing_price',
              ],
              where: {
                is_deleted: false,
              },
              required: false, // Make listing optional
            },
          ],
          order: [['activity_date', 'DESC']], // Order by activity_date, latest first
        });

      const autoMarketClicksFromNewsletterActivities = await UserActivity.findAll({
        where: {
          type: 'car clicked from newsletter',
        },
        order: [['activity_date', 'DESC']], // Order by activity_date, latest first
      });

      // Get wishlist opened activities
      const wishlistOpenedActivities = await UserActivity.findAll({
        where: {
          type: 'wishlist opened',
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'company_name'],
            required: false, // Make user optional
          },
        ],
        order: [['activity_date', 'DESC']], // Order by activity_date, latest first
      });

      // Fetch newsletter contacts separately
      const newsletterContacts = await NewsletterContact.findAll({
        attributes: ['id', 'name', 'email', 'company', 'country_id'],
      });

      // Create a map for quick lookup
      const newsletterContactMap = newsletterContacts.reduce((acc, contact) => {
        acc[contact.id] = contact;
        return acc;
      }, {});

      // Format newsletter click activities to only include query results without metadata
      const newsletterClickActivities = autoMarketClicksFromNewsletterActivities
        .filter((activity) => newsletterContactMap[activity.user_id]) // Only include those with a matching contact
        .map((activity) => ({
          id: activity.id,
          listing_id: activity.listing_id,
          user_id: activity.user_id,
          activity_date: activity.activity_date,
          type: activity.type,
          contacted: activity.contacted,
          newsletterContact: {
            id: newsletterContactMap[activity.user_id].id,
            name: newsletterContactMap[activity.user_id].name,
            email: newsletterContactMap[activity.user_id].email,
            company: newsletterContactMap[activity.user_id].company,
            country_id: newsletterContactMap[activity.user_id].country_id,
          },
        }));

      // Format web click activities
      const webClickActivitiesFormatted = [];
      webClickActivities.forEach((activity) => {
        // Only process activities that have both user and listing data
        if (activity.user && activity.listing) {
          webClickActivitiesFormatted.push({
            user: activity.user,
            userType: 'user',
            listing: activity.listing,
            type: activity.type,
            activity_date: activity.activity_date,
          });
        }
      });

      // Format email opened activities with user information
      const emailOpenedActivitiesFormatted = [];
      emailOpenedActivities.forEach((activity) => {
        // Only process activities that have user data
        if (activity['user.id']) {
          // When using raw: true with includes, user attributes are flattened with 'user.' prefix
          const user = {
            id: activity['user.id'],
            name: activity['user.name'],
            email: activity['user.email'],
            company: activity['user.company_name'],
          };

          emailOpenedActivitiesFormatted.push({
            user: user,
            userType: 'user',
            listing: null, // Email opens don't correspond to specific listings
            type: 'weekly report email opened',
            activity_date: activity.opened_at,
            weeklyReportInfo: {
              week_number: activity.week_number,
              year: activity.year,
              week_start_date: activity.week_start_date,
              week_end_date: activity.week_end_date,
              language: activity.language,
              mailgun_message_id: activity.mailgun_message_id,
            },
          });
        }
      });

      // Format weekly report click activities (these should have listing information)
      const weeklyReportClickActivitiesFormatted = [];
      weeklyReportClickActivities.forEach((activity) => {
        // Only process activities that have both user and listing data
        if (activity.user && activity.listing) {
          weeklyReportClickActivitiesFormatted.push({
            user: {
              id: activity.user.id,
              name: activity.user.name,
              email: activity.user.email,
              company: activity.user.company_name,
            },
            userType: 'user',
            listing: activity.listing, // Should contain listing info for clicks
            type: activity.type,
            activity_date: activity.activity_date,
          });
        }
      });

      // Format weekly report email opened activities from UserActivity (these have listing info)
      const weeklyReportEmailOpenedFromUserActivityFormatted = [];
      weeklyReportEmailOpenedFromUserActivity.forEach((activity) => {
        // Only process activities that have both user and listing data
        if (activity.user && activity.listing) {
          weeklyReportEmailOpenedFromUserActivityFormatted.push({
            user: {
              id: activity.user.id,
              name: activity.user.name,
              email: activity.user.email,
              company: activity.user.company_name,
            },
            userType: 'user',
            listing: activity.listing, // Contains listing info from UserActivity
            type: activity.type,
            activity_date: activity.activity_date,
          });
        }
      });

      // Format car clicks from newsletter activities with newsletter contact information
      const autoMarketClicksFromNewsletterActivitiesFormatted = [];
      autoMarketClicksFromNewsletterActivities.forEach((activity) => {
        const newsletterContact = newsletterContactMap[activity.user_id];
        // Only process activities that have newsletter contact data
        if (newsletterContact) {
          autoMarketClicksFromNewsletterActivitiesFormatted.push({
            user: {
              id: newsletterContact.id,
              name: newsletterContact.name,
              email: newsletterContact.email,
              company: newsletterContact.company,
              country_id: newsletterContact.country_id,
            },
            userType: 'newsletter',
            listing: null, // Newsletter clicks no longer relate to specific listings
            type: activity.type,
            activity_date: activity.activity_date,
          });
        }
      });

      // Format wishlist opened activities
      const wishlistOpenedActivitiesFormatted = [];
      wishlistOpenedActivities.forEach((activity) => {
        // Only process activities that have user data
        if (activity.user) {
          wishlistOpenedActivitiesFormatted.push({
            user: activity.user,
            userType: 'user',
            listing: null, // Wishlist opened activities don't correspond to specific listings
            type: activity.type,
            activity_date: activity.activity_date,
          });
        }
      });

      // Combine all activities
      const allActivities = [
        ...webClickActivitiesFormatted,
        ...emailOpenedActivitiesFormatted,
        ...weeklyReportClickActivitiesFormatted,
        ...weeklyReportEmailOpenedFromUserActivityFormatted,
        ...autoMarketClicksFromNewsletterActivitiesFormatted,
        ...wishlistOpenedActivitiesFormatted,
      ];

      // Group all activities by user in the same format
      const groupedActivities = allActivities.reduce((acc, activity) => {
        // Only process activities with valid user data
        if (activity.user && activity.user.id) {
          const userId = activity.user.id;
          const userKey = `${activity.userType}_${userId}`;

          if (!acc[userKey]) {
            acc[userKey] = {
              user: activity.user,
              userType: activity.userType,
              activities: [],
            };
          }

          acc[userKey].activities.push({
            listing: activity.listing || null,
            type: activity.type,
            activity_date: activity.activity_date,
            weeklyReportInfo: activity.weeklyReportInfo || null,
          });
        }

        return acc;
      }, {});

      // Sort activities within each user group by date (latest first)
      Object.keys(groupedActivities).forEach((userKey) => {
        groupedActivities[userKey].activities.sort(
          (a, b) => new Date(b.activity_date) - new Date(a.activity_date)
        );
      });
      res.status(200).json({
        activities: groupedActivities,
        'newsletter-click': newsletterClickActivities,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add newsletter contact
  addNewsletterContact: async (req, res) => {
    try {
      const { name, company, email, country } = req.body;

      // Validate required fields
      if (!name || !company || !email || !country) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: name, company, email, country',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Check if email already exists
      const existingContact = await NewsletterContact.findOne({
        where: { email },
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered for newsletter',
        });
      }

      // Create new newsletter contact
      const newsletterContact = await NewsletterContact.create({
        name,
        company,
        email,
        country_id: country, // The country parameter contains the country ID
      });

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: newsletterContact,
      });
    } catch (error) {
      console.error('Error adding newsletter contact:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding newsletter contact',
        error: error.message,
      });
    }
  },
  removeNewsletterContact: async (req, res) => {
    try {
      const { id } = req.body;
      const newsletterContact = await NewsletterContact.findOne({
        where: { id },
      });
      if (!newsletterContact) {
        return res.status(404).json({ error: 'Newsletter contact not found' });
      }
      await newsletterContact.destroy();
      res.status(200).json({
        success: true,
        message: 'Newsletter contact removed successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getNewsletterContacts: async (req, res) => {
    try {
      const { country_ids } = req.body;

      // Support both country_ids (new) and country_id (backward compatibility)
      const countryIdsParam = country_ids;

      let whereClause = {};

      if (countryIdsParam) {
        // Support both single country_id and multiple country_ids
        let countryIdArray;
        console.log(countryIdsParam);
        if (Array.isArray(countryIdsParam)) {
          countryIdArray = countryIdsParam;
        } else if (
          typeof countryIdsParam === 'string' &&
          countryIdsParam.includes(',')
        ) {
          // Handle comma-separated string of IDs
          countryIdArray = countryIdsParam
            .split(',')
            .map((id) => parseInt(id.trim()));
        } else {
          // Single country ID
          countryIdArray = [parseInt(countryIdsParam)];
        }

        // Filter out invalid IDs
        countryIdArray = countryIdArray.filter((id) => !isNaN(id) && id > 0);

        if (countryIdArray.length === 0) {
          return res.status(400).json({
            error: 'Invalid country IDs provided',
          });
        }

        whereClause.country_id = {
          [Op.in]: countryIdArray,
        };
      }
      console.log(whereClause);

      const contacts = await NewsletterContact.findAll({
        where: whereClause,
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Format the response to include country information
      const formattedContacts = contacts.map((contact) => {
        const contactJson = contact.toJSON();
        return {
          id: contactJson.id,
          name: contactJson.name,
          company: contactJson.company,
          email: contactJson.email,
          country_id: contactJson.country_id,
          country: contactJson.country || null,
          created_at: contactJson.created_at,
          updated_at: contactJson.updated_at,
        };
      });

      res.status(200).json({
        success: true,
        contacts: formattedContacts,
        total: formattedContacts.length,
        filters: {
          country_ids: countryIdsParam
            ? Array.isArray(countryIdsParam)
              ? countryIdsParam
              : [countryIdsParam]
            : null,
        },
      });
    } catch (error) {
      console.error('Error in getNewsletterContacts:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
  // Get listings for newsletter (status_id 1 or 3)
  getNewsletterListings: async (req, res) => {
    try {
      const listings = await Listing.findAll({
        where: {
          status_id: {
            [Op.in]: [1, 3],
          },
          is_deleted: false,
        },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            attributes: ['url'],
            limit: 1,
            separate: true,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
          },
        ],
        attributes: [
          'id',
          'brand_name',
          'model',
          'first_registration',
          'fuel_type',
          'transmission_type',
          'km_stand',
          'listing_price',
          'currency',
          'features',
          'status_id',
          'created_at',
          'color',
          'horsepower',
          'registration_number',
        ],
      });

      // Format the listings with first photo
      const formattedListings = listings.map((listing) => {
        const listingJson = listing.toJSON();
        return {
          ...listingJson,
          first_photo: listingJson.photos?.[0]?.url || null,
          photos: undefined, // Remove the photos array since we only need the first one
        };
      });

      res.status(200).json({
        success: true,
        listings: formattedListings,
        total: formattedListings.length,
      });
    } catch (error) {
      console.error('Error in getNewsletterListings:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get email rate limiter status
  getEmailRateLimiterStatus: async (req, res) => {
    try {
      const status = emailRateLimiter.getStatus();
      const estimates = emailRateLimiter.getQueueEstimates();

      res.status(200).json({
        success: true,
        data: {
          ...status,
          estimates,
        },
      });
    } catch (error) {
      console.error('Error getting rate limiter status:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving rate limiter status',
        error: error.message,
      });
    }
  },

  // Send newsletters to users in specific countries
  sendNewslettersCountry: async (req, res) => {
    try {
      const { country_ids, listingIDs } = req.body;

      // Validate required fields
      if (!country_ids) {
        return res.status(400).json({
          success: false,
          message: 'country_ids is required',
        });
      }

      // Support both single country_id (backward compatibility) and multiple country_ids
      let countryIdArray;
      if (Array.isArray(country_ids)) {
        countryIdArray = country_ids;
      } else {
        // If it's a single value, convert to array for backward compatibility
        countryIdArray = [country_ids];
      }

      // Validate country_ids array
      if (countryIdArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one country ID is required',
        });
      }

      if (!listingIDs || !Array.isArray(listingIDs)) {
        return res.status(400).json({
          success: false,
          message: 'listingIDs is required and must be an array',
        });
      }

      // Generate a unique job ID for tracking
      const jobId = `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(
        `🚀 Starting newsletter job ${jobId} for countries: ${countryIdArray.join(', ')}`
      );

      // Get rate limiter status and estimates
      const rateLimiterStatus = emailRateLimiter.getStatus();
      const queueEstimates = emailRateLimiter.getQueueEstimates();

      console.log(`📊 Rate limiter status at job start:`, rateLimiterStatus);
      console.log(`⏱️  Queue estimates:`, queueEstimates);

      // Return immediate response with rate limiting information
      res.status(202).json({
        success: true,
        message:
          'Newsletter sending started in background with rate limiting (100 emails/hour)',
        jobId,
        data: {
          country_ids: countryIdArray,
          listingIDs,
          totalCountries: countryIdArray.length,
          estimatedTime: `${Math.ceil(countryIdArray.length * 2)} minutes (without rate limiting)`,
          rateLimiting: {
            maxEmailsPerHour: 100,
            emailsSentThisHour: rateLimiterStatus.emailsSentThisHour,
            queueSize: rateLimiterStatus.queueSize,
            estimatedCompletionTime: queueEstimates.estimatedCompletionTime,
            hoursRequired: queueEstimates.hoursRequired,
          },
        },
      });

      // Process countries in background (don't await this)
      processNewsletterJobInBackground(jobId, countryIdArray, listingIDs);
    } catch (error) {
      console.error('Error in sendNewslettersCountry:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing newsletter request',
        error: error.message,
      });
    }
  },
  unsubscribeNewsletter: async (req, res) => {
    try {
      const { contact_id } = req.body;
      console.log(contact_id);
      const newsletterContact = await NewsletterContact.findOne({
        where: { id: contact_id },
      });
      if (!newsletterContact) {
        return res.status(404).json({ error: 'Newsletter contact not found' });
      }
      await newsletterContact.destroy();
      res.status(200).json({
        success: true,
        message: 'Newsletter contact unsubscribed successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error unsubscribing from newsletter',
        error: error.message,
      });
    }
  },

  // Save a listing for the authenticated user
  saveListing: async (req, res) => {
    try {
      const { listing_id } = req.body;
      const user_id = req.user.id;

      // Validate required field
      if (!listing_id) {
        return res.status(400).json({
          success: false,
          message: 'listing_id is required',
        });
      }

      // Check if listing exists and is not deleted
      const listing = await Listing.findOne({
        where: {
          id: listing_id,
          is_deleted: false,
        },
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found',
        });
      }

      // Check if the listing is already saved by the user
      const existingSavedListing = await SavedListings.findOne({
        where: {
          user_id,
          listing_id,
        },
      });

      if (existingSavedListing) {
        return res.status(400).json({
          success: false,
          message: 'Listing is already saved',
        });
      }

      // Create the saved listing entry
      const savedListing = await SavedListings.create({
        user_id,
        listing_id,
      });

      res.status(201).json({
        success: true,
        message: 'Listing saved successfully',
        data: {
          id: savedListing.id,
          user_id: savedListing.user_id,
          listing_id: savedListing.listing_id,
          created_at: savedListing.created_at,
        },
      });
    } catch (error) {
      console.error('Error in saveListing:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving listing',
        error: error.message,
      });
    }
  },

  // Unsave a listing for the authenticated user
  unsaveListing: async (req, res) => {
    try {
      const { listing_id } = req.body;
      const user_id = req.user.id;

      // Validate required field
      if (!listing_id) {
        return res.status(400).json({
          success: false,
          message: 'listing_id is required',
        });
      }

      // Find the saved listing entry
      const savedListing = await SavedListings.findOne({
        where: {
          user_id,
          listing_id,
        },
      });

      if (!savedListing) {
        return res.status(404).json({
          success: false,
          message: 'Saved listing not found',
        });
      }

      // Delete the saved listing entry
      await savedListing.destroy();

      res.status(200).json({
        success: true,
        message: 'Listing unsaved successfully',
      });
    } catch (error) {
      console.error('Error in unsaveListing:', error);
      res.status(500).json({
        success: false,
        message: 'Error unsaving listing',
        error: error.message,
      });
    }
  },

  // Get user's wishlist with associated listings
  getUserWishlist: async (req, res) => {
    try {
      const { user_id } = req.body;

      // Validate required field
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required',
        });
      }

      // Verify that the user exists and get their full data (excluding password)
      const user = await User.findByPk(user_id, {
        attributes: { exclude: ['password'] },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Determine if user is Swedish based on listingsitea_url
      const isSwedish =
        user.listingsitea_url && user.listingsitea_url.includes('listingsitea.ch');

      // Get all wishlist options for the user (listing_id actually refers to advert ID)
      const wishlistOptions = await WishlistOptions.findAll({
        where: {
          user_id: user_id,
        },
        order: [['created_at', 'DESC']],
      });

      // Get all advert IDs from wishlist (listing_id actually contains advert IDs)
      const advertIds = wishlistOptions.map((option) => option.listing_id);

      // Get all wishlist option IDs to check for clicks
      const wishlistOptionIds = wishlistOptions.map((option) => option.id);

      // Check which adverts have been clicked by getting wishlist clicks
      const wishlistClicks = await WishlistClick.findAll({
        where: {
          user_id: user_id,
          listing_id: advertIds,
          wishlist_option_id: wishlistOptionIds,
        },
      });

      // Create a map of clicked adverts for quick lookup
      const clickedAdvertsMap = {};
      wishlistClicks.forEach((click) => {
        const key = `${click.listing_id}_${click.wishlist_option_id}`;
        clickedAdvertsMap[key] = true;
      });

      // Fetch corresponding Advert data for all wishlist entries
      const adverts = await Advert.findAll({
        where: {
          id: advertIds,
        },
        attributes: [
          'id',
          'listingsitea_id',
          'seller_id',
          'seller_name',
          'sell_time',
          'make',
          'model',
          'model_version',
          'first_registration',
          'location',
          'price',
          'price_currency',
          'body_type',
          'type',
          'drivetrain',
          'seats',
          'doors',
          'mileage',
          'previous_owner',
          'power',
          'gearbox',
          'engine_size',
          'fuel_type',
          'fuel_consumption',
          'co_2_emissions',
          'color',
          'paint',
          'upholstery_color',
          'upholstery',
          'description',
          'link',
          'image_url',
          'is_active',
          'last_seen',
          'created_at',
        ],
      });

      // Create a map for quick advert lookup
      const advertMap = {};
      adverts.forEach((advert) => {
        advertMap[advert.id] = advert.toJSON();
      });

      // Format the response to include wishlist options and advert data with price adjustments
      const formattedWishlist = wishlistOptions.map((option) => {
        // Check if this specific wishlist option has been clicked
        const clickKey = `${option.listing_id}_${option.id}`;
        const hasBeenClicked = !!clickedAdvertsMap[clickKey];
        // Apply similar adjustment to offered_price if it exists
        let adjustedOfferedPrice = option.offered_price;
        let offeredPriceAdjustment = null;

        if (option.offered_price && option.offered_price_vat_type) {
          const originalOfferedPrice = parseFloat(option.offered_price);
          let adjustedOffered = originalOfferedPrice;

          if (option.offered_price_vat_type === 'Excl. VAT') {
            const vatRate = isSwedish ? 1.081 : 1.21;
            adjustedOffered = originalOfferedPrice * vatRate;
          }

          adjustedOfferedPrice = Math.round(adjustedOffered * 100) / 100;
          offeredPriceAdjustment = {
            original_offered_price: originalOfferedPrice,
            adjusted_offered_price: adjustedOfferedPrice,
            adjustment_applied: option.offered_price_vat_type === 'Excl. VAT',
            vat_rate_used:
              option.offered_price_vat_type === 'Excl. VAT'
                ? isSwedish
                  ? '8.1%'
                  : '21%'
                : 'N/A',
          };
        }

        // Get corresponding advert data and apply VAT adjustments
        const advert = advertMap[option.listing_id] || null;
        let adjustedAdvert = null;

        if (advert && advert.price) {
          adjustedAdvert = { ...advert };
          const originalAdvertPrice = parseFloat(advert.price);
          let adjustedAdvertPrice = originalAdvertPrice;

          // Adverts are always "Incl. VAT" by default (scraped listings)
          // Apply adjustment based on the offered_price_vat_type (exactly like reportService.getAdjustedPrices)
          if (option.offered_price_vat_type === 'Excl. VAT') {
            // Use different VAT rates: 8.1% for Swedish users, 21% for others
            const vatRate = isSwedish ? 1.081 : 1.21;
            // Convert scraped listing from Incl. VAT to Excl. VAT for comparison
            adjustedAdvertPrice = originalAdvertPrice / vatRate;
          }
          // If option.offered_price_vat_type is 'Incl. VAT', no adjustment needed as adverts are already Incl. VAT

          // Add adjusted price information to the advert
          adjustedAdvert.original_price = originalAdvertPrice;
          adjustedAdvert.adjusted_price =
            Math.round(adjustedAdvertPrice * 100) / 100;
          adjustedAdvert.price_adjustment_applied =
            adjustedAdvertPrice !== originalAdvertPrice;
          adjustedAdvert.adjustment_reason =
            adjustedAdvertPrice !== originalAdvertPrice
              ? `Converted to match offered price VAT type: ${option.offered_price_vat_type}`
              : 'No adjustment needed';
          adjustedAdvert.vat_rate_used =
            adjustedAdvertPrice !== originalAdvertPrice
              ? isSwedish
                ? '8.1%'
                : '21%'
              : 'N/A';
          adjustedAdvert.user_location = isSwedish ? 'Swedish' : 'Non-Swedish';
        }

        return {
          wishlist_option: {
            id: option.id,
            user_id: option.user_id,
            listing_id: option.listing_id,
            listing_vat_type: option.listing_vat_type,
            offered_price: option.offered_price,
            offered_price_vat_type: option.offered_price_vat_type,
            currency: option.currency,
            created_at: option.created_at,
            updated_at: option.updated_at,
            has_been_clicked: hasBeenClicked,
            // Add adjusted offered price information
            ...(offeredPriceAdjustment && {
              price_adjustment: offeredPriceAdjustment,
            }),
          },
          advert: adjustedAdvert,
        };
      });

      res.status(200).json({
        success: true,
        message: 'Wishlist retrieved successfully',
        data: {
          user: user,
          user_location: isSwedish ? 'Swedish' : 'Non-Swedish',
          total_items: formattedWishlist.length,
          wishlist: formattedWishlist,
        },
      });
    } catch (error) {
      console.error('Error in getUserWishlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wishlist',
        error: error.message,
      });
    }
  },

  // Handle landing page contact form submissions
  landingContact: async (req, res) => {
    try {
      const { name, email, phone, company, message } = req.body;

      // Log all the received form data
      console.log('Landing Contact Form Submission:');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Phone Number:', phone);
      console.log('Company Name:', company);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.log('-----------------------------------');

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required fields',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Send email notification to contact email
      try {
        const contactEmail = process.env.CONTACT_MAIL;
        if (!contactEmail) {
          console.warn('CONTACT_MAIL environment variable not set');
        } else {
          // Create email content
          const emailSubject = `New Contact Form Submission from ${name}`;
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Contact Form Submission</h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Company Name:</strong> ${company || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: white; padding: 15px; border-radius: 3px; margin: 10px 0;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p style="color: #666; font-size: 12px;">
                This email was automatically generated from the contact form submission.
              </p>
            </div>
          `;

          // Send email using enhanced email service with tracking
          await emailService.sendEmail('contact_form', contactEmail, {
            name,
            email,
            phone: phone || 'Not provided',
            company: company || 'Not provided',
            message,
            submittedAt: new Date().toLocaleString(),
            emailSubject,
            emailBody,
          });

          console.log('Contact form email sent successfully to:', contactEmail);
        }
      } catch (emailError) {
        console.error('Failed to send contact form email:', emailError);
        // Don't fail the operation if email sending fails
      }

      res.status(200).json({
        success: true,
        message:
          "Contact form submitted successfully. We'll get back to you as soon as possible.",
        data: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          message,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in landingContact:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing contact form submission',
        error: error.message,
      });
    }
  },

  // Get newsletter job status
  getNewsletterJobStatus: async (req, res) => {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required',
        });
      }

      const jobStatus = getJobStatus(jobId);

      if (!jobStatus) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or expired',
        });
      }

      res.status(200).json({
        success: true,
        jobStatus,
      });
    } catch (error) {
      console.error('Error in getNewsletterJobStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving job status',
        error: error.message,
      });
    }
  },
  listingsiteaScraperUserInfos: async (req, res) => {
    try {
      const users = await User.findAll({
        where: { listingsitea_url: { [Op.ne]: null } },
        raw: true,
      });

      // Fetch listingsitea adverts count for each user
      const usersWithAdvertCount = await Promise.all(
        users.map(async (user) => {
          const advertCount = await Advert.scope(
            'withInitialRunListings'
          ).count({
            where: { seller_id: user.id },
          });
          return {
            ...user,
            listingsitea_adverts_count: advertCount,
          };
        })
      );
      res.status(200).json({
        success: true,
        data: usersWithAdvertCount,
      });
    } catch (error) {
      console.error('Error in listingsiteaScraperUserInfos:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving listingsitea scraper user infos',
        error: error.message,
      });
    }
  },
  weeklyDealerReport: async (req, res) => {
    try {
      const dealers = await User.findAll({
        where: { listingsitea_url: { [Op.ne]: null } },
        raw: true,
      });

      // Get ListingSiteAInventory data for sell count calculations
      const currentWeekEnd = new Date();
      currentWeekEnd.setHours(23, 59, 59, 999);

      // Get current week's latest entry for each dealer
      const currentWeekInventory = await ListingSiteAInventory.findAll({
        where: {
          seller_id: { [Op.in]: dealers.map((dealer) => dealer.id) },
          created_at: {
            [Op.lte]: currentWeekEnd,
          },
        },
        raw: true,
        order: [['created_at', 'DESC']],
      });

      // Get previous week's latest entry for each dealer
      const prevWeekEnd = new Date(currentWeekEnd);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

      const prevWeekInventory = await ListingSiteAInventory.findAll({
        where: {
          seller_id: { [Op.in]: dealers.map((dealer) => dealer.id) },
          created_at: {
            [Op.lte]: prevWeekEnd,
          },
        },
        raw: true,
        order: [['created_at', 'DESC']],
      });

      const advertsForFastestSelling = await Advert.findAll({
        where: {
          seller_id: { [Op.in]: dealers.map((dealer) => dealer.id) },
          created_at: { [Op.gt]: process.env.SCRAPED_LISTINGS_START_DATE },
          last_seen: {
            [Op.gt]: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
          },
          is_active: false,
        },
        raw: true,
      });

      // Get all adverts for sold cars calculation (broader query for last_seen date analysis)
      const allAdverts = await Advert.findAll({
        where: {
          seller_id: { [Op.in]: dealers.map((dealer) => dealer.id) },
          created_at: { [Op.gt]: process.env.SCRAPED_LISTINGS_START_DATE },
          last_seen: { [Op.not]: null }, // Only adverts with last_seen dates
        },
        raw: true,
      });

      const report = await calculateReport(
        dealers,
        currentWeekInventory,
        prevWeekInventory,
        advertsForFastestSelling,
        allAdverts
      );

      res.status(200).json({
        success: true,
        report,
        message: 'Weekly dealer report retrieved successfully',
      });
    } catch (error) {
      console.error('Error in weeklyDealerReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving weekly dealer report',
        error: error.message,
      });
    }
  },
  getDealersSoldCars: async (req, res) => {
    try {
      const { id } = req.params;

      const dealer = await User.findOne({
        where: { id },
        raw: true,
      });

      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: 'Dealer not found',
        });
      }

      // sell time should be no more then 12
      const adverts = await Advert.findAll({
        where: {
          seller_id: id,
          created_at: { [Op.gt]: process.env.SCRAPED_LISTINGS_START_DATE },
          is_active: false,
          sell_time: { [Op.lt]: 12 },
        },
        raw: true,
      });
      res.status(200).json({
        success: true,
        dealer,
        data: adverts,
      });
    } catch (error) {
      console.error('Error in getDealersSoldCars:', error);
    }
  },
  generateScrapedDealersReport: async (req, res) => {
    try {
      const { dealer_id, suggestions, when_to_send, is_sending } = req.body;

      // Convert Swedish time to UTC if when_to_send is provided
      const utcWhenToSend = when_to_send
        ? convertSwedishTimeToUTC(when_to_send)
        : when_to_send;

      // Validate required fields
      if (!dealer_id) {
        return res.status(400).json({
          success: false,
          message: 'dealer_id is required',
        });
      }

      // Check if user exists
      const user = await User.findByPk(dealer_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if report options already exist for this user
      let reportOptions = await UserReportOptions.findOne({
        where: { user_id: dealer_id },
      });

      if (reportOptions) {
        // Update existing report options
        await reportOptions.update({
          suggestions:
            suggestions !== undefined ? suggestions : reportOptions.suggestions,
          when_to_send:
            when_to_send !== undefined
              ? utcWhenToSend
              : reportOptions.when_to_send,
          is_sending:
            is_sending !== undefined ? is_sending : reportOptions.is_sending,
        });
      } else {
        // Create new report options
        reportOptions = await UserReportOptions.create({
          user_id: dealer_id,
          percentage: 0,
          suggestions: suggestions || null,
          when_to_send: utcWhenToSend || null,
          is_sending: is_sending || false,
        });
      }

      // Check if user is Swedish based on listingsitea_url
      const isSwedish =
        user.listingsitea_url && user.listingsitea_url.includes('listingsitea.ch');

      // Generate email data using the service method
      const emailDataResult = await generateWeeklyReportEmailData(
        reportOptions.id,
        isSwedish
      );

      // Generate login code for the user (same as weekly report cron)
      let loginCode = null;
      try {
        const loginCodeResult = await loginCodeService.generateCode(dealer_id);
        loginCode = loginCodeResult.token;
        console.log(`🔐 Generated login code for user ${dealer_id}`);
      } catch (error) {
        console.error(
          `❌ Error generating login code for user ${dealer_id}:`,
          error.message
        );
      }

      // Immediately send the report to specified email addresses
      // const reportEmails = ['info@automarket.example.com', 'test@example.com'];
      const reportEmails = ['test@example.com'];
      const emailSendResults = [];

      if (emailDataResult.success && emailDataResult.emailData) {
        for (const email of reportEmails) {
          try {
            console.log(`Sending scraped dealers report to ${email}...`);

            // Prepare email data with user_id and login code for tracking (same as weekly report cron)
            const emailDataWithLoginCode = {
              ...emailDataResult.emailData,
              loginCode: loginCode,
              user_id: dealer_id,
            };

            const emailResponse = await emailService.sendWeeklyReportEmail(
              email,
              emailDataWithLoginCode,
              emailDataResult.user.language || 'en'
            );

            emailSendResults.push({
              email: email,
              success: true,
              messageId: emailResponse.id,
            });

            console.log(`Successfully sent report to ${email}`);
          } catch (emailError) {
            console.error(`Failed to send report to ${email}:`, emailError);
            emailSendResults.push({
              email: email,
              success: false,
              error: emailError.message,
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'User report options updated and emails sent successfully',
        data: {
          reportOptions,
          emailData: emailDataResult.success ? emailDataResult.emailData : null,
          user: emailDataResult.success ? emailDataResult.user : null,
          error: emailDataResult.success ? null : emailDataResult.error,
          emailSendResults: emailSendResults,
          loginCodeGenerated: loginCode !== null,
        },
      });
    } catch (error) {
      console.error('Error in generateScrapedDealersReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user report options',
        error: error.message,
      });
    }
  },

  // Update or create user report options
  updateUserReportOptions: async (req, res) => {
    try {
      const { dealer_id, percentage, suggestions, when_to_send, is_sending } =
        req.body;

      // Convert Swedish time to UTC if when_to_send is provided
      const utcWhenToSend = when_to_send
        ? convertSwedishTimeToUTC(when_to_send)
        : when_to_send;

      // Validate required fields
      if (!dealer_id) {
        return res.status(400).json({
          success: false,
          message: 'dealer_id is required',
        });
      }

      // Check if user exists
      const user = await User.findByPk(dealer_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if report options already exist for this user
      let reportOptions = await UserReportOptions.findOne({
        where: { user_id: dealer_id },
      });

      if (reportOptions) {
        // Update existing report options
        await reportOptions.update({
          percentage:
            percentage !== undefined ? percentage : reportOptions.percentage,
          suggestions:
            suggestions !== undefined ? suggestions : reportOptions.suggestions,
          when_to_send:
            when_to_send !== undefined
              ? utcWhenToSend
              : reportOptions.when_to_send,
          is_sending:
            is_sending !== undefined ? is_sending : reportOptions.is_sending,
        });
      } else {
        // Create new report options
        reportOptions = await UserReportOptions.create({
          user_id: dealer_id,
          percentage: percentage || 0,
          suggestions: suggestions || null,
          when_to_send: utcWhenToSend || null,
          is_sending: is_sending || false,
        });
      }

      res.status(200).json({
        success: true,
        message: 'User report options updated successfully',
        data: reportOptions,
      });
    } catch (error) {
      console.error('Error in updateUserReportOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user report options',
        error: error.message,
      });
    }
  },

  // Get user report options
  getUserReportOptions: async (req, res) => {
    try {
      const { dealer_id } = req.params;

      if (!dealer_id) {
        return res.status(400).json({
          success: false,
          message: 'dealer_id is required',
        });
      }

      const reportOptions = await UserReportOptions.findOne({
        where: { user_id: dealer_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'company_name'],
          },
        ],
      });

      if (!reportOptions) {
        return res.status(404).json({
          success: false,
          message: 'User report options not found',
        });
      }

      res.status(200).json({
        success: true,
        data: reportOptions,
      });
    } catch (error) {
      console.error('Error in getUserReportOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user report options',
        error: error.message,
      });
    }
  },
  getWeeklyReport: async (req, res) => {
    try {
      const userId = req.user.id;
      // Check if user has report options
      const reportOption = await UserReportOptions.findOne({
        where: { user_id: userId },
      });

      if (!reportOption) {
        return res.status(404).json({
          success: false,
          message:
            'Weekly report options not found. Please configure your report preferences first.',
        });
      }

      // Get user information
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is Swedish based on listingsitea_url
      const isSwedish =
        user.listingsitea_url && user.listingsitea_url.includes('listingsitea.ch');

      // Generate weekly report data using the same function as the cron job
      const result = await generateWeeklyReportEmailData(
        reportOption.id,
        isSwedish
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Error generating weekly report data',
          error: result.error,
        });
      }

      // Get additional weekly report data similar to weeklyDealerReport
      const dealers = [user]; // Use single user as dealer

      // Get ListingSiteAInventory data for sell count calculations
      const currentWeekEnd = new Date();
      currentWeekEnd.setHours(23, 59, 59, 999);

      // Get current week's latest entry for this dealer
      const currentWeekInventory = await ListingSiteAInventory.findAll({
        where: {
          seller_id: userId,
          created_at: {
            [Op.lte]: currentWeekEnd,
          },
        },
        raw: true,
        order: [['created_at', 'DESC']],
      });

      // Get previous week's latest entry for this dealer
      const prevWeekEnd = new Date(currentWeekEnd);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

      const prevWeekInventory = await ListingSiteAInventory.findAll({
        where: {
          seller_id: userId,
          created_at: {
            [Op.lte]: prevWeekEnd,
          },
        },
        raw: true,
        order: [['created_at', 'DESC']],
      });

      const advertsForFastestSelling = await Advert.findAll({
        where: {
          seller_id: userId,
          created_at: { [Op.gt]: process.env.SCRAPED_LISTINGS_START_DATE },
          last_seen: {
            [Op.gt]: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
          },
          is_active: false,
        },
        raw: true,
      });

      // Get all adverts for sold cars calculation (broader query for last_seen date analysis)
      const allAdverts = await Advert.findAll({
        where: {
          seller_id: userId,
          created_at: { [Op.gt]: process.env.SCRAPED_LISTINGS_START_DATE },
          last_seen: { [Op.not]: null }, // Only adverts with last_seen dates
        },
        raw: true,
      });

      // Generate detailed report using calculateReport
      const detailedReport = await calculateReport(
        dealers,
        currentWeekInventory,
        prevWeekInventory,
        advertsForFastestSelling,
        allAdverts
      );

      // Return the combined data
      res.status(200).json({
        success: true,
        data: {
          ...result.emailData,
          detailedReport: detailedReport,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            company_name: user.company_name,
            language: user.language,
            isSwedish: isSwedish,
          },
        },
      });
    } catch (error) {
      console.error('Error in getWeeklyReport:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  // Get all users with login codes (generates codes if they don't exist)
  getAllUsersWithLoginCodes: async (req, res) => {
    try {
      // Get all users with role_id 2 (dealers)
      const users = await User.findAll({
        where: { role_id: 2 }, // Only users with role_id 2
        attributes: [
          'id',
          'name',
          'company_name',
          'email',
          'role_id',
          'status_id',
          'created_at',
          'updated_at',
        ],
        order: [['created_at', 'DESC']],
      });

      if (!users || users.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          message: 'No users found',
        });
      }

      // Process each user to ensure they have login codes
      const usersWithLoginCodes = [];

      for (const user of users) {
        try {
          // Check if user already has an active login code
          const existingLoginCode = await loginCodeService.getActiveCode(
            user.id
          );

          let loginCodeInfo = null;

          if (!existingLoginCode) {
            // Generate a new login code if none exists
            console.log(
              `Generating login code for user ${user.id} (${user.email})`
            );
            const loginCodeResult = await loginCodeService.generateCode(
              user.id
            );

            if (loginCodeResult.success) {
              loginCodeInfo = {
                token: loginCodeResult.token,
                created_at: loginCodeResult.createdAt,
                generated: true, // Flag to indicate this was just generated
              };
            } else {
              console.error(
                `Failed to generate login code for user ${user.id}:`,
                loginCodeResult.error
              );
            }
          } else {
            // Use existing login code
            loginCodeInfo = {
              token: existingLoginCode.token,
              created_at: existingLoginCode.created_at,
              generated: false, // Flag to indicate this already existed
            };
          }

          // Add user with login code information
          usersWithLoginCodes.push({
            ...user.toJSON(),
            loginCode: loginCodeInfo,
          });
        } catch (error) {
          console.error(
            `Error processing login code for user ${user.id}:`,
            error
          );

          // Add user without login code info if there was an error
          usersWithLoginCodes.push({
            ...user.toJSON(),
            loginCode: null,
            loginCodeError: error.message,
          });
        }
      }

      // Count how many codes were generated vs already existing
      const generatedCount = usersWithLoginCodes.filter(
        (user) => user.loginCode && user.loginCode.generated
      ).length;
      const existingCount = usersWithLoginCodes.filter(
        (user) => user.loginCode && !user.loginCode.generated
      ).length;
      const errorCount = usersWithLoginCodes.filter(
        (user) => user.loginCodeError
      ).length;

      res.status(200).json({
        success: true,
        users: usersWithLoginCodes,
        stats: {
          totalUsers: users.length,
          codesGenerated: generatedCount,
          codesExisting: existingCount,
          errors: errorCount,
        },
        message: `Retrieved ${users.length} users. Generated ${generatedCount} new login codes, ${existingCount} existing codes found.`,
      });
    } catch (error) {
      console.error('Error in getAllUsersWithLoginCodes:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving users with login codes',
        error: error.message,
      });
    }
  },

  // Add wishlist click
  addWishlistClick: async (req, res) => {
    try {
      const { wishlist_option_id, listing_id, user_id } = req.body;

      // Validate required fields
      if (!wishlist_option_id || !listing_id || !user_id) {
        return res.status(400).json({
          success: false,
          message: 'wishlist_option_id, listing_id, and user_id are required',
        });
      }

      // Create new wishlist click entry
      const wishlistClick = await WishlistClick.create({
        wishlist_option_id,
        listing_id,
        user_id,
      });

      res.status(201).json({
        success: true,
        message: 'Wishlist click added successfully',
        data: wishlistClick,
      });
    } catch (error) {
      console.error('Error adding wishlist click:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding wishlist click',
        error: error.message,
      });
    }
  },

  // Get all wishlist orders (clicks) grouped by user
  getWishlistOrders: async (req, res) => {
    try {
      // First, get all existing wishlist options to filter clicks
      const existingWishlistOptions = await WishlistOptions.findAll({
        attributes: ['id', 'user_id', 'listing_id'],
        raw: true,
      });

      if (existingWishlistOptions.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No wishlist options found',
          data: {
            total_users: 0,
            total_clicks: 0,
            orders_by_user: [],
          },
        });
      }

      // Get all wishlist option IDs to filter clicks
      const existingWishlistOptionIds = existingWishlistOptions.map(
        (option) => option.id
      );

      // Get all wishlist clicks that correspond to existing wishlist options
      const wishlistClicks = await WishlistClick.findAll({
        where: {
          wishlist_option_id: existingWishlistOptionIds,
        },
        order: [['created_at', 'DESC']],
        raw: true,
      });

      if (wishlistClicks.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No wishlist clicks found for existing wishlist options',
          data: {
            total_users: 0,
            total_clicks: 0,
            orders_by_user: [],
          },
        });
      }

      // Get unique user IDs and listing IDs
      const userIds = [
        ...new Set(wishlistClicks.map((click) => click.user_id)),
      ];
      const listingIds = [
        ...new Set(wishlistClicks.map((click) => click.listing_id)),
      ];

      // Fetch user data
      const users = await User.findAll({
        where: {
          id: userIds,
        },
        attributes: [
          'id',
          'name',
          'email',
          'company_name',
          'country',
          'listingsitea_url',
          'created_at',
        ],
      });

      // Fetch advert data
      const adverts = await Advert.findAll({
        where: {
          id: listingIds,
        },
        attributes: [
          'id',
          'listingsitea_id',
          'seller_id',
          'seller_name',
          'sell_time',
          'make',
          'model',
          'model_version',
          'first_registration',
          'location',
          'price',
          'price_currency',
          'body_type',
          'gearbox',
          'mileage',
          'power',
          'fuel_type',
          'color',
          'description',
          'link',
          'image_url',
          'is_active',
          'last_seen',
          'created_at',
        ],
      });

      // Create maps for quick lookup
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user.toJSON();
      });

      const advertMap = {};
      adverts.forEach((advert) => {
        advertMap[advert.id] = advert.toJSON();
      });

      // Fetch complete wishlist options data for all wishlist option IDs from clicks
      const wishlistOptionIds = [
        ...new Set(wishlistClicks.map((click) => click.wishlist_option_id)),
      ];

      const completeWishlistOptions = await WishlistOptions.findAll({
        where: {
          id: wishlistOptionIds,
        },
        attributes: [
          'id',
          'user_id',
          'listing_id',
          'listing_vat_type',
          'offered_price',
          'offered_price_vat_type',
          'currency',
          'created_at',
          'updated_at',
        ],
        raw: true,
      });

      // Create a map for wishlist options by their ID
      const wishlistOptionsMap = {};
      completeWishlistOptions.forEach((option) => {
        wishlistOptionsMap[option.id] = option;
      });

      // Group wishlist clicks by user
      const ordersByUser = {};
      wishlistClicks.forEach((click) => {
        const userId = click.user_id;
        const wishlistOption =
          wishlistOptionsMap[click.wishlist_option_id] || null;
        const user = userMap[userId];

        // Determine if user is Swedish based on listingsitea_url
        const isSwedish =
          user &&
          user.listingsitea_url &&
          user.listingsitea_url.includes('listingsitea.ch');

        if (!ordersByUser[userId]) {
          ordersByUser[userId] = {
            user: userMap[userId] || null,
            user_location: isSwedish ? 'Swedish' : 'Non-Swedish',
            total_clicks: 0,
            clicks: [],
          };
        }

        // Apply VAT conversion logic for offered price if it exists
        let adjustedOfferedPrice = wishlistOption?.offered_price || null;
        let offeredPriceAdjustment = null;

        if (
          wishlistOption &&
          wishlistOption.offered_price &&
          wishlistOption.offered_price_vat_type
        ) {
          const originalOfferedPrice = parseFloat(wishlistOption.offered_price);
          let adjustedOffered = originalOfferedPrice;

          if (wishlistOption.offered_price_vat_type === 'Excl. VAT') {
            const vatRate = isSwedish ? 1.081 : 1.21;
            adjustedOffered = originalOfferedPrice * vatRate;
          }

          adjustedOfferedPrice = Math.round(adjustedOffered * 100) / 100;
          offeredPriceAdjustment = {
            original_offered_price: originalOfferedPrice,
            adjusted_offered_price: adjustedOfferedPrice,
            adjustment_applied:
              wishlistOption.offered_price_vat_type === 'Excl. VAT',
            vat_rate_used:
              wishlistOption.offered_price_vat_type === 'Excl. VAT'
                ? isSwedish
                  ? '8.1%'
                  : '21%'
                : 'N/A',
          };
        }

        // Apply VAT conversion logic for advert price
        const advert = advertMap[click.listing_id] || null;
        let adjustedAdvert = null;

        if (advert && advert.price && wishlistOption) {
          adjustedAdvert = { ...advert };
          const originalAdvertPrice = parseFloat(advert.price);
          let adjustedAdvertPrice = originalAdvertPrice;

          // Adverts are always "Incl. VAT" by default (scraped listings)
          // Apply adjustment based on the offered_price_vat_type (exactly like reportService.getAdjustedPrices)
          if (wishlistOption.offered_price_vat_type === 'Excl. VAT') {
            // Use different VAT rates: 8.1% for Swedish users, 21% for others
            const vatRate = isSwedish ? 1.081 : 1.21;
            // Convert scraped listing from Incl. VAT to Excl. VAT for comparison
            adjustedAdvertPrice = originalAdvertPrice / vatRate;
          }
          // If wishlistOption.offered_price_vat_type is 'Incl. VAT', no adjustment needed as adverts are already Incl. VAT

          // Add adjusted price information to the advert
          adjustedAdvert.original_price = originalAdvertPrice;
          adjustedAdvert.adjusted_price =
            Math.round(adjustedAdvertPrice * 100) / 100;
          adjustedAdvert.price_adjustment_applied =
            adjustedAdvertPrice !== originalAdvertPrice;
          adjustedAdvert.adjustment_reason =
            adjustedAdvertPrice !== originalAdvertPrice
              ? `Converted to match offered price VAT type: ${wishlistOption.offered_price_vat_type}`
              : 'No adjustment needed';
          adjustedAdvert.vat_rate_used =
            adjustedAdvertPrice !== originalAdvertPrice
              ? isSwedish
                ? '8.1%'
                : '21%'
              : 'N/A';
          adjustedAdvert.user_location = isSwedish ? 'Swedish' : 'Non-Swedish';
        }

        ordersByUser[userId].total_clicks += 1;
        ordersByUser[userId].clicks.push({
          id: click.id,
          wishlist_option_id: click.wishlist_option_id,
          listing_id: click.listing_id,
          user_id: click.user_id,
          created_at: click.created_at,
          updated_at: click.updated_at,
          advert: adjustedAdvert || advert,
          wishlist_option: wishlistOption
            ? {
                id: wishlistOption.id,
                listing_vat_type: wishlistOption.listing_vat_type,
                offered_price: wishlistOption.offered_price,
                offered_price_vat_type: wishlistOption.offered_price_vat_type,
                currency: wishlistOption.currency,
                created_at: wishlistOption.created_at,
                updated_at: wishlistOption.updated_at,
                // Add adjusted offered price information
                ...(offeredPriceAdjustment && {
                  price_adjustment: offeredPriceAdjustment,
                }),
              }
            : null,
        });
      });

      // Convert to array format
      const ordersArray = Object.values(ordersByUser);

      // Sort by total clicks (descending) and then by user name
      ordersArray.sort((a, b) => {
        if (b.total_clicks !== a.total_clicks) {
          return b.total_clicks - a.total_clicks;
        }
        const nameA = (a.user?.name || '').toLowerCase();
        const nameB = (b.user?.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      res.status(200).json({
        success: true,
        message: 'Wishlist orders retrieved successfully',
        data: {
          total_users: userIds.length,
          total_clicks: wishlistClicks.length,
          orders_by_user: ordersArray,
        },
      });
    } catch (error) {
      console.error('Error getting wishlist orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wishlist orders',
        error: error.message,
      });
    }
  },

  // Scraping Analysis - Get sold cars today and daily data for past 7 days
  scrapingAnalysis: async (req, res) => {
    try {
      const sequelize = require('../config/database');

      // Get sold cars today with their dealers and advert details
      const soldTodayQuery = `
        SELECT 
          u.id as user_id,
          u.company_name,
          u.listingsitea_url as url,
          COUNT(*) as sold_today_count,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'advert_id', a.id,
              'make', a.make,
              'model', a.model,
              'first_registration', a.first_registration,
              'price', a.price,
              'mileage', a.mileage,
              'fuel_type', a.fuel_type,
              'listingsitea_id', a.listingsitea_id,
              'image_url', a.image_url,
              'last_seen', a.last_seen
            ) ORDER BY a.last_seen DESC
          ) as adverts
        FROM 
          public.users u
        LEFT JOIN 
          public.listingsitea_adverts a ON u.id = a.seller_id
        WHERE 
          u.listingsitea_url IS NOT NULL
          AND a.is_active = false 
          AND a.is_initial_run_listing = false
          AND a.last_seen::date = CURRENT_DATE
        GROUP BY 
          u.id, u.company_name, u.listingsitea_url
        HAVING 
          COUNT(*) > 0
        ORDER BY 
          sold_today_count DESC, u.company_name;
      `;

      // Get daily data for past 7 days with advert details
      const dailyDataQuery = `
        WITH daily_sales AS (
          SELECT 
            u.id as user_id,
            u.company_name,
            u.listingsitea_url as url,
            DATE(a.last_seen) as sale_date,
            COUNT(*) as sold_count,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'advert_id', a.id,
                'make', a.make,
                'model', a.model,
                'first_registration', a.first_registration,
                'price', a.price,
                'mileage', a.mileage,
                'fuel_type', a.fuel_type,
                'listingsitea_id', a.listingsitea_id,
                'image_url', a.image_url,
                'last_seen', a.last_seen
              ) ORDER BY a.last_seen DESC
            ) as adverts
          FROM 
            public.users u
          INNER JOIN 
            public.listingsitea_adverts a ON u.id = a.seller_id
          WHERE 
            u.listingsitea_url IS NOT NULL
            AND a.is_active = false 
            AND a.is_initial_run_listing = false
            AND a.last_seen >= CURRENT_DATE - INTERVAL '7 days'
            AND a.last_seen::date != CURRENT_DATE
          GROUP BY 
            u.id, u.company_name, u.listingsitea_url, DATE(a.last_seen)
        )
        SELECT 
          sale_date as date,
          SUM(sold_count) as total_sold_count,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'user_id', user_id,
              'company_name', company_name,
              'url', url,
              'sold_count', sold_count,
              'adverts', adverts
            ) ORDER BY sold_count DESC
          ) as dealers
        FROM daily_sales
        GROUP BY sale_date
        ORDER BY sale_date DESC;
      `;

      const [soldTodayResults] = await sequelize.query(soldTodayQuery);
      const [dailyDataResults] = await sequelize.query(dailyDataQuery);

      res.status(200).json({
        success: true,
        data: {
          soldToday: soldTodayResults,
          dailyData: dailyDataResults,
        },
      });
    } catch (error) {
      console.error('Error in scraping analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving scraping analysis data',
        error: error.message,
      });
    }
  },

  // Scraping Analysis Overview - Get overview statistics for all dealers
  scrapingAnalysisOverview: async (req, res) => {
    try {
      const sequelize = require('../config/database');

      const overviewQuery = `
        SELECT
          u.id as user_id,
          u.company_name AS company_name,
          COUNT(*) FILTER (
              WHERE a.is_active = false 
                and a.is_initial_run_listing = false
                AND a.last_seen > NOW() - INTERVAL '12 days'
          ) AS sold_last_12_days,
          COUNT(*) FILTER (
              WHERE a.is_active = false 
                and a.is_initial_run_listing = false
                AND a.last_seen > NOW() - INTERVAL '2 days'
          ) AS sold_last_2_days,
          COUNT(*) FILTER (
              WHERE a.created_at > NOW() - INTERVAL '2 days'
          ) AS scraped_last_2_days,
          COUNT(*) FILTER (WHERE a.is_active = true) AS active_adverts,
          u.listingsitea_url AS url
          
        FROM 
          public.users u
        LEFT JOIN 
          public.listingsitea_adverts a 
          ON u.id = a.seller_id
        WHERE 
          u.listingsitea_url IS NOT NULL
        GROUP BY 
          u.id, u.company_name, u.listingsitea_url
        ORDER BY 
          active_adverts DESC,  -- first sort by active adverts (highest first)
          u.company_name;       -- then fallback alphabetically
      `;

      const [overviewResults] = await sequelize.query(overviewQuery);

      res.status(200).json({
        success: true,
        data: overviewResults,
      });
    } catch (error) {
      console.error('Error in scraping analysis overview:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving scraping analysis overview data',
        error: error.message,
      });
    }
  },
};

// In-memory job tracking (in production, use Redis or database)
const jobStatuses = new Map();

// Configuration for background processing
const CONCURRENT_COUNTRIES =
  parseInt(process.env.NEWSLETTER_CONCURRENT_COUNTRIES) || 3; // Process countries concurrently
const COUNTRY_BATCH_DELAY =
  parseInt(process.env.NEWSLETTER_COUNTRY_BATCH_DELAY) || 2000; // Delay between country batches

// Background processing function
async function processNewsletterJobInBackground(
  jobId,
  countryIdArray,
  listingIDs
) {
  const startTime = Date.now();

  // Initialize job status
  jobStatuses.set(jobId, {
    jobId,
    status: 'processing',
    startTime,
    countries: countryIdArray,
    listingIDs,
    totalCountries: countryIdArray.length,
    processedCountries: 0,
    results: [],
    stats: {
      totalSent: 0,
      totalFailed: 0,
      totalContacts: 0,
    },
  });

  try {
    console.log(
      `📧 Processing newsletter job ${jobId} for ${countryIdArray.length} countries`
    );
    console.log(
      `⚙️  Processing ${CONCURRENT_COUNTRIES} countries concurrently with ${COUNTRY_BATCH_DELAY}ms delay between batches`
    );

    // Process countries in parallel (limited concurrency)
    const results = [];

    for (let i = 0; i < countryIdArray.length; i += CONCURRENT_COUNTRIES) {
      const batch = countryIdArray.slice(i, i + CONCURRENT_COUNTRIES);

      const batchPromises = batch.map(async (countryId) => {
        try {
          console.log(`🌍 Processing country ${countryId} in job ${jobId}`);
          const result = await sendNewsletterEmails(countryId, listingIDs);

          // Update job status
          const currentStatus = jobStatuses.get(jobId);
          if (currentStatus) {
            currentStatus.processedCountries++;
            currentStatus.results.push({
              countryId,
              success: result.success,
              message: result.message,
              stats: result.stats,
            });
            currentStatus.stats.totalSent += result.stats.sent;
            currentStatus.stats.totalFailed += result.stats.failed;
            currentStatus.stats.totalContacts += result.stats.total;
          }

          return { countryId, success: result.success, result };
        } catch (error) {
          console.error(`❌ Error processing country ${countryId}:`, error);

          // Update job status with error
          const currentStatus = jobStatuses.get(jobId);
          if (currentStatus) {
            currentStatus.processedCountries++;
            currentStatus.results.push({
              countryId,
              success: false,
              message: error.message,
              stats: { total: 0, sent: 0, failed: 0 },
            });
          }

          return { countryId, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid overwhelming the system
      if (i + CONCURRENT_COUNTRIES < countryIdArray.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, COUNTRY_BATCH_DELAY)
        );
      }
    }

    // Final job status
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const successfulCountries = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    jobStatuses.set(jobId, {
      ...jobStatuses.get(jobId),
      status: 'completed',
      completedAt: Date.now(),
      processingTime,
      successfulCountries,
      totalCountries: countryIdArray.length,
    });

    console.log(`✅ Newsletter job ${jobId} completed in ${processingTime}s`);
    console.log(
      `   Countries processed: ${successfulCountries}/${countryIdArray.length}`
    );
    console.log(
      `   Total emails sent: ${jobStatuses.get(jobId).stats.totalSent}`
    );
    console.log(
      `   Total failures: ${jobStatuses.get(jobId).stats.totalFailed}`
    );
  } catch (error) {
    console.error(`❌ Error in newsletter job ${jobId}:`, error);

    jobStatuses.set(jobId, {
      ...jobStatuses.get(jobId),
      status: 'failed',
      error: error.message,
      completedAt: Date.now(),
    });
  }

  // Clean up job status after 1 hour
  setTimeout(
    () => {
      jobStatuses.delete(jobId);
      console.log(`🧹 Cleaned up job status for ${jobId}`);
    },
    60 * 60 * 1000
  );
}

// Helper function to get job status
function getJobStatus(jobId) {
  return jobStatuses.get(jobId) || null;
}

// Add user wishlist sending options
userController.addUserWishlistSendingOptions = async (req, res) => {
  try {
    const { user_id, when_to_send, is_sending } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if options already exist for this user
    let wishlistSendingOptions = await UserWishlistSendingOptions.findOne({
      where: { user_id },
    });

    if (wishlistSendingOptions) {
      // Update existing options
      wishlistSendingOptions.when_to_send =
        when_to_send || wishlistSendingOptions.when_to_send;
      wishlistSendingOptions.is_sending =
        is_sending !== undefined
          ? is_sending
          : wishlistSendingOptions.is_sending;
      await wishlistSendingOptions.save();
    } else {
      // Create new options
      wishlistSendingOptions = await UserWishlistSendingOptions.create({
        user_id,
        when_to_send,
        is_sending: is_sending || false,
      });
    }

    res.status(200).json({
      success: true,
      data: wishlistSendingOptions,
      message: wishlistSendingOptions.id
        ? 'Wishlist sending options updated successfully'
        : 'Wishlist sending options created successfully',
    });
  } catch (error) {
    console.error('Error in addUserWishlistSendingOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get user wishlist sending options by single user
userController.getUserWishlistSendingOptions = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }

    const wishlistSendingOptions = await UserWishlistSendingOptions.findOne({
      where: { user_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'company_name'],
        },
      ],
    });

    if (!wishlistSendingOptions) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist sending options not found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: wishlistSendingOptions,
    });
  } catch (error) {
    console.error('Error in getUserWishlistSendingOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all users with wishlist sending options
userController.getAllUsersWithWishlistSendingOptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: wishlistSendingOptions } =
      await UserWishlistSendingOptions.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: [
              'id',
              'name',
              'email',
              'company_name',
              'phone_number',
              'country',
            ],
          },
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        wishlistSendingOptions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('Error in getAllUsersWithWishlistSendingOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Add wishlist activity based on login code
userController.addWishlistActivity = async (req, res) => {
  try {
    const { code } = req.body;

    // Validate required parameter
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required',
      });
    }

    // Find the login code and associated user
    const loginCode = await LoginCode.findOne({
      where: { token: code },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!loginCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired code',
      });
    }

    const user = loginCode.user;

    const userActivity = await UserActivity.create({
      user_id: user.id,
      type: 'wishlist opened',
      activity_date: new Date(),
    });

    console.log(`📊 Wishlist activity created: ${userActivity.id}`);

    res.status(200).json({
      success: true,
      message: 'Wishlist activity added successfully',
      data: userActivity,
    });
  } catch (error) {
    console.error('Error in addWishlistActivity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = userController;
