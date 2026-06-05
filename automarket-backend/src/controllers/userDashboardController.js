const {
  Listing,
  ListingPhotos,
  Offer,
  User,
  SavedListings,
  Invoice,
} = require('../models/associations');
const userController = require('./userController');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');

// Import associations to ensure they are loaded
require('../models/associations');

const userDashboardController = {
  // purchased car count, reserved car count, ofer count ,unpaid onvoice count
  getOverview: async (req, res) => {
    try {
      const filteredListingsData =
        await userController.getFilteredListingsData(req);
      const user = req.user;
      const purchasedCars = await Listing.findAll({
        where: {
          status_id: 4,
          assigned_to_id: user.id,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
        ],
      });
      const reservedCars = await Listing.findAll({
        where: {
          status_id: 2,
          assigned_to_id: user.id,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
        ],
      });
      const offers = await Offer.findAll({
        where: {
          dealer_id: user.id,
          is_approved: false,
          is_rejected: false,
        },
        include: [
          {
            model: Listing,
            as: 'listing',
            where: {
              is_deleted: { [require('sequelize').Op.ne]: true },
              // Allow listings where status_id is 1 or 3
              status_id: { [require('sequelize').Op.in]: [1, 3] },
            },
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                limit: 1,
                order: [['id', 'ASC']], // Order by ID to preserve original input order
                attributes: ['url'],
              },
            ],
          },
        ],
      });
      const unpaidInvoices = await Invoice.findAll({
        where: {
          dealer_id: user.id,
          is_paid: false,
        },
      });

      return res.status(200).json({
        message: 'General info',
        data: {
          purchasedCarsCount: purchasedCars.length,
          reservedCarsCount: reservedCars.length,
          offersCount: offers.length,
          unpaidInvoicesCount: unpaidInvoices.length,
          filteredListings: filteredListingsData,
          reservedCars: reservedCars,
          offers: offers,
          purchasedCars: purchasedCars,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getReservedCars: async (req, res) => {
    try {
      const user = req.user;
      const reservedCars = await Listing.findAll({
        where: {
          status_id: 2,
          assigned_to_id: user.id,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
          {
            model: User,
            as: 'assignedTo',
            attributes: ['id', 'name', 'email', 'company_name', 'phone_number'],
          },
        ],
      });
      return res.status(200).json({
        message: 'Reserved cars',
        data: reservedCars,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  unsaveCar: async (req, res) => {
    try {
      const user = req.user;
      const { listing_id } = req.body;
      // delete the saved listing
      await SavedListings.destroy({
        where: {
          user_id: user.id,
          listing_id: listing_id,
        },
      });
      return res.status(200).json({
        message: 'Car unsaved',
        data: listing_id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getOffers: async (req, res) => {
    try {
      const user = req.user;
      const offers = await Offer.findAll({
        where: {
          dealer_id: user.id,
          is_approved: false,
          is_rejected: false,
        },
        include: [
          {
            model: Listing,
            as: 'listing',
            where: {
              is_deleted: { [require('sequelize').Op.ne]: true },
              // Allow listings where status_id is 1 or 3
              status_id: { [require('sequelize').Op.in]: [1, 3] },
            },
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                limit: 1,
                order: [['id', 'ASC']], // Order by ID to preserve original input order
                attributes: ['url'],
              },
            ],
          },
        ],
      });
      return res.status(200).json({
        message: 'Offers',
        data: offers,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getPurchasedCars: async (req, res) => {
    try {
      const user = req.user;
      const purchasedCars = await Listing.findAll({
        where: {
          status_id: {
            [require('sequelize').Op.notIn]: [1, 2, 3, 14],
          },
          assigned_to_id: user.id,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
          {
            model: Invoice,
            as: 'invoices',
            where: {
              dealer_id: user.id,
            },
            required: false,
          },
        ],
      });

      return res.status(200).json({
        message: 'Purchased cars',
        data: {
          purchasedCars: purchasedCars,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getTrackPurchasedCars: async (req, res) => {
    try {
      const user = req.user;
      const purchasedCars = await Listing.findAll({
        where: {
          status_id: {
            [require('sequelize').Op.notIn]: [1, 2, 3, 14],
          },
          assigned_to_id: user.id,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
          {
            model: Invoice,
            as: 'invoices',
            where: {
              dealer_id: user.id,
            },
            required: false,
          },
        ],
      });
      return res.status(200).json({
        message: 'Track purchased cars',
        data: purchasedCars,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getSavedCars: async (req, res) => {
    try {
      const user = req.user;

      // Get saved listings for the user
      const savedListings = await SavedListings.findAll({
        where: {
          user_id: user.id,
        },
      });

      // Get listing IDs from saved listings
      const listingIds = savedListings.map((saved) => saved.listing_id);

      // Get the actual listings with their first photo
      const savedCars = await Listing.findAll({
        where: {
          id: listingIds,
          is_deleted: { [require('sequelize').Op.ne]: true },
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            limit: 1,
            order: [['id', 'ASC']], // Order by ID to preserve original input order
            attributes: ['url'],
          },
        ],
      });

      return res.status(200).json({
        message: 'Saved cars',
        data: savedCars,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getProfile: async (req, res) => {
    try {
      const user = req.user;
      const userData = await User.findByPk(user.id);
      // get purhcesed cars
      const purchasedCars = await Listing.findAll({
        where: {
          status_id: 4,
          assigned_to_id: user.id,
        },
      });
      // get active offers,related to an existing listing
      const activeOffers = await Offer.findAll({
        where: {
          dealer_id: user.id,
          is_approved: false,
          is_rejected: false,
        },
        include: [
          {
            model: Listing,
            as: 'listing',
            where: {
              is_deleted: { [require('sequelize').Op.ne]: true },
              // Allow listings where status_id is 1 or 3
              status_id: { [require('sequelize').Op.in]: [1, 3] },
            },
          },
        ],
      });
      const userDatas = {
        cars_purchased: purchasedCars.length,
        purchased_cars: purchasedCars,
        cars_sold: 0,
        active_offers: activeOffers.length,
        name: userData.name,
        email: userData.email,
        company_name: userData.company_name,
        phone: userData.phone_number,
        website: userData.website,
        vat_number: userData.vat_number,
        language: userData.language,
      };
      return res.status(200).json({
        message: 'Profile',
        data: userDatas,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const user = req.user;
      const userData = await User.findByPk(user.id);
      const {
        name,
        email,
        company_name,
        phone,
        vat_number,
        language,
        website,
      } = req.body;

      const updatedData = {
        name: name || userData.name,
        email: email || userData.email,
        company_name: company_name || userData.company_name,
        phone_number: phone || userData.phone_number,
        vat_number: vat_number || userData.vat_number,
        language: language || userData.language,
        website: website || userData.website,
      };

      // update the user data
      Object.assign(userData, updatedData);

      // save the user data
      await userData.save();
      return res.status(200).json({
        message: 'Profile updated',
        data: userData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  changePassword: async (req, res) => {
    try {
      const user = req.user;
      const userData = await User.findByPk(user.id);
      const { current_password, new_password } = req.body;
      console.log(current_password, new_password);
      // check if the old password is correct
      const isPasswordCorrect = await bcrypt.compare(
        current_password,
        userData.password
      );
      console.log('isPasswordCorrect', isPasswordCorrect);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: 'Invalid current password' });
      }
      // update the password,hash the new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
      userData.password = hashedPassword;
      await userData.save();
      return res.status(200).json({
        message: 'Password changed',
        data: userData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  removeReserved: async (req, res) => {
    try {
      const user = req.user;
      const { listing_id } = req.body;
      // remove the reserved listing
      const reservedListing = await Listing.findByPk(listing_id);
      if (!reservedListing || reservedListing.assigned_to_id !== user.id) {
        return res.status(400).json({ error: 'Reserved listing not found' });
      }
      // update the status_id to 1 ,assigned_to_id to null
      reservedListing.status_id = 1;
      reservedListing.assigned_to_id = null;
      await reservedListing.save();
      return res.status(200).json({
        message: 'Reserved listing removed',
        data: reservedListing,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  processOffer: async (req, res) => {
    try {
      const user = req.user;
      const { offer_id, action } = req.body;
      const offer = await Offer.findByPk(offer_id);
      if (!offer || offer.dealer_id !== user.id) {
        return res.status(400).json({ error: 'Offer not found' });
      }
      // check if the offer is already approved
      if (offer.is_approved) {
        return res.status(400).json({ error: 'Offer already processed' });
      }
      if (action === 'accept') {
        // update the offer status to true
        offer.is_approved = true;
        // update the listing status to 4 ,assigned_to_id to the user_id
        const listing = await Listing.findByPk(offer.listing_id);
        listing.status_id = 4;
        listing.assigned_to_id = user.id;
        await listing.save();
        await offer.save();
        return res.status(200).json({
          message: 'Offer processed',
          data: offer,
        });
      }
      if (action === 'decline') {
        // update is_rejected to true instead of deleting
        offer.is_rejected = true;
        await offer.save();

        // Send email notification to info@automarket.example.com
        try {
          // Get listing details for the email
          const listing = await Listing.findByPk(offer.listing_id);

          const emailData = {
            userName: user.name,
            userEmail: user.email,
            companyName: user.company_name,
            vehicleBrand: listing?.brand_name,
            vehicleModel: listing?.model,
            vinNumber: listing?.vin_number,
            registrationNumber: listing?.registration_number,
            offerAmount: offer.offer,
            listingPrice: listing?.listing_price,
            rejectedAt: new Date().toLocaleString(),
          };

          await emailService.sendEmail(
            'counterOfferRejected',
            'info@automarket.example.com',
            emailData
          );

          console.log('Offer rejection notification sent to info@automarket.example.com');
        } catch (emailError) {
          console.error(
            'Failed to send offer rejection notification:',
            emailError
          );
          // Don't fail the operation if email sending fails
        }

        return res.status(200).json({
          message: 'Offer processed',
          data: offer,
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getInvoices: async (req, res) => {
    try {
      const user = req.user;
      const invoices = await Invoice.findAll({
        where: {
          dealer_id: user.id,
          listing_id: { [require('sequelize').Op.ne]: null }, // Only invoices with associated listings
        },
        attributes: [
          'id',
          'amount',
          'currency',
          'is_paid',
          'invoice_number',
          'description',
          'due_date',
          'link',
          'created_at',
          'updated_at',
        ],
        include: [
          {
            model: Listing,
            as: 'listing',
            where: {
              is_deleted: { [require('sequelize').Op.ne]: true },
            },
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                limit: 1,
                order: [['id', 'ASC']], // Order by ID to preserve original input order
                attributes: ['url'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });
      return res.status(200).json({
        message: 'Invoices',
        data: invoices,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userDashboardController;
