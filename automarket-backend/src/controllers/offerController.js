const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const ListingPhotos = require('../models/ListingPhotos');
const User = require('../models/User');
const { Op, Sequelize } = require('sequelize');
const emailService = require('../services/emailService');
const axios = require('axios');

const offerController = {
  // Get all offers with pagination, grouped by listings
  getAllOffers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // First, get listings that have offers
      const { count, rows: listings } = await Listing.findAndCountAll({
        where: {
          status_id: {
            [Op.in]: [1, 3], // Only get listings with status 1 (available) or 3 (counter offered)
          },
        },
        include: [
          {
            model: Offer,
            where: {
              is_rejected: false,
            },
            as: 'offers',
            required: true, // INNER JOIN to only get listings with offers
            include: [
              {
                model: User,
                as: 'dealer',
                attributes: ['id', 'name', 'email', 'company_name', 'language'],
              },
            ],
          },
        ],
        attributes: [
          'id',
          'brand_name',
          'registration_number',
          'model',
          'listing_price',
          'status_id',
          'created_at',
          [Sequelize.fn('COUNT', Sequelize.col('offers.id')), 'total_offers'],
          [Sequelize.fn('MAX', Sequelize.col('offers.offer')), 'highest_offer'],
        ],
        group: ['Listing.id', 'offers.id', 'offers->dealer.id'], // Group by listing ID and include necessary related fields
        order: [['created_at', 'DESC']],
        limit,
        offset,
        subQuery: false,
      });

      // Format the response
      const formattedListings = listings.map((listing) => {
        const listingData = listing.toJSON();
        return {
          listing_details: {
            id: listingData.id,
            brand_name: listingData.brand_name,
            model: listingData.model,
            listing_price: listingData.listing_price,
            status_id: listingData.status_id,
            created_at: listingData.created_at,
            total_offers: parseInt(listingData.total_offers),
            highest_offer: parseFloat(listingData.highest_offer),
          },
          offers: listingData.offers.map((offer) => ({
            id: offer.id,
            offer_amount: offer.offer,
            is_approved: offer.is_approved,
            counter_offer: offer.counter_offer,
            created_at: offer.created_at,
            dealer: offer.dealer,
          })),
        };
      });

      const totalPages = Math.ceil(count.length / limit);

      res.status(200).json({
        listings: formattedListings,
        pagination: {
          currentPage: page,
          totalPages,
          totalListings: count.length,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Error in getAllOffers:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update offer details
  updateOffer: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_approved, counter_offer } = req.body;

      // Find the offer
      const offer = await Offer.findOne({
        where: { id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: ['id', 'status_id'],
          },
        ],
      });

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Check if listing is still available or has counter offer
      if (![1, 3].includes(offer.listing.status_id)) {
        return res.status(400).json({
          error: 'Cannot update offer. Listing is no longer available.',
          listing_status: offer.listing.status_id,
        });
      }

      // Update offer
      const updateData = {};
      if (typeof is_approved !== 'undefined')
        updateData.is_approved = is_approved;
      if (typeof counter_offer !== 'undefined')
        updateData.counter_offer = counter_offer;

      // If there's a counter offer, update listing status to 3 (counter offered)
      if (counter_offer) {
        await Listing.update(
          { status_id: 3 },
          { where: { id: offer.listing_id } }
        );
      }

      await offer.update(updateData);

      // Fetch updated offer with relations
      const updatedOffer = await Offer.findOne({
        where: { id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'brand_name',
              'model',
              'listing_price',
              'status_id',
              'created_at',
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
      });

      res.status(200).json({
        message: 'Offer updated successfully',
        offer: updatedOffer,
      });
    } catch (error) {
      console.error('Error in updateOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Make counter offer
  // an email with the counter offfer will be sent to the dealer
  // a button will be in the mail and when clicked it will post to accept-counter-offer with offer id
  // accept counter offer will set the is_approved field to true and assign the listing to the dealer and move to purchased

  makeCounterOffer: async (req, res) => {
    try {
      const { counter_offer, offer_id } = req.body;

      // Validate counter offer
      if (!counter_offer || isNaN(counter_offer) || counter_offer <= 0) {
        return res.status(400).json({
          error: 'Valid counter_offer amount is required',
        });
      }

      // Validate offer_id
      if (!offer_id) {
        return res.status(400).json({
          error: 'offer_id is required',
        });
      }

      // Find the offer with listing information
      const offer = await Offer.findOne({
        where: { id: offer_id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'status_id',
              'listing_price',
              'registration_number',
              'brand_name',
              'model',
              'first_registration',
              'km_stand',
              'fuel_type',
              'transmission_type',
            ],
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                attributes: ['id', 'url'],
                order: [['id', 'ASC']],
              },
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
      });

      if (!offer) {
        return res
          .status(404)
          .json({ error: 'Offer not found for this listing' });
      }

      // Check if listing is in a valid state for counter offer
      if (![1, 3].includes(offer.listing.status_id)) {
        return res.status(400).json({
          error: 'Cannot make counter offer. Listing is no longer available.',
          listing_status: offer.listing.status_id,
        });
      }

      // Update offer with counter offer
      await offer.update({
        counter_offer: counter_offer,
        is_approved: false, // Reset approval status when making counter offer
      });

      // Update listing status to counter offered (3)
      await Listing.update(
        { status_id: 3 },
        { where: { id: offer.listing_id } }
      );

      // Send email to dealer
      try {
        await emailService.sendCounterOfferEmail(
          offer.dealer.email,
          offer.dealer.name,
          offer.listing,
          offer.offer,
          counter_offer,
          offer_id,
          offer.dealer.language || 'en'
        );
      } catch (emailError) {
        console.error('Failed to send counter offer email:', emailError);
        // Don't fail the counter offer if email sending fails
      }

      // Get updated offer with all relations
      const updatedOffer = await Offer.findOne({
        where: { id: offer_id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'brand_name',
              'registration_number',
              'model',
              'listing_price',
              'status_id',
              'created_at',
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
      });

      res.status(200).json({
        message: 'Counter offer made successfully',
        offer: updatedOffer,
      });
    } catch (error) {
      console.error('Error in makeCounterOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Accept counter offer
  acceptCounterOffer: async (req, res) => {
    try {
      const { offer_id } = req.params;
      console.log('accepted counter offer_id', offer_id);
      // Find the offer with listing information
      const offer = await Offer.findOne({
        where: { id: offer_id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: ['id', 'status_id', 'listing_price'],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
      });

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Check if listing is in a valid state
      if (![1, 3].includes(offer.listing.status_id)) {
        return res.status(400).json({
          error: 'Cannot accept counter offer. Listing is no longer available.',
          listing_status: offer.listing.status_id,
        });
      }

      // Check if there is a counter offer
      if (!offer.counter_offer) {
        return res.status(400).json({
          error: 'No counter offer exists for this offer',
        });
      }

      // Start a transaction
      const transaction = await Offer.sequelize.transaction();

      try {
        // Update offer
        await offer.update(
          {
            is_approved: true,
          },
          { transaction }
        );

        // Update listing status to sold (4) and assign to dealer
        await Listing.update(
          {
            status_id: 4,
            assigned_to_id: offer.dealer_id,
          },
          {
            where: { id: offer.listing_id },
            transaction,
          }
        );

        // Reject all other offers for this listing
        await Offer.update(
          {
            is_approved: false,
            counter_offer: null,
          },
          {
            where: {
              listing_id: offer.listing_id,
              id: { [Op.ne]: offer_id },
            },
            transaction,
          }
        );

        await transaction.commit();

        res.status(200).json({
          message: 'Counter offer accepted successfully',
          offer: {
            ...offer.toJSON(),
            offer: offer.counter_offer,
            counter_offer: null,
            is_approved: true,
          },
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in acceptCounterOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Accept offer (direct acceptance)
  acceptOffer: async (req, res) => {
    try {
      const { offer_id } = req.body;

      // Validate offer_id
      if (!offer_id) {
        return res.status(400).json({
          error: 'offer_id is required',
        });
      }

      // Find the offer with listing information
      const offer = await Offer.findOne({
        where: { id: offer_id },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',

              'status_id',
              'listing_price',
              'registration_number',
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
      });

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Check if listing is in a valid state for accepting offer
      if (![1, 3].includes(offer.listing.status_id)) {
        return res.status(400).json({
          error: 'Cannot accept offer. Listing is no longer available.',
          listing_status: offer.listing.status_id,
        });
      }

      // Start a transaction to ensure data consistency
      const transaction = await Offer.sequelize.transaction();

      try {
        // Update offer to approved
        await offer.update(
          {
            is_approved: true,
            counter_offer: null, // Clear any counter offers
          },
          { transaction }
        );

        // Update listing status to sold (4) and assign to dealer
        await Listing.update(
          {
            status_id: 4, // Change to status 4 (sold)
            assigned_to_id: offer.dealer_id, // Assign the listing to the dealer
          },
          {
            where: { id: offer.listing_id },
            transaction,
          }
        );

        // Reject all other offers for this listing
        await Offer.update(
          {
            is_approved: false,
            counter_offer: null,
          },
          {
            where: {
              listing_id: offer.listing_id,
              id: { [Op.ne]: offer_id },
            },
            transaction,
          }
        );

        // Notify the AutoMarket API

        await transaction.commit();

        // Get updated offer with all relations
        const updatedOffer = await Offer.findOne({
          where: { id: offer_id },
          include: [
            {
              model: Listing,
              as: 'listing',
              attributes: [
                'id',
                'brand_name',
                'registration_number',
                'model',
                'listing_price',
                'status_id',
                'created_at',
                'assigned_to_id',
              ],
            },
            {
              model: User,
              as: 'dealer',
              attributes: ['id', 'name', 'email', 'company_name', 'language'],
            },
          ],
        });

        res.status(200).json({
          message: 'Offer accepted successfully, listing marked as sold',
          offer: updatedOffer,
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in acceptOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },
  rejectOffer: async (req, res) => {
    try {
      const { offer_id } = req.body;
      const offer = await Offer.findOne({
        where: { id: offer_id },
      });
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }
      await offer.update({ is_rejected: true });
      res.status(200).json({ message: 'Offer rejected successfully' });
    } catch (error) {
      console.error('Error in rejectOffer:', error);
      res.status(500).json({ error: error.message });
    }
  },
  declinedOffers: async (req, res) => {
    try {
      // return all offers where last update time is within the last 24 hours, and is_rejected is true
      const offers = await Offer.findAll({
        where: {
          updated_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          is_rejected: true,
        },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'brand_name',
              'reference_no',
              'model',
              'listing_price',
              'status_id',
              'created_at',
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name', 'language'],
          },
        ],
        order: [['updated_at', 'DESC']],
      });
      res.status(200).json({ offers });
    } catch (error) {
      console.error('Error in declinedOffers:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = offerController;
