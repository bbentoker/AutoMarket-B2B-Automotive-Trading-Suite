const Listing = require('../models/Listing');
const User = require('../models/User');
const ListingPhotos = require('../models/ListingPhotos');
const DamagedParts = require('../models/DamagedParts');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp'); // Add sharp for image processing
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const {
  processListingImages,
  processDamagedPartsImages,
} = require('./s3Service');
const {
  getLogoFilename,
  translateWithGPTEnglishOnly,
  scrapeWithOxylabs,
} = require('./scrapingService');

// Function to translate Mobile.de German data to English using GPT API
const translateMobileDeData = async (data) => {
  try {
    const prompt = `
Translate the following German car data to English and standardize the transmission field:

IMPORTANT RULES:
1. For transmission: Convert to either "Automatic" or "Manual" only
   - "Schaltgetriebe", "Handschaltung", "Manuell" → "Manual"
   - "Automatikgetriebe", "Automatik", "CVT", "Stufenlos" → "Automatic"
2. For fuel type: Convert to standard English terms
   - "Benzin" → "Gasoline"
   - "Diesel" → "Diesel"
   - "Hybrid" → "Hybrid"
   - "Elektro" → "Electric"
3. For condition: Convert to standard English terms
   - "Gebrauchtfahrzeug" → "Used"
   - "Neufahrzeug" → "New"
   - "Unfallfahrzeug" → "Accident-damaged"

Data to translate:
- Transmission: "${data.transmission}"
- Fuel Type: "${data.fuelType}"
- Condition: "${data.condition}"

Please respond ONLY with a JSON object in this exact format:
{
  "transmission": "Manual",
  "fuelType": "Gasoline",
  "condition": "Used"
}`;

    const response = await translateWithGPTEnglishOnly(prompt);

    // Parse the JSON response
    let translatedData;
    try {
      // Clean the response in case it has markdown or extra text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translatedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError.message);
      console.error('GPT Response:', response);

      // Fallback: manual translation
      translatedData = {
        transmission: translateTransmissionManual(data.transmission),
        fuelType: translateFuelTypeManual(data.fuelType),
        condition: translateConditionManual(data.condition),
      };
    }

    return translatedData;
  } catch (error) {
    console.error('GPT translation error:', error.message);

    // Fallback: manual translation
    return {
      transmission: translateTransmissionManual(data.transmission),
      fuelType: translateFuelTypeManual(data.fuelType),
      condition: translateConditionManual(data.condition),
    };
  }
};

// Fallback manual translation functions
const translateTransmissionManual = (transmission) => {
  if (!transmission) return null;
  const lower = transmission.toLowerCase();

  if (
    lower.includes('schaltgetriebe') ||
    lower.includes('handschaltung') ||
    lower.includes('manuell')
  ) {
    return 'Manual';
  }
  if (
    lower.includes('automatik') ||
    lower.includes('cvt') ||
    lower.includes('stufenlos') ||
    lower.includes('doppelkupplung')
  ) {
    return 'Automatic';
  }
  return transmission; // Return original if can't determine
};

const translateFuelTypeManual = (fuelType) => {
  if (!fuelType) return null;
  const lower = fuelType.toLowerCase();

  if (lower.includes('benzin')) return 'Gasoline';
  if (lower.includes('diesel')) return 'Diesel';
  if (lower.includes('hybrid')) return 'Hybrid';
  if (lower.includes('elektro')) return 'Electric';
  if (lower.includes('gas') || lower.includes('lpg')) return 'LPG';

  return fuelType; // Return original if can't determine
};

const translateConditionManual = (condition) => {
  if (!condition) return null;
  const lower = condition.toLowerCase();

  if (lower.includes('gebraucht')) return 'Used';
  if (lower.includes('neu')) return 'New';
  if (lower.includes('unfall')) return 'Accident-damaged';

  return condition; // Return original if can't determine
};

// Function to validate if Mobile.de scraping was successful
const validateMobileDeExtraction = (html, extractedData) => {
  // Check if HTML content is too small (indicates failed page load)
  if (html.length < 1000) {
    return {
      isValid: false,
      reason: `HTML content too small (${html.length} characters), likely failed page load`,
    };
  }

  // Check if essential fields are missing or empty
  const essentialFields = ['title', 'brand', 'model', 'price'];
  const emptyFields = essentialFields.filter(
    (field) =>
      !extractedData[field] ||
      extractedData[field] === 'Unknown' ||
      extractedData[field] === 'Unknown Title' ||
      extractedData[field] === '0' ||
      extractedData[field] === ''
  );

  if (emptyFields.length >= 3) {
    // If 3 or more essential fields are empty/default
    return {
      isValid: false,
      reason: `Too many essential fields are empty: ${emptyFields.join(', ')}`,
    };
  }

  // Check if no images were found (usually indicates page load issue)
  if (extractedData.total_images === 0) {
    return {
      isValid: false,
      reason: 'No images found, likely failed page load',
    };
  }

  // Check if technical data and features are both empty
  if (!extractedData.technical_data && !extractedData.equipment_features) {
    return {
      isValid: false,
      reason: 'No technical data or features found, likely failed page load',
    };
  }

  return {
    isValid: true,
    reason: 'Extraction appears successful',
  };
};

// not used mainly
/**
 * Creates a new listing
 * @param {Object} listingData - The listing data
 * @returns {Promise<Object>} The created listing
 */
const createListing = async (listingData) => {
  const transaction = await sequelize.transaction();
  try {
    // Create the listing with all fields
    const listing = await Listing.create(listingData, { transaction });

    await transaction.commit();
    return listing;
  } catch (error) {
    await transaction.rollback();
    console.error('Error in createListing:', error);
    throw new Error(`Failed to create listing: ${error.message}`);
  }
};

// DEPRECATED: Legacy image processing functions - now using S3 service
// These functions are kept for reference but are no longer used
// They have been replaced by the S3 service functions

/*
// Helper function to encode image to base64 (DEPRECATED - use S3 service)
const encodeImageToBase64 = async (imageUrl, timeout = 5000) => {
  // ... function body commented out for reference
};

// Helper function to process images in batches (DEPRECATED - use S3 service)
const processImagesBatch = async (images, batchSize = 3) => {
  // ... function body commented out for reference
};

// Helper function to compress and process manual images (DEPRECATED - use S3 service)
const processManualImages = async (
  manualImages,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 80
) => {
  // ... function body commented out for reference
};
*/

/**
 * Processes listing images through Car Studio API asynchronously
 * @param {number} listingId - The ID of the listing
 * @returns {Promise<void>}
 */
const processCarStudioImagesAsync = async (listingId) => {
  try {
    console.log(
      `Starting async Car Studio processing for listing ${listingId}`
    );

    // Get listing with photos
    const listing = await Listing.findByPk(listingId, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
      ],
    });

    if (!listing || !listing.photos || listing.photos.length === 0) {
      console.log(`No photos found for listing ${listingId}`);
      return;
    }

    if (listing.car_studio_processed) {
      console.log(`Listing ${listingId} already processed by Car Studio`);
      return;
    }

    // Check Car Studio credits
    const response = await axios.post(
      process.env.CAR_STUDIO_CREDIT_URL,
      {},
      {
        headers: {
          apiKey: process.env.CAR_STUDIO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Car Studio remaining credits response:', response.data);

    if (!response.data?.success || response.data?.return?.totalCredits <= 0) {
      console.log('Insufficient Car Studio credits, skipping processing');
      return;
    }

    const enhancedImageUrls = [];
    const photosToUpdate = [];

    // Process each image
    for (let i = 0; i < listing.photos.length; i++) {
      try {
        const photo = listing.photos[i];
        const formData = new FormData();
        formData.append('images[0].fileUrl', photo.url);
        formData.append(
          'plateImageUrl',
          'https://carstudio.s3.eu-west-1.amazonaws.com/userplate/carstudio/141548c0f39c0efa7879d250d46d4168eb2e36968f0411f7857977789ed49e70.jpg'
        );
        formData.append(
          'platformUrl',
          'https://carstudio.s3.eu-west-1.amazonaws.com/platforms/carstudio/9698706283de60e63e55b5140ddada77d874aade1f4fd37010ee3e9b38f35fc1.jpg'
        );

        const carStudioResponse = await axios.post(
          process.env.CAR_STUDIO_MAIN_URL,
          formData,
          {
            headers: {
              apiKey: process.env.CAR_STUDIO_API_KEY,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (
          carStudioResponse.data?.success &&
          carStudioResponse.data?.return?.afterStudioImages?.length > 0
        ) {
          const enhancedImageUrl =
            carStudioResponse.data.return.afterStudioImages[0].imageUrl;
          enhancedImageUrls.push(enhancedImageUrl);
          photosToUpdate.push({ id: photo.id, url: enhancedImageUrl });
        } else {
          console.log(
            `Car Studio processing failed for image ${i + 1}, keeping original URL`
          );
        }
      } catch (carStudioError) {
        console.error(
          `Error processing image ${i + 1} through Car Studio:`,
          carStudioError.message
        );
      }
    }

    // Update photos with enhanced URLs
    if (photosToUpdate.length > 0) {
      for (const photoUpdate of photosToUpdate) {
        await ListingPhotos.update(
          { url: photoUpdate.url },
          { where: { id: photoUpdate.id } }
        );
      }
      console.log(`Updated ${photosToUpdate.length} photos with enhanced URLs`);
    }

    // Mark listing as processed
    await listing.update({ car_studio_processed: true });
    console.log(`Listing ${listingId} Car Studio processing completed`);
  } catch (error) {
    console.error(
      `Error in async Car Studio processing for listing ${listingId}:`,
      error.message
    );
    // Don't throw error to prevent process from crashing
  }
};

/**
 * Creates a new listing with images and damaged parts
 * @param {Object} data - The listing data including images array, manualImages, damagedParts and damagedPartImages
 * @returns {Promise<Object>} The created listing with images and damaged parts
 */
const createListingWithImages = async (data) => {
  console.log('createListingWithImages: Starting transaction...');
  const transaction = await sequelize.transaction();
  console.log('createListingWithImages: Transaction started successfully');
  try {
    // Extract images array, manualImages, processed damaged parts and expires_in from data
    const {
      images,
      manualImages,
      processedDamagedParts,
      expires_in,
      ...listingData
    } = data;

    listingData.currency = 'euro';
    // Ensure status_id is an integer
    listingData.status_id = listingData.status_id
      ? parseInt(listingData.status_id)
      : 1;
    listingData.status_id = 1;
    // Create the listing
    const listing = await Listing.create(listingData, { transaction });

    // Get logo filename for the listing brand
    let logoFilename = null;
    try {
      console.log(
        '[createListingWithImages] Starting logo matching for brand:',
        listing.brand_name
      );
      logoFilename = await getLogoFilename(listing.toJSON());

      if (logoFilename) {
        console.log(
          '[createListingWithImages] Logo match found:',
          logoFilename
        );
        console.log(
          '[createListingWithImages] Brand:',
          listing.brand_name,
          '-> Logo:',
          logoFilename
        );

        // Update the listing with the matched logo filename
        await listing.update(
          { logo_filename: logoFilename.split(':')[1] },
          { transaction }
        );
        console.log(
          '[createListingWithImages] Logo filename saved to database:',
          logoFilename
        );
      } else {
        console.log(
          '[createListingWithImages] No logo match found for brand:',
          listing.brand_name
        );
      }
    } catch (logoError) {
      console.error(
        '[createListingWithImages] Error getting logo filename:',
        logoError
      );
      // Continue with listing creation even if logo matching fails
    }

    // Process and upload images to S3
    let s3ImageUrls = [];
    try {
      s3ImageUrls = await processListingImages(
        images,
        manualImages,
        listing.id
      );
      console.log(`Successfully uploaded ${s3ImageUrls.length} images to S3`);

      // Car Studio processing will be handled asynchronously after listing creation
    } catch (error) {
      console.error('Error processing images with S3:', error);
      // Continue with listing creation even if images fail
    }

    // Store S3 URLs in database sequentially to preserve order via ID sequence
    let successfulPhotos = [];
    if (s3ImageUrls.length > 0) {
      console.log(
        `Storing ${s3ImageUrls.length} photo URLs in database sequentially to preserve order`
      );

      // Create photos sequentially (not in bulk) to ensure ID order matches input order
      for (let i = 0; i < s3ImageUrls.length; i++) {
        try {
          const photo = await ListingPhotos.create(
            {
              listing_id: listing.id,
              url: s3ImageUrls[i],
            },
            { transaction }
          );
          successfulPhotos.push(photo);
          console.log(
            `✅ Stored photo ${i + 1}/${s3ImageUrls.length} with ID ${photo.id}`
          );
        } catch (error) {
          console.error(`❌ Error storing photo ${i + 1}:`, error);
          // Continue with next photo if one fails
        }
      }

      console.log(
        `Successfully stored ${successfulPhotos.length}/${s3ImageUrls.length} photo URLs in database with ordered IDs`
      );
    }

    if (expires_in) {
      await listing.update({ expiration: expires_in }, { transaction });
    }

    // Process damaged parts if provided
    if (
      processedDamagedParts &&
      Array.isArray(processedDamagedParts) &&
      processedDamagedParts.length > 0
    ) {
      try {
        // Process damaged parts images with S3
        const damagedPartsWithS3 = await processDamagedPartsImages(
          processedDamagedParts,
          listing.id
        );

        // Prepare data for database insertion
        const damagedPartsData = damagedPartsWithS3.map((part) => ({
          listing_id: listing.id,
          part_id: part.part_id,
          photo: part.photo, // S3 URL or null
          description: part.description,
        }));

        // Create all damaged parts at once
        try {
          const damagedPartsResults = await DamagedParts.bulkCreate(
            damagedPartsData,
            {
              transaction,
              ignoreDuplicates: true,
            }
          );
          console.log(
            `Successfully created ${damagedPartsResults.length} damaged parts with S3 URLs`
          );
        } catch (error) {
          console.error('Error bulk creating damaged parts:', error);
          // Fallback to individual creation
          const individualPromises = damagedPartsData.map((partData) =>
            DamagedParts.create(partData, { transaction }).catch((err) => {
              console.error('Error creating individual damaged part:', err);
              return null;
            })
          );
          const individualResults = await Promise.all(individualPromises);
          const successfulDamagedParts = individualResults.filter(
            (part) => part !== null
          );
          console.log(
            `Successfully created ${successfulDamagedParts.length} damaged parts (fallback)`
          );
        }
      } catch (error) {
        console.error('Error processing damaged parts with S3:', error);
        // Continue with listing creation even if damaged parts fail
      }
    }
    // Final state check before commit
    const finalListing = await Listing.findByPk(listing.id, { transaction });

    // Commit the transaction only once
    await transaction.commit();

    // Trigger async Car Studio processing after listing creation
    if (
      s3ImageUrls.length > 0 &&
      (process.env.CAR_STUDIO_ENABLED == 'true' ||
        process.env.CAR_STUDIO_ENABLED == true)
    ) {
      setImmediate(() => {
        processCarStudioImagesAsync(listing.id).catch((error) => {
          console.error(
            'Error in background Car Studio processing:',
            error.message
          );
        });
      });
    }

    return listing;
  } catch (error) {
    await transaction.rollback();
    console.error('Error in createListingWithImages:', error);
    throw new Error(`Failed to create listing: ${error.message}`);
  }
};

/**
 * Retrieves a listing by ID with photos and damaged parts
 * @param {number} id - The ID of the listing to retrieve
 * @returns {Promise<Object>} The listing with photos and damaged parts
 */
const getListing = async (id) => {
  try {
    const listing = await Listing.findByPk(id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url', 'created_at'],
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
        {
          model: DamagedParts,
          as: 'damagedParts',
          attributes: ['id', 'part_id', 'photo', 'description', 'created_at'],
        },
      ],
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Convert to JSON for easier manipulation
    const listingData = listing.toJSON();

    // If listing status_id is 2, find and include the assigned user
    if (listing.status_id === 2 && listing.assigned_to_id) {
      try {
        const assignedUser = await User.findByPk(listing.assigned_to_id, {
          attributes: ['id', 'name', 'email', 'company_name', 'phone_number'],
        });

        if (assignedUser) {
          listingData.assignedUser = assignedUser.toJSON();
        }
      } catch (userError) {
        console.error('Error fetching assigned user:', userError);
        // Continue without assigned user data if there's an error
      }
    }

    return listingData;
  } catch (error) {
    console.error('Error in getListing:', error);
    throw new Error(`Failed to get listing: ${error.message}`);
  }
};

/**
 * Retrieves a listing with translations (for backward compatibility)
 * @param {number} id - The ID of the listing to retrieve
 * @param {string} language - The preferred language (ignored now)
 * @param {string} fallbackLanguage - The fallback language (ignored now)
 * @returns {Promise<Object>} The listing with photos and damaged parts
 */
const getListingWithTranslations = async (
  id,
  language = 'en',
  fallbackLanguage = 'en'
) => {
  try {
    // Use the updated getListing function which includes photos and damaged parts
    return await getListing(id);
  } catch (error) {
    console.error('Error in getListingWithTranslations:', error);
    throw new Error(`Failed to get listing: ${error.message}`);
  }
};

/**
 * Retrieves all listings
 * @param {number} limit - Number of listings per page (optional)
 * @param {number} offset - Number of listings to skip (optional)
 * @param {number} statusId - Filter by status ID (optional)
 * @param {string} input - Search text to filter listings (optional)
 * @returns {Promise<Object>} Object containing listings, total count, and pagination info
 */
const getAllListings = async (
  limit = null,
  offset = 0,
  statusId = null,
  input = null
) => {
  try {
    // Build query options
    const queryOptions = {
      order: [['created_at', 'DESC']], // Order by creation date, newest first
      where: {
        is_deleted: false,
      },
      distinct: true, // Prevent duplicates from associations
    };

    // Add status filter if provided
    if (statusId !== null) {
      if (Array.isArray(statusId)) {
        // If statusId is an array, use Op.in to match any of the values
        queryOptions.where.status_id = { [Op.in]: statusId };
      } else {
        // If statusId is a single value, use exact match
        queryOptions.where.status_id = statusId;
      }
    }

    // Add text search if input is provided
    if (input && input.trim() !== '') {
      const searchTerm = `%${input.trim()}%`;
      queryOptions.where[Op.or] = [
        { brand_name: { [Op.iLike]: searchTerm } },
        { model: { [Op.iLike]: searchTerm } },
        { color: { [Op.iLike]: searchTerm } },
        { fuel_type: { [Op.iLike]: searchTerm } },
        { transmission_type: { [Op.iLike]: searchTerm } },
        { features: { [Op.iLike]: searchTerm } },
        { registration_number: { [Op.iLike]: searchTerm } },
        { vin_number: { [Op.iLike]: searchTerm } },
        { deal_stage: { [Op.iLike]: searchTerm } },
        { horsepower: { [Op.iLike]: searchTerm } },
        sequelize.where(sequelize.cast(sequelize.col('km_stand'), 'varchar'), {
          [Op.iLike]: searchTerm,
        }),
        sequelize.where(
          sequelize.cast(sequelize.col('listing_price'), 'varchar'),
          { [Op.iLike]: searchTerm }
        ),
      ];
    }

    // Add pagination if limit is provided
    if (limit !== null) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
      queryOptions.subQuery = false; // Prevent subquery issues with associations
    } else {
      queryOptions.subQuery = false; // Also prevent subquery issues when no limit
    }

    // Add includes for photos and damaged parts
    queryOptions.include = [
      {
        model: ListingPhotos,
        as: 'photos',
        attributes: ['id', 'url', 'created_at'],
        // Remove the order from here - it causes issues with main query limit
      },
      {
        model: DamagedParts,
        as: 'damagedParts',
        attributes: ['id', 'part_id', 'photo', 'description', 'created_at'],
      },
    ];

    // Get listings with pagination and associated data
    const { count, rows: listings } =
      await Listing.findAndCountAll(queryOptions);

    // Fetch assigned users (reservers) for listings that have assigned_to_id
    const listingsWithReserver = await Promise.all(
      listings.map(async (listing) => {
        const listingData = listing.toJSON();

        if (listing.assigned_to_id) {
          try {
            const reserver = await User.findByPk(listing.assigned_to_id, {
              attributes: [
                'id',
                'name',
                'email',
                'company_name',
                'phone_number',
              ],
            });

            if (reserver) {
              listingData.reserver = reserver.toJSON();
            }
          } catch (error) {
            console.error(
              `Error fetching reserver for listing ${listing.id}:`,
              error
            );
            // Continue without reserver data if there's an error
          }
        }

        return listingData;
      })
    );

    // Return paginated results with metadata
    const response = {
      listings: listingsWithReserver,
      pagination: {
        total: count,
        page: limit ? Math.floor(offset / limit) + 1 : 1,
        limit: limit || count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        hasNext: limit ? offset + limit < count : false,
        hasPrev: offset > 0,
      },
    };

    return response;
  } catch (error) {
    console.error('Error in getAllListings:', error);
    throw new Error(`Failed to get listings: ${error.message}`);
  }
};

/**
 * Retrieves all listings with translations (for backward compatibility)
 * @param {string} language - The preferred language (ignored now)
 * @param {string} fallbackLanguage - The fallback language (ignored now)
 * @param {number} limit - Number of listings per page (optional)
 * @param {number} offset - Number of listings to skip (optional)
 * @param {number} statusId - Filter by status ID (optional)
 * @param {string} input - Search text to filter listings (optional)
 * @returns {Promise<Object>} Object containing listings, total count, and pagination info
 */
const getAllListingsWithTranslations = async (
  language = 'en',
  fallbackLanguage = 'en',
  limit = null,
  offset = 0,
  statusId = null,
  input = null
) => {
  return getAllListings(limit, offset, statusId, input);
};

/**
 * Updates a listing
 * @param {number} id - The ID of the listing to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} The updated listing
 */
const updateListing = async (id, updateData) => {
  const transaction = await sequelize.transaction();
  try {
    const listing = await Listing.findByPk(id);

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Extract images array, manualImages, and processed damaged parts from updateData
    const {
      images,
      manualImages,
      processedDamagedParts,
      ...listingUpdateData
    } = updateData;

    // Update the listing in database
    const updatedListing = await listing.update(listingUpdateData, {
      transaction,
    });

    // Process and update images if provided
    if (images || manualImages) {
      try {
        // Process images and upload to S3 if new images are provided
        const s3ImageUrls = await processListingImages(
          images,
          manualImages,
          listing.id
        );

        if (s3ImageUrls.length > 0) {
          console.log(
            `Successfully uploaded ${s3ImageUrls.length} new images to S3`
          );

          // Delete existing photos
          await ListingPhotos.destroy({
            where: { listing_id: listing.id },
            transaction,
          });

          // Create new photos sequentially to preserve order
          for (let i = 0; i < s3ImageUrls.length; i++) {
            try {
              await ListingPhotos.create(
                {
                  listing_id: listing.id,
                  url: s3ImageUrls[i],
                },
                { transaction }
              );
              console.log(`✅ Updated photo ${i + 1}/${s3ImageUrls.length}`);
            } catch (error) {
              console.error(`❌ Error updating photo ${i + 1}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error processing images during update:', error);
        // Continue with update even if images fail
      }
    }

    // Process damaged parts if provided
    if (
      processedDamagedParts &&
      Array.isArray(processedDamagedParts) &&
      processedDamagedParts.length > 0
    ) {
      try {
        // Delete existing damaged parts
        await DamagedParts.destroy({
          where: { listing_id: listing.id },
          transaction,
        });

        // Separate parts with new images from parts with existing URLs
        const partsWithNewImages = processedDamagedParts.filter(
          (part) => part.image !== null && !part.existingPhotoUrl
        );
        const partsWithExistingUrls = processedDamagedParts.filter(
          (part) => part.existingPhotoUrl
        );
        const partsWithoutImages = processedDamagedParts.filter(
          (part) => part.image === null && !part.existingPhotoUrl
        );

        // Process new images with S3 only for parts that have new image buffers
        let damagedPartsWithS3 = [];
        if (partsWithNewImages.length > 0) {
          damagedPartsWithS3 = await processDamagedPartsImages(
            partsWithNewImages,
            listing.id
          );
        }

        // Combine all damaged parts data for database insertion
        const damagedPartsData = [
          // Parts with new S3 images
          ...damagedPartsWithS3.map((part) => ({
            listing_id: listing.id,
            part_id: part.part_id,
            photo: part.photo, // S3 URL
            description: part.description,
          })),
          // Parts with existing URLs (keep original URLs)
          ...partsWithExistingUrls.map((part) => ({
            listing_id: listing.id,
            part_id: part.part_id,
            photo: part.existingPhotoUrl, // Keep existing URL
            description: part.description,
          })),
          // Parts without images
          ...partsWithoutImages.map((part) => ({
            listing_id: listing.id,
            part_id: part.part_id,
            photo: null, // No image
            description: part.description,
          })),
        ];

        // Create all damaged parts at once
        try {
          const damagedPartsResults = await DamagedParts.bulkCreate(
            damagedPartsData,
            {
              transaction,
              ignoreDuplicates: true,
            }
          );
          console.log(
            `Successfully updated ${damagedPartsResults.length} damaged parts (${partsWithNewImages.length} with new S3 images, ${partsWithExistingUrls.length} with existing URLs, ${partsWithoutImages.length} without images)`
          );
        } catch (error) {
          console.error(
            'Error bulk creating damaged parts during update:',
            error
          );
          // Fallback to individual creation
          const individualPromises = damagedPartsData.map((partData) =>
            DamagedParts.create(partData, { transaction }).catch((err) => {
              console.error(
                'Error creating individual damaged part during update:',
                err
              );
              return null;
            })
          );
          const individualResults = await Promise.all(individualPromises);
          const successfulDamagedParts = individualResults.filter(
            (part) => part !== null
          );
          console.log(
            `Successfully updated ${successfulDamagedParts.length} damaged parts (fallback)`
          );
        }
      } catch (error) {
        console.error('Error processing damaged parts during update:', error);
        // Continue with update even if damaged parts fail
      }
    }

    await transaction.commit();

    // Return fresh instance of the listing with photos and damaged parts
    return await getListing(id);
  } catch (error) {
    await transaction.rollback();
    console.error('Error in updateListing:', error);
    throw new Error(`Failed to update listing: ${error.message}`);
  }
};

/**
 * Soft deletes a listing
 * @param {number} id - The ID of the listing to delete
 * @returns {Promise<Object>} The updated listing
 */
const deleteListing = async (id) => {
  try {
    const listing = await Listing.findByPk(id);

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.is_deleted) {
      throw new Error('Listing is already deleted');
    }

    await listing.update({ is_deleted: true });
    return listing;
  } catch (error) {
    console.error('Error in deleteListing:', error);
    throw new Error(`Failed to delete listing: ${error.message}`);
  }
};

/**
 * Parse ListingSiteA HTML content
 * @param {string} html - HTML content
 * @param {string} url - Listing URL
 * @param {string} advertId - Listing ID
 * @returns {Object} Extracted data
 */
const parseListingSiteAData = (html, url, advertId) => {
  const $ = cheerio.load(html);

  // Helper function to extract detail values
  const extractDetail = (label) => {
    return $(`dt:contains("${label}")`).next('dd').text().trim();
  };

  // Extract data using selectors
  const make = $('.StageTitle_makeModelContainer__RyjBP').text().trim();
  const model = $('.StageTitle_modelVersion__Yof2Z').text().trim();
  const location = $('.scr-link.LocationWithPin_locationItem__tK1m5')
    .text()
    .trim();

  const priceElement = $('.PriceInfo_price__XU0aF');
  const price = priceElement
    .contents()
    .filter(function () {
      return this.type === 'text';
    })
    .text()
    .trim();

  let sellerName = $('.CommonComponents_nameContainer__TtFCL').text().trim();
  if (!sellerName) {
    sellerName = $('.TieredPricingRatingsSection_nameContainer__fMSj2')
      .text()
      .trim();
  }

  // Extract vehicle description and features from various sources
  let vehicleDescription = '';
  let vehicleFeatures = '';

  // Look for vehicle description in various selectors, prioritizing the specific ListingSiteA structure
  const descriptionSelectors = [
    '.SellerNotesSection_content__te2EB', // Primary ListingSiteA vehicle description
    '#sellerNotesSection .SellerNotesSection_content__te2EB',
    '.VehicleDescriptionSection_description__PzgDT',
    '.VehicleDescriptionSection_text__E5sJL',
    '.VehicleDescription_description__text',
    '.description-text',
    '.vehicle-description',
    '[data-testid="vehicle-description"]',
    '.seller-description',
    '.description-content',
    '.listing-description',
  ];

  for (const selector of descriptionSelectors) {
    let desc = $(selector).html() || $(selector).text();
    if (desc) {
      // Convert <br> tags to line breaks and clean up HTML
      desc = desc
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();

      if (desc && desc.length > vehicleDescription.length) {
        vehicleDescription = desc;
      }
    }
  }

  // Look for features in specific sections
  const featureSelectors = [
    '.DataGrid_defaultList__5J_xT', // Common feature list container
    '.EquipmentSection_container__N_e6h',
    '.standard-equipment-list',
    '.optional-equipment-list',
  ];

  const features = [];
  for (const selector of featureSelectors) {
    $(selector)
      .find('li, dt, dd, span')
      .each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 2 && !features.includes(text)) {
          features.push(text);
        }
      });
  }

  if (features.length > 0) {
    vehicleFeatures = features.join('. ');
  }

  // Fallback: Try to extract description/features from text content if structured extraction failed
  if (!vehicleDescription || !vehicleFeatures) {
    const pageText = $('body').text();
    // Look for description in text using common headers
    const descriptionHeaders = [
      'Vehicle description',
      'Beschreibung',
      'Beschrijving',
      'Description',
    ];
    for (const header of descriptionHeaders) {
      const regex = new RegExp(`${header}\\s*([\\s\\S]{50,1500})`, 'i');
      const match = pageText.match(regex);
      if (match && match[1] && !vehicleDescription) {
        vehicleDescription = match[1].trim();
      }
    }
  }

  // Try to extract features from description if vehicleFeatures is empty
  // (ListingSiteA often puts features in the description box)
  if (!vehicleFeatures && vehicleDescription) {
    const descriptionFeatures = [];
    const lines = vehicleDescription.split('\n').slice(0, 10);
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      // Look for specification lines - stricter criteria
      if (
        trimmedLine.includes(':') &&
        trimmedLine.length > 5 &&
        trimmedLine.length < 80 &&
        !trimmedLine.includes('€') &&
        !trimmedLine.includes('http') &&
        !trimmedLine.includes('mvg') &&
        !trimmedLine.includes('tel') &&
        !trimmedLine.includes('afspraak') &&
        !trimmedLine.includes('Voorbehouden')
      ) {
        descriptionFeatures.push(trimmedLine);
      }
      // Look for key info lines (engine, power, etc.) - stricter
      if (
        trimmedLine.match(/\d+cc|KW|PK|Euro \d/) &&
        trimmedLine.length < 50 &&
        !trimmedLine.includes('Voorbehouden')
      ) {
        descriptionFeatures.push(trimmedLine);
      }
    });

    // Add description features to main features - strict limit
    if (descriptionFeatures.length > 0) {
      const limitedDescFeatures = descriptionFeatures.slice(0, 10).join('. ');
      if (vehicleFeatures.length < 1500) {
        // Only add if not already too long
        if (vehicleFeatures) {
          vehicleFeatures += '. ' + limitedDescFeatures;
        } else {
          vehicleFeatures = limitedDescFeatures;
        }
      }
    }
  }

  // Final safety check to prevent extremely long feature strings
  if (vehicleFeatures.length > 2500) {
    vehicleFeatures = vehicleFeatures.substring(0, 2500) + '...';
  }

  // If no description found, create one from features
  if (!vehicleDescription && vehicleFeatures) {
    vehicleDescription = vehicleFeatures;
  }

  // Ensure vehicle description is not too long either
  if (vehicleDescription && vehicleDescription.length > 3000) {
    vehicleDescription = vehicleDescription.substring(0, 3000) + '...';
  }

  // Extract all images from the image gallery container
  const imageUrls = [];
  $('.image-gallery-content.image-gallery-thumbnails-bottom img').each(
    (index, element) => {
      const imgSrc = $(element).attr('src');
      if (imgSrc && !imgSrc.includes('data:image')) {
        // Filter out data URLs
        imageUrls.push(imgSrc);
      }
    }
  );

  // Also try alternative selectors if the main one doesn't work
  if (imageUrls.length === 0) {
    $('.image-gallery-content img').each((index, element) => {
      const imgSrc = $(element).attr('src');
      if (imgSrc && !imgSrc.includes('data:image')) {
        imageUrls.push(imgSrc);
      }
    });
  }

  // Fallback to any img tags if still no images found
  if (imageUrls.length === 0) {
    $('img').each((index, element) => {
      const imgSrc = $(element).attr('src');
      if (
        imgSrc &&
        !imgSrc.includes('data:image') &&
        imgSrc.includes('listingsitea')
      ) {
        imageUrls.push(imgSrc);
      }
    });
  }

  // Process image URLs to ensure they are all 1920x1080
  const processedImageUrls = imageUrls.map((imgUrl) => {
    // Remove any existing dimension parameters
    let cleanUrl = imgUrl.replace(/\/\d+x\d+\.(webp|jpg|jpeg|png)/, '');

    // Add 1920x1080.webp dimension
    if (cleanUrl.includes('.jpg') || cleanUrl.includes('.jpeg')) {
      cleanUrl = cleanUrl.replace(/\.(jpg|jpeg)$/, '.jpg/1920x1080.webp');
    } else if (cleanUrl.includes('.png')) {
      cleanUrl = cleanUrl.replace(/\.png$/, '.png/1920x1080.webp');
    } else {
      // If no extension found, assume it's a jpg and add the dimension
      cleanUrl = cleanUrl + '/1920x1080.webp';
    }

    return cleanUrl;
  });

  // Remove duplicates while preserving order
  const uniqueImageUrls = [...new Set(processedImageUrls)];

  console.log('Found image URLs:', imageUrls);
  console.log('Total images found:', imageUrls.length);
  console.log('Processed image URLs (1920x1080):', uniqueImageUrls);
  console.log('Total processed images:', uniqueImageUrls.length);

  // Extract all the details
  const bodyType = extractDetail('Body type');
  const type = extractDetail('Type');
  const drivetrain = extractDetail('Drivetrain');
  const seats = extractDetail('Seats');
  const doors = extractDetail('Doors');
  const countryVersion = extractDetail('Country version');
  const colour = extractDetail('Colour');
  const paint = extractDetail('Paint');
  const upholsteryColour = extractDetail('Upholstery colour');
  const upholstery = extractDetail('Upholstery');
  const emissionClass = extractDetail('Emission class');
  const fuelTypeRaw = extractDetail('Fuel type');
  const fuelConsumption = extractDetail('Fuel consumption');
  const co2Emissions = extractDetail('CO₂-emissions');
  const powerRaw = extractDetail('Power');
  const gearbox = extractDetail('Gearbox');
  const engineSize = extractDetail('Engine size');
  const gears = extractDetail('Gears');
  const cylinders = extractDetail('Cylinders');
  const emptyWeight = extractDetail('Empty weight');
  const mileageRaw = extractDetail('Mileage');
  const firstRegistrationRaw = extractDetail('First registration');
  const lastService = extractDetail('Last service');
  const previousOwner = extractDetail('Previous owner');
  const fullServiceHistory = extractDetail('Full service history');

  // Process mileage
  const extractFirstMileageValue = (mileageRaw) => {
    if (!mileageRaw || typeof mileageRaw !== 'string') {
      return null;
    }
    const kmPattern = /(\d{1,3}(?:[.,\s]\d{3})*|\d+)\s*km/gi;
    const matches = Array.from(mileageRaw.matchAll(kmPattern));
    if (matches.length === 0) {
      return null;
    }
    const firstMatch = matches[0][0];
    return firstMatch.replace(/\s+/g, ' ').trim();
  };

  const mileage = extractFirstMileageValue(mileageRaw);

  // Process first registration date
  let firstRegistration = null;
  if (
    firstRegistrationRaw != null &&
    firstRegistrationRaw != '-' &&
    firstRegistrationRaw != ''
  ) {
    const [month, year] = firstRegistrationRaw.split('/');
    firstRegistration = new Date(`01-${month}-${year}`).toISOString();
  }

  // Compile all extracted data
  const extractedData = {
    listingsitea_id: advertId,
    make: make || 'Unknown Make',
    model: model || 'Unknown Model',
    location: location || 'Unknown Location',
    price: parseFloat(price.replace(/[^0-9.]/g, '')) || 0,
    seller_name: sellerName || 'Unknown Seller',
    body_type: bodyType || 'Unknown Body Type',
    type: type || 'Unknown Type',
    drivetrain: drivetrain || 'Unknown Drivetrain',
    seats: parseInt(seats) || null,
    doors: parseInt(doors) || null,
    color: colour || 'Unknown Colour',
    paint: paint || 'Unknown Paint',
    upholstery_color: upholsteryColour || 'Unknown Upholstery Colour',
    upholstery: upholstery || 'Unknown Upholstery',
    emission_class: emissionClass || 'Unknown Emission Class',
    fuel_type: fuelTypeRaw || 'Unknown Fuel Type',
    fuel_consumption: fuelConsumption || 'Unknown Fuel Consumption',
    co_2_emissions: co2Emissions || 'Unknown CO₂ Emissions',
    power: powerRaw || 'Unknown Power',
    gearbox: gearbox || 'Unknown Gearbox',
    engine_size: engineSize || 'Unknown Engine Size',
    gears: parseInt(gears) || null,
    cylinders: parseInt(cylinders) || null,
    empty_weight: emptyWeight || 'Unknown Empty Weight',
    mileage: mileage || 'Unknown Mileage',
    first_registration: firstRegistration || null,
    last_service: lastService || 'Unknown Last Service',
    previous_owner: parseInt(previousOwner) || null,
    full_service_history: fullServiceHistory === 'Yes',
    vehicle_description: vehicleDescription || null,
    vehicle_features: vehicleFeatures || null,
    original_image_urls: uniqueImageUrls.length > 0 ? uniqueImageUrls : null,
    main_image_url: uniqueImageUrls.length > 0 ? uniqueImageUrls[0] : null,
    total_images: uniqueImageUrls.length,
  };

  // Log all the scraped data
  console.log('=== LISTING_SITE_A SCRAPED DATA ===');
  console.log('URL:', url);
  console.log('Advert ID:', advertId);
  console.log('Total Images Found:', uniqueImageUrls.length);
  console.log('Image URLs (1920x1080):', uniqueImageUrls);
  console.log('Vehicle Description:', vehicleDescription || 'Not found');
  console.log('Vehicle Features:', vehicleFeatures || 'Not found');
  console.log('Extracted Data:', JSON.stringify(extractedData, null, 2));
  console.log('=== END LISTING_SITE_A SCRAPED DATA ===');

  return {
    url,
    advertId,
    totalImages: uniqueImageUrls.length,
    imageUrls: uniqueImageUrls,
    mainImageUrl: uniqueImageUrls.length > 0 ? uniqueImageUrls[0] : null,
    extractedData,
  };
};

/**
 * Extract listing data from ListingSiteA URL (renders page and saves HTML content)
 * @param {string} url - The ListingSiteA URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractListingSiteAListing = async (url, oldVersion = false) => {
  if (oldVersion) {
    console.log('[extractListingSiteAListing] Using legacy Puppeteer version');
    // Get configurable global timeout
    const GLOBAL_TIMEOUT =
      parseInt(process.env.LISTING_SITE_A_GLOBAL_TIMEOUT) || 300000;

    // Wrap the entire function with a global timeout to prevent hanging
    return Promise.race([
      extractListingSiteAListingInternal(url),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `ListingSiteA scraping timeout: Operation exceeded ${GLOBAL_TIMEOUT / 1000} seconds`
              )
            ),
          GLOBAL_TIMEOUT
        )
      ),
    ]);
  }

  try {
    console.log('[extractListingSiteAListing] Calling Oxylabs API for URL:', url);
    const html = await scrapeWithOxylabs(url);

    if (!html || html.length < 100) {
      throw new Error('Oxylabs returned empty or too short content');
    }

    // Extract advert ID from URL
    const urlMatch = url.match(/\/offers\/[^\/]+-([a-z0-9-]+)/);
    const advertId = urlMatch ? urlMatch[1] : 'unknown';

    return parseListingSiteAData(html, url, advertId);
  } catch (error) {
    console.error('[extractListingSiteAListing] Error using Oxylabs:', error);
    throw error;
  }
};

const extractListingSiteAListingInternal = async (url) => {
  let browser = null;
  try {
    // Extract the advert ID from the URL (supports multiple formats)
    let urlMatch = url.match(/\/(\d+)(?:\/|$|\?)/);
    if (!urlMatch) {
      // Try UUID format - handle both with and without query parameters
      // Look for UUID at the end of the path, before query parameters
      urlMatch = url.match(
        /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\?|$)/
      );
    }
    if (!urlMatch) {
      throw new Error(
        'Invalid ListingSiteA URL format. Expected numeric ID or UUID format.'
      );
    }
    const advertId = urlMatch[1];

    // Use Puppeteer to render the page
    const puppeteer = require('puppeteer');
    const {
      getPuppeteerConfigForScraping,
    } = require('../utils/puppeteerConfig');

    // Get configurable timeouts from environment variables
    const BROWSER_TIMEOUT =
      parseInt(process.env.LISTING_SITE_A_BROWSER_TIMEOUT) || 180000;
    const NAVIGATION_TIMEOUT =
      parseInt(process.env.LISTING_SITE_A_NAVIGATION_TIMEOUT) || 180000;
    const GLOBAL_TIMEOUT =
      parseInt(process.env.LISTING_SITE_A_GLOBAL_TIMEOUT) || 300000;

    console.log('[extractListingSiteAListingInternal] Using timeouts:', {
      browserTimeout: BROWSER_TIMEOUT,
      navigationTimeout: NAVIGATION_TIMEOUT,
      globalTimeout: GLOBAL_TIMEOUT,
    });

    // Get production-optimized browser configuration
    const browserConfig = getPuppeteerConfigForScraping({
      timeout: BROWSER_TIMEOUT, // Configurable timeout for production
      protocolTimeout: BROWSER_TIMEOUT,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--disable-plugins',
        '--disable-accelerated-2d-canvas',
      ],
    });

    console.log('[extractListingSiteAListing] Launching browser with config:', {
      executablePath: browserConfig.executablePath,
      timeout: browserConfig.timeout,
      argsCount: browserConfig.args.length,
    });

    // Launch browser with production-optimized settings and retry logic
    let browserLaunchRetries = 0;
    const maxBrowserRetries = 3;

    while (browserLaunchRetries < maxBrowserRetries) {
      try {
        browser = await puppeteer.launch(browserConfig);
        console.log(
          '[extractListingSiteAListing] Browser launched successfully on attempt:',
          browserLaunchRetries + 1
        );
        break;
      } catch (launchError) {
        browserLaunchRetries++;
        console.log(
          `[extractListingSiteAListing] Browser launch attempt ${browserLaunchRetries} failed:`,
          launchError.message
        );

        if (browserLaunchRetries >= maxBrowserRetries) {
          throw new Error(
            `Browser launch failed after ${maxBrowserRetries} attempts: ${launchError.message}`
          );
        }

        // Wait before retry
        console.log(
          `[extractListingSiteAListing] Retrying browser launch in 3 seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    const page = await browser.newPage();

    // Set page error handlers
    page.on('error', (err) => {
      console.log('[extractListingSiteAListing] Page error:', err.message);
    });

    page.on('pageerror', (err) => {
      console.log('[extractListingSiteAListing] Page script error:', err.message);
    });

    // Set realistic user agent and headers
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*; q = 0.8',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    });

    await page.setViewport({ width: 1920, height: 1080 });

    // Set additional page configurations for better reliability
    await page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
    await page.setDefaultTimeout(NAVIGATION_TIMEOUT);

    // Navigate to the URL with retry logic
    console.log('[extractListingSiteAListing] Navigating to URL:', url);
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster loading
          timeout: NAVIGATION_TIMEOUT,
        });
        console.log(
          '[extractListingSiteAListing] Navigation successful on attempt:',
          retryCount + 1
        );
        break;
      } catch (navigationError) {
        retryCount++;
        console.log(
          `[extractListingSiteAListing] Navigation attempt ${retryCount} failed:`,
          navigationError.message
        );

        if (retryCount >= maxRetries) {
          throw new Error(
            `Navigation failed after ${maxRetries} attempts: ${navigationError.message}`
          );
        }

        // Wait before retry
        console.log(`[extractListingSiteAListing] Retrying in 2 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Wait for page to fully load and stabilize
    console.log('[extractListingSiteAListing] Waiting for page to stabilize...');
    try {
      // Wait for either the main content or a reasonable timeout
      await Promise.race([
        page.waitForSelector('.StageTitle_makeModelContainer__RyjBP', {
          timeout: 30000,
        }),
        page.waitForSelector('.PriceInfo_price__XU0aF', { timeout: 30000 }),
        new Promise((resolve) => setTimeout(resolve, 10000)), // Fallback timeout
      ]);
      console.log('[extractListingSiteAListing] Page content detected');
    } catch (waitError) {
      console.log(
        '[extractListingSiteAListing] Content wait timeout, proceeding with extraction:',
        waitError.message
      );
    }

    // Additional wait for dynamic content
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get the full HTML content
    const html = await page.content();

    // Save HTML content for inspection
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlHash = crypto
      .createHash('md5')
      .update(url)
      .digest('hex')
      .substring(0, 8);
    const filename = `listingsitea-${timestamp}-${urlHash}.html`;
    const filepath = path.join(__dirname, '..', '..', filename);

    try {
      // fs.writeFileSync(filepath, html, 'utf8');
      console.log(`ListingSiteA HTML saved to: ${filepath}`);
    } catch (writeError) {
      console.error('Failed to save ListingSiteA HTML:', writeError.message);
    }

    // Use Cheerio to parse the HTML and extract data
    const $ = cheerio.load(html);

    // Extract data using the same selectors from the provided file
    const make = $('.StageTitle_makeModelContainer__RyjBP').text().trim();
    const model = $('.StageTitle_modelVersion__Yof2Z').text().trim();
    const location = $('.scr-link.LocationWithPin_locationItem__tK1m5')
      .text()
      .trim();

    const priceElement = $('.PriceInfo_price__XU0aF');
    const price = priceElement
      .contents()
      .filter(function () {
        return this.type === 'text';
      })
      .text()
      .trim();

    let sellerName = $('.CommonComponents_nameContainer__TtFCL').text().trim();
    if (!sellerName) {
      sellerName = $('.TieredPricingRatingsSection_nameContainer__fMSj2')
        .text()
        .trim();
    }

    // Helper function to extract detail values
    const extractDetail = (label) => {
      return $(`dt:contains("${label}")`).next('dd').text().trim();
    };

    // Extract vehicle description and features from various sources
    let vehicleDescription = '';
    let vehicleFeatures = '';

    // Look for vehicle description in various selectors, prioritizing the specific ListingSiteA structure
    const descriptionSelectors = [
      '.SellerNotesSection_content__te2EB', // Primary ListingSiteA vehicle description
      '#sellerNotesSection .SellerNotesSection_content__te2EB',
      '.VehicleDescriptionSection_description__PzgDT',
      '.VehicleDescriptionSection_text__E5sJL',
      '.VehicleDescription_description__text',
      '.description-text',
      '.vehicle-description',
      '[data-testid="vehicle-description"]',
      '.seller-description',
      '.description-content',
      '.listing-description',
    ];

    for (const selector of descriptionSelectors) {
      let desc = $(selector).html() || $(selector).text();
      if (desc) {
        // Convert <br> tags to line breaks and clean up HTML
        desc = desc
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();

        if (desc && desc.length > vehicleDescription.length) {
          vehicleDescription = desc;
        }
      }
    }

    // Look for JSON-LD structured data containing description
    $('script[type="application/ld+json"]').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        try {
          const jsonData = JSON.parse(scriptContent);
          if (jsonData.description && !vehicleDescription) {
            vehicleDescription = jsonData.description;
          }
          // Look for additional product details
          if (jsonData.name) {
            vehicleFeatures += jsonData.name + '. ';
          }
          if (jsonData.brand && jsonData.brand.name) {
            vehicleFeatures += `Brand: ${jsonData.brand.name}. `;
          }
          if (jsonData.color) {
            vehicleFeatures += `Color: ${jsonData.color}. `;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
    });

    // Extract features from any text content that looks like specifications
    const specTexts = [];

    // Look for technical specifications with better filtering
    $('dt, th, .spec-label, .detail-label, [class*="label"]').each(
      (index, element) => {
        const label = $(element).text().trim();
        const nextElement = $(element).next();
        const value = nextElement.text().trim();

        // Filter out CSS-related content and ensure meaningful specs
        if (
          label &&
          value &&
          value.length > 0 &&
          value.length < 100 &&
          !label.toLowerCase().includes('color') && // Exclude CSS color labels
          !value.includes('var(') && // Exclude CSS variables
          !value.includes('rgb(') && // Exclude CSS rgb values
          !value.match(/^\d+p$/) && // Exclude CSS pixel values
          !value.includes(':') && // Exclude CSS property values
          !label.includes('font') && // Exclude font-related CSS
          label.length > 2
        ) {
          // Ensure meaningful labels
          specTexts.push(`${label}: ${value}`);
        }
      }
    );

    // Look for description patterns in page text
    const pageText = $.text();
    const descriptionPatterns = [
      /Vehicle Description[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+:|$)/i,
      /Description[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+:|$)/i,
      /Details[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+:|$)/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = pageText.match(pattern);
      if (match && match[1] && match[1].length > vehicleDescription.length) {
        vehicleDescription = match[1].trim();
      }
    }

    // Extract key vehicle information from text patterns with better filtering
    const extractedInfo = [];

    // More precise patterns with context to avoid CSS matches
    const precisePatterns = [
      // Power patterns (avoid CSS px values)
      /(?:Power|Vermogen)[:\s]*(\d+\s*kW\s*\(\s*\d+\s*hp?\))/gi,
      /(?:Power|Vermogen)[:\s]*(\d+\s*kW)/gi,
      /(?:Power|Vermogen)[:\s]*(\d+\s*hp?)/gi,

      // Engine displacement (avoid small CC values that might be CSS)
      /(?:Engine size|Motor)[:\s]*(\d{3,4}\s*cc)/gi,
      /(\d{4}\s*cc)/g, // Only 4-digit cc values

      // Fuel type (with context)
      /(?:Fuel type|Brandstof)[:\s]*(Diesel|Benzine|Gasoline|Electric|Hybrid)/gi,

      // Transmission (with context)
      /(?:Gearbox|Transmissie)[:\s]*(Automatic|Manual|Automaat|Manueel)/gi,

      // Euro emission (with context)
      /(?:Emission class|Emissieklasse)[:\s]*(Euro\s*\d+[a-z\-]*)/gi,

      // Mileage (with context to avoid CSS pixel values)
      /(?:Mileage|Kilometerstand)[:\s]*(\d{1,3}[.,]\d{3}\s*km)/gi,

      // Registration date
      /(?:First registration|Eerste inschrijving)[:\s]*(\d{2}\/\d{4})/gi,

      // Color (with context, avoid CSS color values)
      /(?:Colour|Kleur)[:\s]*([A-Z][a-z]+)(?![:\(])/gi,

      // Body type
      /(?:Body type|Carrosserie)[:\s]*([A-Z][a-z]+)/gi,

      // Doors and seats
      /(?:Doors|Deuren)[:\s]*(\d)/gi,
      /(?:Seats|Zitplaatsen)[:\s]*(\d)/gi,
    ];

    for (const pattern of precisePatterns) {
      const matches = pageText.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // Clean up the match and avoid duplicates
          const cleanMatch = match.replace(/\s+/g, ' ').trim();
          if (
            cleanMatch.length > 3 &&
            cleanMatch.length < 100 &&
            !extractedInfo.includes(cleanMatch) &&
            !cleanMatch.includes('color:') && // Exclude CSS
            !cleanMatch.includes('var(') && // Exclude CSS variables
            !cleanMatch.match(/^\d+p$/)
          ) {
            // Exclude CSS pixel values
            extractedInfo.push(cleanMatch);
          }
        });
      }
    }

    // Combine all features into one string with final cleanup
    const allFeatures = [
      ...specTexts,
      ...extractedInfo.filter((info) => info && info.trim().length > 2),
    ];

    // Additional cleanup to remove CSS-related content
    const cleanFeatures = allFeatures.filter((feature) => {
      const cleanFeature = feature.toLowerCase();
      return (
        !cleanFeature.includes('color:') &&
        !cleanFeature.includes('var(') &&
        !cleanFeature.includes('rgb(') &&
        !cleanFeature.includes('px') &&
        !cleanFeature.includes('em') &&
        !cleanFeature.includes('rem') &&
        !cleanFeature.includes('inherit') &&
        !cleanFeature.includes('transparent') &&
        !cleanFeature.match(/^\d+p$/) &&
        !cleanFeature.match(/^\d+p\b/) &&
        feature.length > 3 &&
        feature.length < 150
      );
    });

    // Limit the total number of features to prevent overflow
    const limitedCleanFeatures = cleanFeatures.slice(0, 25);
    vehicleFeatures += limitedCleanFeatures.join('. ');

    // Add hard limit to prevent extremely long feature strings
    if (vehicleFeatures.length > 2000) {
      vehicleFeatures = vehicleFeatures.substring(0, 2000) + '...';
    }

    // Extract additional features from the vehicle description if found
    if (vehicleDescription) {
      const descriptionFeatures = [];

      // Extract features marked with asterisks (*feature) - limit to first 15
      const asteriskFeatures = vehicleDescription.match(/\*([^*\n]+)/g);
      if (asteriskFeatures) {
        asteriskFeatures.slice(0, 15).forEach((feature) => {
          const cleanFeature = feature.replace('*', '').trim();
          if (
            cleanFeature.length > 2 &&
            cleanFeature.length < 50 &&
            !cleanFeature.includes('€') &&
            !cleanFeature.includes('http') &&
            !cleanFeature.match(/\d{4,}/) &&
            !cleanFeature.includes('mvg') &&
            !cleanFeature.includes('tel') &&
            !cleanFeature.includes('km 150')
          ) {
            descriptionFeatures.push(cleanFeature);
          }
        });
      }

      // Extract key specs from description lines - only first 10 lines
      const lines = vehicleDescription.split('\n').slice(0, 10);
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        // Look for specification lines - stricter criteria
        if (
          trimmedLine.includes(':') &&
          trimmedLine.length > 5 &&
          trimmedLine.length < 80 &&
          !trimmedLine.includes('€') &&
          !trimmedLine.includes('http') &&
          !trimmedLine.includes('mvg') &&
          !trimmedLine.includes('tel') &&
          !trimmedLine.includes('afspraak') &&
          !trimmedLine.includes('Voorbehouden')
        ) {
          descriptionFeatures.push(trimmedLine);
        }
        // Look for key info lines (engine, power, etc.) - stricter
        if (
          trimmedLine.match(/\d+cc|KW|PK|Euro \d/) &&
          trimmedLine.length < 50 &&
          !trimmedLine.includes('Voorbehouden')
        ) {
          descriptionFeatures.push(trimmedLine);
        }
      });

      // Add description features to main features - strict limit
      if (descriptionFeatures.length > 0) {
        const limitedDescFeatures = descriptionFeatures.slice(0, 10).join('. ');
        if (vehicleFeatures.length < 1500) {
          // Only add if not already too long
          if (vehicleFeatures) {
            vehicleFeatures += '. ' + limitedDescFeatures;
          } else {
            vehicleFeatures = limitedDescFeatures;
          }
        }
      }
    }

    // Final safety check to prevent extremely long feature strings
    if (vehicleFeatures.length > 2500) {
      vehicleFeatures = vehicleFeatures.substring(0, 2500) + '...';
    }

    // If no description found, create one from features
    if (!vehicleDescription && vehicleFeatures) {
      vehicleDescription = vehicleFeatures;
    }

    // Ensure vehicle description is not too long either
    if (vehicleDescription && vehicleDescription.length > 3000) {
      vehicleDescription = vehicleDescription.substring(0, 3000) + '...';
    }

    // Extract all images from the image gallery container
    const imageUrls = [];
    $('.image-gallery-content.image-gallery-thumbnails-bottom img').each(
      (index, element) => {
        const imgSrc = $(element).attr('src');
        if (imgSrc && !imgSrc.includes('data:image')) {
          // Filter out data URLs
          imageUrls.push(imgSrc);
        }
      }
    );

    // Also try alternative selectors if the main one doesn't work
    if (imageUrls.length === 0) {
      $('.image-gallery-content img').each((index, element) => {
        const imgSrc = $(element).attr('src');
        if (imgSrc && !imgSrc.includes('data:image')) {
          imageUrls.push(imgSrc);
        }
      });
    }

    // Fallback to any img tags if still no images found
    if (imageUrls.length === 0) {
      $('img').each((index, element) => {
        const imgSrc = $(element).attr('src');
        if (
          imgSrc &&
          !imgSrc.includes('data:image') &&
          imgSrc.includes('listingsitea')
        ) {
          imageUrls.push(imgSrc);
        }
      });
    }

    // Process image URLs to ensure they are all 1920x1080
    const processedImageUrls = imageUrls.map((imgUrl) => {
      // Remove any existing dimension parameters
      let cleanUrl = imgUrl.replace(/\/\d+x\d+\.(webp|jpg|jpeg|png)/, '');

      // Add 1920x1080.webp dimension
      if (cleanUrl.includes('.jpg') || cleanUrl.includes('.jpeg')) {
        cleanUrl = cleanUrl.replace(/\.(jpg|jpeg)$/, '.jpg/1920x1080.webp');
      } else if (cleanUrl.includes('.png')) {
        cleanUrl = cleanUrl.replace(/\.png$/, '.png/1920x1080.webp');
      } else {
        // If no extension found, assume it's a jpg and add the dimension
        cleanUrl = cleanUrl + '/1920x1080.webp';
      }

      return cleanUrl;
    });

    // Remove duplicates while preserving order
    const uniqueImageUrls = [...new Set(processedImageUrls)];

    console.log('Found image URLs:', imageUrls);
    console.log('Total images found:', imageUrls.length);
    console.log('Processed image URLs (1920x1080):', uniqueImageUrls);
    console.log('Total processed images:', uniqueImageUrls.length);

    // Extract all the details
    const bodyType = extractDetail('Body type');
    const type = extractDetail('Type');
    const drivetrain = extractDetail('Drivetrain');
    const seats = extractDetail('Seats');
    const doors = extractDetail('Doors');
    const countryVersion = extractDetail('Country version');
    const colour = extractDetail('Colour');
    const paint = extractDetail('Paint');
    const upholsteryColour = extractDetail('Upholstery colour');
    const upholstery = extractDetail('Upholstery');
    const emissionClass = extractDetail('Emission class');
    const fuelTypeRaw = extractDetail('Fuel type');
    const fuelConsumption = extractDetail('Fuel consumption');
    const co2Emissions = extractDetail('CO₂-emissions');
    const powerRaw = extractDetail('Power');
    const gearbox = extractDetail('Gearbox');
    const engineSize = extractDetail('Engine size');
    const gears = extractDetail('Gears');
    const cylinders = extractDetail('Cylinders');
    const emptyWeight = extractDetail('Empty weight');
    const mileageRaw = extractDetail('Mileage');
    const firstRegistrationRaw = extractDetail('First registration');
    const lastService = extractDetail('Last service');
    const previousOwner = extractDetail('Previous owner');
    const fullServiceHistory = extractDetail('Full service history');

    // Process mileage
    const extractFirstMileageValue = (mileageRaw) => {
      if (!mileageRaw || typeof mileageRaw !== 'string') {
        return null;
      }
      const kmPattern = /(\d{1,3}(?:[.,\s]\d{3})*|\d+)\s*km/gi;
      const matches = Array.from(mileageRaw.matchAll(kmPattern));
      if (matches.length === 0) {
        return null;
      }
      const firstMatch = matches[0][0];
      return firstMatch.replace(/\s+/g, ' ').trim();
    };

    const mileage = extractFirstMileageValue(mileageRaw);

    // Process first registration date
    let firstRegistration = null;
    if (
      firstRegistrationRaw != null &&
      firstRegistrationRaw != '-' &&
      firstRegistrationRaw != ''
    ) {
      const [month, year] = firstRegistrationRaw.split('/');
      firstRegistration = new Date(`01-${month}-${year}`).toISOString();
    }

    // Compile all extracted data
    const extractedData = {
      listingsitea_id: advertId,
      make: make || 'Unknown Make',
      model: model || 'Unknown Model',
      location: location || 'Unknown Location',
      price: parseFloat(price.replace(/[^0-9.]/g, '')) || 0,
      seller_name: sellerName || 'Unknown Seller',
      body_type: bodyType || 'Unknown Body Type',
      type: type || 'Unknown Type',
      drivetrain: drivetrain || 'Unknown Drivetrain',
      seats: parseInt(seats) || null,
      doors: parseInt(doors) || null,
      color: colour || 'Unknown Colour',
      paint: paint || 'Unknown Paint',
      upholstery_color: upholsteryColour || 'Unknown Upholstery Colour',
      upholstery: upholstery || 'Unknown Upholstery',
      emission_class: emissionClass || 'Unknown Emission Class',
      fuel_type: fuelTypeRaw || 'Unknown Fuel Type',
      fuel_consumption: fuelConsumption || 'Unknown Fuel Consumption',
      co_2_emissions: co2Emissions || 'Unknown CO₂ Emissions',
      power: powerRaw || 'Unknown Power',
      gearbox: gearbox || 'Unknown Gearbox',
      engine_size: engineSize || 'Unknown Engine Size',
      gears: parseInt(gears) || null,
      cylinders: parseInt(cylinders) || null,
      empty_weight: emptyWeight || 'Unknown Empty Weight',
      mileage: mileage || 'Unknown Mileage',
      first_registration: firstRegistration || null,
      last_service: lastService || 'Unknown Last Service',
      previous_owner: parseInt(previousOwner) || null,
      full_service_history: fullServiceHistory === 'Yes',
      vehicle_description: vehicleDescription || null,
      vehicle_features: vehicleFeatures || null,
      original_image_urls: uniqueImageUrls.length > 0 ? uniqueImageUrls : null,
      main_image_url: uniqueImageUrls.length > 0 ? uniqueImageUrls[0] : null,
      total_images: uniqueImageUrls.length,
    };

    // Log all the scraped data
    console.log('=== LISTING_SITE_A SCRAPED DATA ===');
    console.log('URL:', url);
    console.log('Advert ID:', advertId);
    console.log('Total Images Found:', uniqueImageUrls.length);
    console.log('Image URLs (1920x1080):', uniqueImageUrls);
    console.log('Vehicle Description:', vehicleDescription || 'Not found');
    console.log('Vehicle Features:', vehicleFeatures || 'Not found');
    console.log('Extracted Data:', JSON.stringify(extractedData, null, 2));
    console.log('=== END LISTING_SITE_A SCRAPED DATA ===');

    return {
      url,
      advertId,
      totalImages: uniqueImageUrls.length,
      imageUrls: uniqueImageUrls,
      mainImageUrl: uniqueImageUrls.length > 0 ? uniqueImageUrls[0] : null,
      extractedData,
    };
  } catch (error) {
    console.error(
      '[extractListingSiteAListing] Error scraping ListingSiteA URL:',
      error
    );

    // Log additional context for debugging
    console.error('[extractListingSiteAListing] Error details:', {
      message: error.message,
      stack: error.stack,
      url: url,
      timestamp: new Date().toISOString(),
    });

    // Provide more specific error messages based on error type
    if (error.message.includes('Navigation timeout')) {
      throw new Error(
        `ListingSiteA navigation timeout: The page took too long to load. This might be due to slow network or the site blocking automated requests. Original error: ${error.message}`
      );
    } else if (error.message.includes('Browser launch failed')) {
      throw new Error(
        `ListingSiteA browser launch failed: Unable to start browser in production environment. Original error: ${error.message}`
      );
    } else if (error.message.includes('Protocol error')) {
      throw new Error(
        `ListingSiteA protocol error: Browser communication failed. This might be due to resource constraints. Original error: ${error.message}`
      );
    } else {
      throw new Error(`Failed to scrape ListingSiteA URL: ${error.message}`);
    }
  } finally {
    // Always close the browser with proper error handling
    if (browser) {
      try {
        console.log('[extractListingSiteAListing] Closing browser...');
        await Promise.race([
          browser.close(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Browser close timeout')), 10000)
          ),
        ]);
        console.log(
          '[extractListingSiteAListing] ListingSiteA browser closed successfully'
        );
      } catch (closeError) {
        console.error(
          '[extractListingSiteAListing] Error closing ListingSiteA browser:',
          closeError.message
        );
        // Try to force kill the browser process if normal close fails
        try {
          if (browser.process()) {
            browser.process().kill('SIGKILL');
            console.log(
              '[extractListingSiteAListing] Browser process force killed'
            );
          }
        } catch (killError) {
          console.error(
            '[extractListingSiteAListing] Failed to force kill browser:',
            killError.message
          );
        }
      }
    }
  }
};

/**
 * Extract listing data from ListingSiteB URL using Oxylabs
 * @param {string} url - The ListingSiteB URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractListingSiteBListing = async (url) => {
  try {
    console.log('[extractListingSiteBListing] Calling Oxylabs API for URL:', url);
    const html = await scrapeWithOxylabs(url);

    if (!html || html.length < 100) {
      throw new Error('Oxylabs returned empty or too short content');
    }

    const $ = cheerio.load(html);

    // Extract images from the gallery
    const imageUrls = [];
    $('img[id^="gallery-image-"]').each((i, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        // Get the highest resolution image from srcset (1600w)
        const srcsetParts = srcset.split(',');
        const highResImage = srcsetParts.find((s) => s.includes('1600w'));
        if (highResImage) {
          const imageUrl = highResImage.trim().split(' ')[0];
          if (imageUrl && !imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
          }
        }
      }
    });

    // Fallback image extraction if gallery loop fails
    if (imageUrls.length === 0) {
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('listingsiteb') && src.includes('image') && !src.includes('data:')) {
          // Basic filter, might need refinement
          imageUrls.push(src);
        }
      });
    }

    console.log('[extractListingSiteBListing] Found', imageUrls.length, 'images');

    // Extract title (make + model)
    const title = $('h1.t1').first().text().trim() || '';
    console.log('[extractListingSiteBListing] Title:', title);

    // Extract subtitle (variant info)
    const subtitle = $('h1.t1').next('p').text().trim() || '';

    // Extract price
    let priceText = '';
    let currency = 'kr';
    const priceElement = $('span.t2').first().text().trim();
    if (priceElement) {
      // Extract numeric price and currency (e.g., "259 900 kr")
      const priceMatch = priceElement.match(/([\d\s]+)\s*([a-zA-Z]+)?/);
      if (priceMatch) {
        priceText = priceMatch[1].replace(/\s/g, ''); // Remove spaces
        currency = priceMatch[2] || 'kr';
      }
    }
    console.log('[extractListingSiteBListing] Price:', priceText, currency);

    // Helper function to extract spec value by Swedish label
    const getSpecValue = (label) => {
      let value = '';
      // Look in the specifications section (key-info-section)
      $('section.key-info-section dl div, section dl div').each((i, el) => {
        const dt = $(el).find('dt').text().trim().toLowerCase();
        if (dt.includes(label.toLowerCase())) {
          value = $(el).find('dd').text().trim();
          return false; // break
        }
      });
      return value;
    };

    // Helper function to extract quick info value by icon name
    const getQuickInfoValue = (iconName) => {
      let value = '';
      $('div.flex.gap-16.hyphens-auto').each((i, el) => {
        const icon = $(el).find(`w-icon[name="${iconName}"]`);
        if (icon.length) {
          value = $(el).find('p.font-bold, p.m-0.font-bold').text().trim();
          return false; // break
        }
      });
      return value;
    };

    // Extract specifications from the dl section
    const brand = getSpecValue('märke') || title.split(' ')[0] || '';
    const model = getSpecValue('modell') || title.replace(brand, '').trim() || '';
    const year =
      getSpecValue('modellår') || getQuickInfoValue('Calendar') || '';
    const bodyType = getSpecValue('karosseri') || '';
    const fuelType =
      getSpecValue('drivmedel') || getQuickInfoValue('GasDiesel') || '';
    const horsepower = getSpecValue('effekt') || '';
    const engineVolume = getSpecValue('motorvolym') || '';
    const transmission =
      getSpecValue('växellåda') || getQuickInfoValue('GearAutomatic') || '';
    const driveType = getSpecValue('drivhjul') || '';
    const seats = getSpecValue('säten') || '';
    const color = getSpecValue('färg') || '';
    const registrationNumber = getSpecValue('registreringsnummer') || '';
    const vinNumber = getSpecValue('chassinummer') || '';
    const registrationDate = getSpecValue('registreringsdatum') || '';

    // Extract mileage
    let mileage =
      getSpecValue('miltal') || getQuickInfoValue('Speedometer') || '';
    // Convert Swedish "mil" to km (1 mil = 10 km)
    if (mileage) {
      const mileageMatch = mileage.match(/([\d\s]+)/);
      if (mileageMatch) {
        const milValue = parseInt(mileageMatch[1].replace(/\s/g, ''), 10);
        mileage = milValue * 10; // Convert mil to km
      }
    }
    console.log('[extractListingSiteBListing] Mileage (km):', mileage);

    // Extract features/equipment
    const features = [];
    $(
      'section:has(h2:contains("Utrustning")) ul li, section:has(h2:contains("utrustning")) ul li'
    ).each((i, el) => {
      const feature = $(el).text().trim();
      if (feature && !feature.includes('Öppet ')) {
        // Skip opening hours
        features.push(feature);
      }
    });
    console.log('[extractListingSiteBListing] Found', features.length, 'features');

    // Extract description
    let description = '';
    const descSection = $('div.whitespace-pre-wrap.children\\:list-disc');
    if (descSection.length) {
      description = descSection.text().trim();
    }

    // Extract dealer info
    const dealerName = $('h3.mb-4').first().text().trim() || '';
    let dealerAddress = '';
    $('a[href*="google.com/maps"]').each((i, el) => {
      const addressText = $(el).find('span').last().text().trim();
      if (addressText && addressText.length > 5) {
        dealerAddress = addressText;
        return false;
      }
    });

    // Extract CO2 if available
    const co2 = getSpecValue('co2') || '';

    // Build the extracted data object
    const extractedData = {
      brand_name: brand,
      model: model,
      horsepower: horsepower.replace(/[^\d]/g, ''), // Extract just the number
      km_stand:
        typeof mileage === 'number'
          ? mileage
          : parseInt(String(mileage).replace(/[^\d]/g, ''), 10) || '',
      fuel_type: fuelType,
      transmission_type: transmission,
      first_registration: registrationDate || year,
      color: color,
      registration_number: registrationNumber,
      vin_number: vinNumber,
      internal_url: url,
      listing_price: parseInt(priceText, 10) || '',
      currency: currency,
      features: features.join(', '),
      seat: seats,
      co2: co2,
      description: description,
      dealer_name: dealerName,
      dealer_address: dealerAddress,
      body_type: bodyType,
      drive_type: driveType,
      engine_volume: engineVolume,
      year: year,
    };

    console.log(
      '[extractListingSiteBListing] Extracted data:',
      JSON.stringify(extractedData, null, 2)
    );

    // Translate the data to English
    console.log('[extractListingSiteBListing] Translating data...');
    const translated = await translateWithGPTEnglishOnly(extractedData);
    translated.en.images = imageUrls;

    console.log('[extractListingSiteBListing] Extraction and translation completed');
    return translated;
  } catch (error) {
    console.error('[extractListingSiteBListing] Error:', error);
    throw error;
  }
};

/**
 * Extract listing data from ListingSiteC URL (renders page and logs HTML content)
 * @param {string} url - The ListingSiteC URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractListingSiteCListing = async (url) => {
  try {
    console.log('[extractListingSiteCListing] Calling Oxylabs API for URL:', url);
    const html = await scrapeWithOxylabs(url);

    if (!html || html.length < 100) {
      throw new Error('Oxylabs returned empty or too short content');
    }

    // Save HTML content for inspection
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlHash = crypto
      .createHash('md5')
      .update(url)
      .digest('hex')
      .substring(0, 8);
    const filename = `listingsitec-${timestamp}-${urlHash}.html`;
    const filepath = path.join(__dirname, '..', '..', filename);

    try {
      // fs.writeFileSync(filepath, html, 'utf8');
      console.log(`ListingSiteC HTML saved to: ${filepath}`);
    } catch (writeError) {
      console.error('Failed to save ListingSiteC HTML:', writeError.message);
    }

    // Use Cheerio to parse the HTML and extract data
    const $ = cheerio.load(html);

    // Extract listing ID from URL (format: /detail/car-name/ID/)
    const urlMatch = url.match(/\/detail\/[^\/]+\/([^\/]+)\/?/);
    const listingId = urlMatch ? urlMatch[1] : 'unknown';

    // Extract data from meta tags (primary source for ListingSiteC)
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim();
    const priceFromMeta =
      $('meta[property="og:description"]').attr('content') || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Extract price from meta or title (format: "za 9999 EUR" or "9 999 €")
    let price = '';
    let currency = 'EUR';

    const priceMatch =
      priceFromMeta.match(/za\s+(\d+(?:\s*\d+)*)\s*EUR/) ||
      title.match(/za\s+([\d\s.,]+)\s*€/) ||
      metaDescription.match(/([\d\s.,]+)\s*€/);

    if (priceMatch) {
      price = priceMatch[1].replace(/\s/g, '').replace(/,/g, '.');
    }

    // Extract images from meta tags and potential image elements
    const imageUrls = [];

    // Primary image from meta tag
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      imageUrls.push(ogImage);
    }

    // Additional images from various selectors
    $(
      'img[src*="listingsitec"], img[src*="classistatic"], img[data-src*="listingsitec"], img[data-src*="classistatic"]'
    ).each((index, element) => {
      const imgSrc = $(element).attr('src') || $(element).attr('data-src');
      if (imgSrc && !imageUrls.includes(imgSrc) && !imgSrc.includes('logo')) {
        imageUrls.push(imgSrc);
      }
    });

    // Extract car details from meta description and ads-vars script
    const details = {};

    // Parse meta description for car details
    // Format: "Brand Model - Location, r.v.: date, power, type, transmission, fuel, doors"
    if (metaDescription) {
      const descParts = metaDescription.split(' - ');
      if (descParts.length >= 2) {
        const brandModel = descParts[0].split(' ');
        details.brand = brandModel[0] || '';
        details.model = brandModel.slice(1).join(' ') || '';

        const locationAndSpecs = descParts[1];
        const locationMatch = locationAndSpecs.match(/^([^,]+),\s*/);
        if (locationMatch) {
          details.location = locationMatch[1];
        }

        // Extract year (r.v.: 6/2022)
        const yearMatch = locationAndSpecs.match(/r\.v\.\:\s*(\d+\/\d+)/);
        if (yearMatch) {
          details.year = yearMatch[1];
          details.registration_date = yearMatch[1];
        }

        // Extract power (55kW)
        const powerMatch = locationAndSpecs.match(/(\d+kW)/);
        if (powerMatch) {
          details.power_kw = powerMatch[1];
        }

        // Extract transmission (M5, A6, etc.)
        const transMatch = locationAndSpecs.match(/(M\d+|A\d+)/);
        if (transMatch) {
          details.transmission = transMatch[1];
        }

        // Extract fuel type
        const fuelMatch = locationAndSpecs.match(
          /(Benzín|Diesel|Hybrid|Elektro|CNG|LPG)/i
        );
        if (fuelMatch) {
          details.fuel_type = fuelMatch[1];
        }

        // Extract doors (5 dverové)
        const doorsMatch = locationAndSpecs.match(/(\d+)\s*dverové/);
        if (doorsMatch) {
          details.doors = doorsMatch[1];
        }
      }
    }

    // Extract transmission from gearboxValue or page content
    // Look for JSON data containing gearboxValue
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('gearboxValue')) {
        const gearboxMatch = scriptContent.match(
          /"gearboxValue"\s*:\s*"([^"]+)"/
        );
        if (gearboxMatch && !details.transmission_full) {
          const gearboxValue = gearboxMatch[1];
          details.transmission_full = gearboxValue;

          // Map Slovak transmission types to English
          if (gearboxValue.toLowerCase().includes('manuálna')) {
            details.transmission_type = 'Manual';
          } else if (
            gearboxValue.toLowerCase().includes('automatická') ||
            gearboxValue.toLowerCase().includes('automatic')
          ) {
            details.transmission_type = 'Automatic';
          } else {
            details.transmission_type = 'Unknown';
          }
        }
      }
    });

    // Also look for transmission in page text content
    if (!details.transmission_full) {
      const pageText = $.text();
      const transmissionMatch = pageText.match(
        /([\d]+-st\.\s*manuálna|[\d]+-st\.\s*automatická|manuálna|automatická)/i
      );
      if (transmissionMatch) {
        details.transmission_full = transmissionMatch[1];
        if (transmissionMatch[1].toLowerCase().includes('manuálna')) {
          details.transmission_type = 'Manual';
        } else if (transmissionMatch[1].toLowerCase().includes('automatická')) {
          details.transmission_type = 'Automatic';
        }
      }
    }

    // Extract additional equipment from carEquipmentValue JSON field
    const equipmentDetails = {};
    let additionalEquipment = [];

    // Look for carEquipmentValue in script tags
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('carEquipmentValue')) {
        const equipmentMatch = scriptContent.match(
          /"carEquipmentValue"\s*:\s*"([^"]+)"/
        );
        if (equipmentMatch && !equipmentDetails.raw_equipment) {
          const rawEquipment = equipmentMatch[1];
          equipmentDetails.raw_equipment = rawEquipment;

          // Split by comma and clean up each item
          additionalEquipment = rawEquipment
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 1)
            .filter((item, index, array) => array.indexOf(item) === index); // Remove duplicates

          equipmentDetails.additional_equipment = additionalEquipment;
          equipmentDetails.equipment_count = additionalEquipment.length;
        }
      }
    });

    // Extract mileage from page content
    // Look for patterns like "13 900 km" in span elements
    $('span').each((index, element) => {
      const text = $(element).text().trim();
      const mileageMatch = text.match(/^([\d\s.,]+)\s*km$/i);
      if (mileageMatch && !details.mileage) {
        details.mileage = mileageMatch[1].replace(/\s/g, '').replace(/,/g, '');
      }
    });

    // Also look for mileage in any text content
    if (!details.mileage) {
      const pageText = $.text();
      const mileageMatch = pageText.match(/([\d\s.,]+)\s*km/);
      if (mileageMatch) {
        const mileageValue = mileageMatch[1]
          .replace(/\s/g, '')
          .replace(/,/g, '');
        // Only accept reasonable mileage values (between 0 and 999999)
        if (parseInt(mileageValue) >= 0 && parseInt(mileageValue) <= 999999) {
          details.mileage = mileageValue;
        }
      }
    }

    // Extract additional data from ads-vars script if available
    const adsVarsScript = $('#ads-vars').html();
    if (adsVarsScript) {
      const adsSecMatch = adsVarsScript.match(/var adsSec = (\[[^\]]+\])/);
      if (adsSecMatch) {
        try {
          const adsSecArray = JSON.parse(adsSecMatch[1]);
          adsSecArray.forEach((item) => {
            if (item.startsWith('rok-')) {
              details.ads_year = item.replace('rok-', '');
            } else if (item.startsWith('cena-')) {
              details.ads_price_range = item.replace('cena-', '');
            } else if (item.startsWith('karoseria-')) {
              details.body_type = item.replace('karoseria-', '');
            } else if (item.startsWith('palivo-')) {
              details.ads_fuel = item.replace('palivo-', '');
            }
          });
        } catch (e) {
          console.log('Could not parse adsSecArray:', e.message);
        }
      }
    }

    // Extract any additional specifications from structured data or JSON-LD
    const specifications = {};

    // Look for JSON-LD structured data
    $('script[type="application/ld+json"]').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        try {
          const jsonData = JSON.parse(scriptContent);
          if (
            jsonData['@type'] === 'Product' ||
            jsonData['@type'] === 'Vehicle'
          ) {
            specifications.structured_data = jsonData;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
    });

    // Extract additional description from page content if available
    const pageDescription =
      $('.description p, .detail-description, [class*="description"]')
        .first()
        .text()
        .trim() || '';

    // Extract condition (assuming new/used based on data or default)
    const condition =
      details.ads_year &&
        parseInt(details.ads_year) >= new Date().getFullYear() - 1
        ? 'New'
        : 'Used';

    // Extract features from ads categories
    const features = {};
    if (adsVarsScript) {
      const adsPagMatch = adsVarsScript.match(/var adsPag = (\[[^\]]+\])/);
      if (adsPagMatch) {
        try {
          const adsPagArray = JSON.parse(adsPagMatch[1]);
          features.page_categories = adsPagArray;
        } catch (e) {
          console.log('Could not parse adsPagArray:', e.message);
        }
      }
    }

    // Extract contact information from page
    const contactInfo = {
      phone: null,
      whatsapp: null,
      email: null,
    };

    // Look for contact elements
    $('a[href^="tel:"]').each((index, element) => {
      const phone = $(element).attr('href').replace('tel:', '');
      if (phone && !contactInfo.phone) {
        contactInfo.phone = phone;
      }
    });

    $('a[href^="mailto:"]').each((index, element) => {
      const email = $(element).attr('href').replace('mailto:', '');
      if (email && !contactInfo.email) {
        contactInfo.email = email;
      }
    });

    // Compile all extracted data
    const extractedData = {
      listingsitec_id: listingId,
      title: title || 'Unknown Title',
      brand: details.brand || 'Unknown Brand',
      model: details.model || 'Unknown Model',
      price: price || '0',
      currency: currency || 'EUR',
      condition: condition || 'Used',
      year: details.year || null,
      registration_date: details.registration_date || null,
      power_kw: details.power_kw || null,
      fuel_type: details.fuel_type || details.ads_fuel || 'Unknown',
      transmission: details.transmission || 'Unknown',
      transmission_type: details.transmission_type || 'Unknown',
      transmission_full: details.transmission_full || null,
      doors: details.doors || null,
      mileage: details.mileage || null,
      body_type: details.body_type || 'Unknown',
      location: details.location || 'Unknown Location',
      description:
        pageDescription || metaDescription || 'No description available',
      meta_description: metaDescription,
      price_range: details.ads_price_range || null,
      details: details,
      specifications: specifications,
      features: features,
      additional_equipment: equipmentDetails.additional_equipment || null,
      equipment_count: equipmentDetails.equipment_count || 0,
      raw_equipment_string: equipmentDetails.raw_equipment || null,
      contact_info: contactInfo,
      original_image_urls: imageUrls.length > 0 ? imageUrls : null,
      main_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      total_images: imageUrls.length,
    };

    // Log all the scraped data
    console.log('=== LISTING_SITE_C SCRAPED DATA ===');
    console.log('URL:', url);
    console.log('Listing ID:', listingId);
    console.log('Title:', title);
    console.log('Brand:', details.brand);
    console.log('Model:', details.model);
    console.log('Price:', price, currency);
    console.log('Year:', details.year);
    console.log('Power:', details.power_kw);
    console.log('Fuel Type:', details.fuel_type);
    console.log(
      'Transmission:',
      details.transmission_type,
      '(' + (details.transmission_full || 'N/A') + ')'
    );
    console.log('Mileage:', details.mileage);
    console.log('Location:', details.location);
    console.log('Total Images Found:', imageUrls.length);
    console.log('Image URLs:', imageUrls);
    console.log('All Details:', details);
    console.log('Specifications:', specifications);
    console.log('Features:', features);
    console.log(
      'Additional Equipment Count:',
      equipmentDetails.equipment_count || 0
    );
    console.log(
      'Equipment Items:',
      equipmentDetails.additional_equipment || 'None found'
    );
    console.log('Contact Info:', contactInfo);
    console.log('=== EXTRACTED DATA ===');
    console.log(JSON.stringify(extractedData, null, 2));
    console.log('=== END LISTING_SITE_C SCRAPED DATA ===');

    // Translate features section to English if features or equipment exist
    let translatedFeatures = null;
    let translatedEquipment = null;

    // Check if we have additional_equipment array to translate
    if (
      equipmentDetails.additional_equipment &&
      Array.isArray(equipmentDetails.additional_equipment) &&
      equipmentDetails.additional_equipment.length > 0
    ) {
      try {
        console.log('=== TRANSLATING ADDITIONAL EQUIPMENT TO ENGLISH ===');
        console.log(
          'Original equipment:',
          equipmentDetails.additional_equipment
        );

        const equipmentToTranslate = {
          additional_equipment: equipmentDetails.additional_equipment,
        };

        const equipmentTranslationResult =
          await translateWithGPTEnglishOnly(equipmentToTranslate);
        translatedEquipment =
          equipmentTranslationResult?.en?.additional_equipment || null;

        console.log('Translated equipment:', translatedEquipment);
        console.log('=== EQUIPMENT TRANSLATION COMPLETED ===');
      } catch (translationError) {
        console.error('Error translating equipment:', translationError.message);
        translatedEquipment = null;
      }
    }

    // Also translate features object if it contains meaningful data
    if (
      features &&
      Object.keys(features).length > 0 &&
      JSON.stringify(features) !== '{"page_categories":["detail"]}'
    ) {
      try {
        console.log('=== TRANSLATING FEATURES TO ENGLISH ===');
        console.log('Original features:', features);

        const featuresToTranslate = {
          features: features,
        };

        const translationResult =
          await translateWithGPTEnglishOnly(featuresToTranslate);
        translatedFeatures = translationResult?.en?.features || null;

        console.log('Translated features:', translatedFeatures);
        console.log('=== FEATURES TRANSLATION COMPLETED ===');
      } catch (translationError) {
        console.error('Error translating features:', translationError.message);
        translatedFeatures = null;
      }
    }

    // Add translated features and equipment to extracted data
    const finalExtractedData = {
      ...extractedData,
      translated_features: translatedFeatures,
      translated_additional_equipment: translatedEquipment,
    };

    // Return success response with scraped data
    return {
      url,
      listingId,
      totalImages: imageUrls.length,
      imageUrls,
      mainImageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      extractedData: finalExtractedData,
    };
  } catch (error) {
    console.error('Error scraping ListingSiteC URL:', error);
    throw new Error(`Failed to scrape ListingSiteC URL: ${error.message}`);
  };
};

/**
 * Extract listing data from Hasznaltauto URL (renders page and logs HTML content)
 * @param {string} url - The Hasznaltauto URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractHasznaltautoListing = async (url) => {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('[extractHasznaltautoListing] Calling Oxylabs API for URL:', url);
      const html = await scrapeWithOxylabs(url);

      if (!html || html.length < 100) {
        throw new Error('Oxylabs returned empty or too short content');
      }
      // Use Cheerio to parse the HTML and extract car data
      const cheerio = require('cheerio');
      const $ = cheerio.load(html);

      // Extract listing ID from URL
      const urlMatch = url.match(/\/(\d+)(?:\/|$)/);
      let listingId = urlMatch ? urlMatch[1] : 'unknown';

      // Extract title from meta tags
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text() ||
        'Unknown Title';

      // Extract price from structured data
      let price = '0';
      let currency = 'HUF';
      $('script[type="application/ld+json"]').each((index, element) => {
        try {
          const jsonData = JSON.parse($(element).html());
          if (
            jsonData['@type'] === 'Product' &&
            jsonData.offers &&
            jsonData.offers.price
          ) {
            price = jsonData.offers.price.toString();
            currency = jsonData.offers.priceCurrency || 'HUF';
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });

      // Extract brand, model, and horsepower from structured data or title
      let brand = 'Unknown';
      let model = 'Unknown';
      $('script[type="application/ld+json"]').each((index, element) => {
        try {
          const jsonData = JSON.parse($(element).html());
          if (jsonData['@type'] === 'Product') {
            if (jsonData.brand && jsonData.brand.name) {
              brand = jsonData.brand.name;
            }
            if (jsonData.name) {
              // Extract model from product name
              const nameParts = jsonData.name.split(' ');
              if (nameParts.length > 1) {
                model = nameParts.slice(1).join(' ');
              }
            }

            // Try to extract horsepower from structured data
            if (!horsepower && jsonData.additionalProperty) {
              const horsepowerProp = jsonData.additionalProperty.find(
                (prop) =>
                  prop.name &&
                  (prop.name.toLowerCase().includes('teljesítmény') ||
                    prop.name.toLowerCase().includes('teljesitmeny') ||
                    prop.name.toLowerCase().includes('horsepower') ||
                    prop.name.toLowerCase().includes('power') ||
                    prop.name.toLowerCase().includes('hp') ||
                    prop.name.toLowerCase().includes('le'))
              );
              if (horsepowerProp && horsepowerProp.value) {
                const hpMatch = horsepowerProp.value.toString().match(/(\d+)/);
                if (hpMatch) {
                  horsepower = hpMatch[1];
                }
              }
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });

      // Extract description from meta tags
      const description = $('meta[name="description"]').attr('content') || '';

      // Extract images from structured data
      const imageUrls = [];
      $('script[type="application/ld+json"]').each((index, element) => {
        try {
          const jsonData = JSON.parse($(element).html());
          if (jsonData['@type'] === 'Product' && jsonData.image) {
            if (Array.isArray(jsonData.image)) {
              jsonData.image.forEach((img) => {
                if (img.url && !imageUrls.includes(img.url)) {
                  imageUrls.push(img.url);
                }
              });
            } else if (jsonData.image.url) {
              imageUrls.push(jsonData.image.url);
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });

      // Extract additional car details from meta description
      let mileage = '0';
      let fuelType = '';
      let transmission = '';
      let firstRegistration = '';
      let condition = '';
      let horsepower = '';

      // Try to extract from meta description
      const descMatch = description.match(/(\d+)\s*km/);
      if (descMatch) {
        mileage = descMatch[1];
      }

      // Extract year from title or description
      const yearMatch =
        title.match(/\((\d{4})\)/) || description.match(/\((\d{4})\)/);
      if (yearMatch) {
        firstRegistration = yearMatch[1];
      }

      // Extract horsepower from title or description with multiple patterns
      let horsepowerMatch =
        title.match(/(\d+)\s*(?:le|hp|ps|LE|HP|PS|lóerő|loero)\b/i) ||
        description.match(/(\d+)\s*(?:le|hp|ps|LE|HP|PS|lóerő|loero)\b/i) ||
        title.match(/(\d+)\s*kW/i) || // Also try kW
        description.match(/(\d+)\s*kW/i);

      if (horsepowerMatch && !horsepower) {
        // Convert kW to HP if needed (1 kW = 1.36 HP approximately)
        if (horsepowerMatch[0].toLowerCase().includes('kw')) {
          horsepower = Math.round(
            parseInt(horsepowerMatch[1]) * 1.36
          ).toString();
        } else {
          horsepower = horsepowerMatch[1];
        }
      }

      // Parse customtarget meta tag (base64 encoded data) for additional details
      const customtargetMeta = $('meta[name="customtarget"]').attr('content');
      if (customtargetMeta) {
        try {
          const decodedData = Buffer.from(
            customtargetMeta,
            'base64'
          ).toString();
          const params = new URLSearchParams(decodedData);

          // Extract additional data from customtarget
          const customYear = params.get('evjarat');
          const customMileage = params.get('futottkm');
          const customFuelType = params.get('uzemanyag');
          const customTransmission = params.get('valto');
          const customBrand = params.get('gyartmany');
          const customModel = params.get('modell');
          const customColor = params.get('szin');
          const customCondition = params.get('allapot');
          const customHorsepower =
            params.get('teljesitmeny') ||
            params.get('teljesítmény') ||
            params.get('le') ||
            params.get('hp') ||
            params.get('power') ||
            params.get('loero') ||
            params.get('lóerő') ||
            params.get('kw');

          // // Log customtarget data for debugging
          // console.log('--- Customtarget extracted data ---');
          // console.log('Year:', customYear);
          // console.log('Mileage:', customMileage);
          // console.log('Fuel Type:', customFuelType);
          // console.log('Transmission:', customTransmission);
          // console.log('Brand:', customBrand);
          // console.log('Model:', customModel);
          // console.log('Condition:', customCondition);
          // console.log('Horsepower:', customHorsepower);
          // console.log('----------------------------------');

          // Use customtarget data if available
          if (customYear) firstRegistration = customYear;
          if (customMileage) mileage = customMileage;
          if (customFuelType) fuelType = customFuelType;
          if (customTransmission) transmission = customTransmission;
          if (customBrand) brand = customBrand;
          if (customModel) model = customModel;
          if (customCondition) condition = customCondition;
          if (customHorsepower) horsepower = customHorsepower;
        } catch (e) {
          console.log('Error parsing customtarget data:', e.message);
        }
      }

      // Try to extract horsepower from DOM elements (car details sections)
      if (!horsepower) {
        // Look for common Hungarian car detail selectors
        const horsepowerSelectors = [
          'span:contains("Teljesítmény")',
          'td:contains("Teljesítmény")',
          'div:contains("Teljesítmény")',
          'span:contains("lóerő")',
          'td:contains("lóerő")',
          'div:contains("lóerő")',
          'span:contains("HP")',
          'td:contains("HP")',
          'div:contains("HP")',
          '.car-detail:contains("Teljesítmény")',
          '.specification:contains("Teljesítmény")',
          '.tech-data:contains("Teljesítmény")',
        ];

        for (const selector of horsepowerSelectors) {
          const element = $(selector);
          if (element.length > 0) {
            // Check the element and its siblings/parent for horsepower value
            const elementText = element.text();
            const parentText = element.parent().text();
            const nextText = element.next().text();

            const combinedText = `${elementText} ${parentText} ${nextText}`;
            const hpMatch = combinedText.match(
              /(\d+)\s*(?:le|hp|ps|LE|HP|PS|lóerő|loero)\b/i
            );

            if (hpMatch) {
              horsepower = hpMatch[1];
              console.log(
                `Found horsepower via DOM selector: ${selector} -> ${horsepower}`
              );
              break;
            }
          }
        }
      }

      // Last resort: search through all page text for horsepower patterns
      if (!horsepower) {
        const bodyText = $('body').text();
        const allHorsepowerMatches = [
          bodyText.match(/(\d+)\s*(?:le|hp|ps|LE|HP|PS|lóerő|loero)\b/gi),
          bodyText.match(/(\d+)\s*kW/gi),
        ]
          .filter(Boolean)
          .flat();

        if (allHorsepowerMatches && allHorsepowerMatches.length > 0) {
          // Look for the most likely horsepower value (between 50-1000 HP for typical cars)
          for (const match of allHorsepowerMatches) {
            const hpValue = parseInt(match.match(/(\d+)/)[1]);
            if (hpValue >= 50 && hpValue <= 1000) {
              if (match.toLowerCase().includes('kw')) {
                horsepower = Math.round(hpValue * 1.36).toString();
              } else {
                horsepower = hpValue.toString();
              }
              console.log(
                `Found horsepower via body text search: ${match} -> ${horsepower} HP`
              );
              break;
            }
          }
        }
      }

      // Extract data from dataLayer script for additional details
      const dataLayerScript = $('script')
        .filter((index, element) => {
          return $(element).html().includes('dataLayer.push');
        })
        .first();

      if (dataLayerScript.length > 0) {
        const scriptContent = dataLayerScript.html();
        const dataLayerMatch = scriptContent.match(
          /dataLayer\.push\((\{.*?\})\)/
        );
        if (dataLayerMatch) {
          try {
            const dataLayerData = JSON.parse(dataLayerMatch[1]);

            // Log dataLayer data for debugging
            // console.log('--- DataLayer extracted data ---');
            // console.log('Listing ID:', dataLayerData.listing_id);
            // console.log('Brand:', dataLayerData.brand);
            // console.log('Model:', dataLayerData.model);
            // console.log('Year:', dataLayerData.year);
            // console.log('Mileage:', dataLayerData.mileage);
            // console.log('Fuel Type:', dataLayerData.fuel_type);
            // console.log('Transmission:', dataLayerData.transmission_type);
            // console.log(
            //   'Horsepower:',
            //   dataLayerData.horsepower || dataLayerData.power
            // );
            // console.log('-------------------------------');

            // Use dataLayer data if available and not already set
            if (dataLayerData.listing_id)
              listingId = dataLayerData.listing_id.toString();
            if (dataLayerData.brand && brand === 'Unknown')
              brand = dataLayerData.brand;
            if (dataLayerData.model && model === 'Unknown')
              model = dataLayerData.model;
            if (dataLayerData.year && !firstRegistration)
              firstRegistration = dataLayerData.year.toString();
            if (dataLayerData.mileage && mileage === '0')
              mileage = dataLayerData.mileage.toString();
            if (dataLayerData.fuel_type && !fuelType)
              fuelType = dataLayerData.fuel_type;
            if (dataLayerData.transmission_type && !transmission)
              transmission = dataLayerData.transmission_type;
            if (dataLayerData.horsepower && !horsepower)
              horsepower = dataLayerData.horsepower.toString();
            if (dataLayerData.power && !horsepower)
              horsepower = dataLayerData.power.toString();
          } catch (e) {
            console.log('Error parsing dataLayer:', e.message);
          }
        }
      }

      // Extract basic page information
      const pageData = {
        title: $('title').text(),
        url: url,
        description: $('meta[name="description"]').attr('content') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription:
          $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
      };

      // Compile all extracted data
      const extractedData = {
        hasznaltauto_id: listingId,
        title: title,
        brand: brand,
        model: model,
        price: price,
        currency: currency,
        mileage: mileage,
        fuel_type: fuelType,
        transmission: transmission,
        first_registration: firstRegistration,
        condition: condition,
        horsepower: horsepower,
        description: description,
        original_image_urls: imageUrls.length > 0 ? imageUrls : null,
        main_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        total_images: imageUrls.length,
        page_data: pageData,
      };

      // // Log extracted data for debugging
      // console.log('=== HASZNALTAUTO EXTRACTED DATA ===');
      // console.log('URL:', url);
      // console.log('Listing ID:', listingId);
      // console.log('Title:', title);
      // console.log('Brand:', brand);
      // console.log('Model:', model);
      // console.log('Price:', price, currency);
      // console.log('Mileage:', mileage, 'km');
      // console.log('Fuel Type:', fuelType);
      // console.log('Transmission:', transmission);
      // console.log('First Registration:', firstRegistration);
      // console.log('Condition:', condition);
      // console.log('Horsepower:', horsepower, 'HP');
      // console.log('Total Images:', imageUrls.length);
      // console.log('Description Length:', description.length, 'characters');
      // console.log('===================================');

      // Return success response with scraped data
      return {
        url,
        htmlContentLength: html.length,
        message:
          'Hasznaltauto page rendered and car data extracted successfully via Bright Data API',

        extractedData: extractedData,
      };
    } catch (error) {
      lastError = error;
      console.error(
        `Error scraping Hasznaltauto URL via Bright Data API (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = attempt * 5000; // 5 seconds, then 10 seconds
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all attempts failed, throw the last error
  console.error(
    'All attempts to scrape Hasznaltauto URL via Bright Data API failed:',
    lastError
  );
  throw new Error(
    `Failed to scrape Hasznaltauto URL via Bright Data API after ${maxRetries} attempts: ${lastError.message}`
  );
};

/**
 * Extract listing data from Sauto.cz URL using Puppeteer with consent page handling
 * @param {string} url - The Sauto.cz URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractSautoListing = async (url) => {
  let browser = null;
  try {
    // Use Puppeteer to render the page
    const puppeteer = require('puppeteer');

    // Launch browser with stealthy settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
      timeout: 240000, // 4 minutes timeout
    });

    const page = await browser.newPage();

    // Set realistic user agent and headers
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,cs;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    });

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Check if we're on a consent page
    const isConsentPage = await page.evaluate(() => {
      return (
        document.title.includes('Nastavení souhlasu') ||
        document.querySelector(
          'button[data-testid="cw-button-agree-with-ads"]'
        ) ||
        document.querySelector('.cw-btn--green') ||
        window.location.href.includes('cmp.seznam.cz')
      );
    });

    // Declare consentOutputPath at function level so it's always available
    let consentOutputPath = null;

    if (isConsentPage) {
      // Wait for JavaScript to fully execute and Shadow DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Look for the button element inside Shadow DOM
      const buttonElement = await page.evaluate(() => {
        // Function to search through all shadow roots recursively
        function searchShadowDOM(root) {
          const results = [];

          // Search in current root
          const button = root.querySelector(
            'button[data-testid="cw-button-agree-with-ads"]'
          );
          if (button) {
            results.push({
              found: true,
              tagName: button.tagName,
              className: button.className,
              textContent: button.textContent,
              dataTestId: button.getAttribute('data-testid'),
              outerHTML: button.outerHTML,
              parentHTML: button.parentElement
                ? button.parentElement.outerHTML
                : null,
              location: 'shadow-dom',
            });
          }

          // Also search for any button with "Souhlasím" text
          const allButtons = root.querySelectorAll('button');
          for (const btn of allButtons) {
            if (
              btn.textContent.includes('Souhlasím') ||
              btn.textContent.includes('Agree')
            ) {
              results.push({
                found: true,
                tagName: btn.tagName,
                className: btn.className,
                textContent: btn.textContent,
                dataTestId: btn.getAttribute('data-testid'),
                outerHTML: btn.outerHTML,
                parentHTML: btn.parentElement
                  ? btn.parentElement.outerHTML
                  : null,
                location: 'shadow-dom-text-match',
              });
            }
          }

          // Search in all shadow roots
          const shadowRoots = root.querySelectorAll('*');
          for (const element of shadowRoots) {
            if (element.shadowRoot) {
              const shadowResults = searchShadowDOM(element.shadowRoot);
              results.push(...shadowResults);
            }
          }

          return results;
        }

        // Start search from document
        const results = searchShadowDOM(document);

        // Also check regular DOM as fallback
        const regularButton = document.querySelector(
          'button[data-testid="cw-button-agree-with-ads"]'
        );
        if (regularButton) {
          results.push({
            found: true,
            tagName: regularButton.tagName,
            className: regularButton.className,
            textContent: regularButton.textContent,
            dataTestId: regularButton.getAttribute('data-testid'),
            outerHTML: regularButton.outerHTML,
            parentHTML: regularButton.parentElement
              ? regularButton.parentElement.outerHTML
              : null,
            location: 'regular-dom',
          });
        }

        return results;
      });

      if (buttonElement.length > 0) {
        // Try multiple text-based clicking approaches for closed shadow DOM
        let clickSuccess = false;

        // Method 1: Click by exact text
        try {
          await page.click('text="Souhlasím"', { timeout: 5000 });
          clickSuccess = true;
        } catch (error) {
          // Continue to next method
        }

        // Method 2: Click by partial text match
        if (!clickSuccess) {
          try {
            await page.click('text=/Souhlasím/', { timeout: 5000 });
            clickSuccess = true;
          } catch (error) {
            // Continue to next method
          }
        }

        // Method 3: Click by button with specific data-testid
        if (!clickSuccess) {
          try {
            await page.click('button[data-testid="cw-button-agree-with-ads"]', {
              timeout: 5000,
            });
            clickSuccess = true;
          } catch (error) {
            // Continue to next method
          }
        }

        // Method 4: Click by button class containing "green"
        if (!clickSuccess) {
          try {
            await page.click('button.cw-btn--green', { timeout: 5000 });
            clickSuccess = true;
          } catch (error) {
            // Continue to next method
          }
        }

        // Method 5: Click by any button containing "Souhlasím" text
        if (!clickSuccess) {
          try {
            await page.evaluate(() => {
              const buttons = document.querySelectorAll('button');
              for (const btn of buttons) {
                if (btn.textContent.includes('Souhlasím')) {
                  btn.click();
                  return true;
                }
              }
              return false;
            });
            clickSuccess = true;
          } catch (error) {
            // Continue to next method
          }
        }

        if (clickSuccess) {
          try {
            await page.waitForNavigation({
              waitUntil: 'networkidle2',
              timeout: 30000,
            });
          } catch (navigationError) {
            // Navigation failed but button was clicked
          }
        }
      }
    }

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get the final HTML content
    const html = await page.content();

    // Log basic page information
    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        description:
          document.querySelector('meta[name="description"]')?.content || '',
        ogTitle:
          document.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription:
          document.querySelector('meta[property="og:description"]')?.content ||
          '',
        ogImage:
          document.querySelector('meta[property="og:image"]')?.content || '',
      };
    });

    return {
      url,
      htmlContentLength: html.length,
      message: 'Sauto.cz page processed successfully',
      extractedData: {
        url,
        htmlContentLength: html.length,
        pageData,
      },
    };
  } catch (error) {
    console.error('Error processing Sauto.cz URL:', error);
    throw new Error(`Failed to process Sauto.cz URL: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Puppeteer browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
};

/**
 * Extract listing data from Mobile.de URL using Bright Data API
 * @param {string} url - The Mobile.de URL to scrape
 * @returns {Promise<Object>} The extracted listing data
 */
const extractMobileDeListing = async (url) => {
  const maxRetries = 4; // Increased to allow for validation retries
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[extractMobileDeListing] Attempt ${attempt}/${maxRetries} for URL: ${url}`
      );

      console.log('[extractMobileDeListing] Calling Oxylabs API for URL:', url);
      const html = await scrapeWithOxylabs(url);

      if (!html || html.length < 100) {
        throw new Error('Oxylabs returned empty or too short content');
      }
      // Use Cheerio to parse the HTML and extract car data
      const cheerio = require('cheerio');
      const $ = cheerio.load(html);

      // Check if we got an access denied page
      const pageTitle = $('title').text();
      if (
        pageTitle.includes('Zugriff verweigert') ||
        pageTitle.includes('Access denied')
      ) {
        console.log(
          `Access denied detected on attempt ${attempt}, retrying...`
        );
        throw new Error('Access denied from mobile.de');
      }

      // Extract listing ID from URL
      const urlMatch = url.match(/\/auto-inserat\/[^\/]+\/(\d+)\.html/);
      const listingId = urlMatch ? urlMatch[1] : 'unknown';

      // Extract title from meta tags
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('title').text() ||
        'Unknown Title';

      // Extract basic page information
      const pageData = {
        title: pageTitle,
        url: url,
        description: $('meta[name="description"]').attr('content') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription:
          $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
      };

      // Extract price from meta description and page content
      const priceMatch = title.match(/für\s+([\d.,]+)\s*€/);
      const price = priceMatch
        ? priceMatch[1].replace('.', '').replace(',', '.')
        : '0';

      // Extract car details from meta description
      const description = $('meta[name="description"]').attr('content') || '';

      let mileage = '0';
      let power = '0';
      let horsepower = '0';
      let fuelType = '';
      let transmission = '';
      let firstRegistration = '';
      let condition = 'Unknown';

      // Parse the description using a more flexible approach
      if (description) {
        // Split by bullet points (•)
        const parts = description.split('•').map((part) => part.trim());

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];

          // Extract mileage (e.g., "38.900 km")
          const mileageMatch = part.match(/([\d.,]+)\s*km/);
          if (mileageMatch) {
            mileage = mileageMatch[1].replace('.', '');
          }

          // Extract power and horsepower (e.g., "118 kW (160 PS)")
          const powerMatch = part.match(/([\d.,]+)\s*kW\s*\(([\d.,]+)\s*PS\)/);
          if (powerMatch) {
            power = powerMatch[1].replace(',', '.');
            horsepower = powerMatch[2].replace('.', '');
          }

          // Extract fuel type (e.g., "Hybrid (Benzin/Elektro)")
          if (
            part.includes('Hybrid') ||
            part.includes('Benzin') ||
            part.includes('Diesel') ||
            part.includes('Elektro') ||
            part.includes('Gas') ||
            part.includes('LPG')
          ) {
            fuelType = part;
          }

          // Extract transmission type (German patterns)
          if (
            part.includes('Automatik') ||
            part.includes('Automatikgetriebe') ||
            part.includes('Schaltgetriebe') ||
            part.includes('Handschaltung') ||
            part.includes('Manuell') ||
            part.includes('CVT') ||
            part.includes('Doppelkupplung') ||
            part.includes('Stufenlos')
          ) {
            transmission = part;
          }

          // Extract registration date (e.g., "04/2021")
          const dateMatch = part.match(/(\d{2}\/\d{4})/);
          if (dateMatch) {
            firstRegistration = dateMatch[1];
          }

          // Extract condition (first part after "Gebrauchtfahrzeug,")
          if (i === 0 && part.includes('Gebrauchtfahrzeug,')) {
            const conditionPart = part.replace('Gebrauchtfahrzeug,', '').trim();
            if (conditionPart) {
              condition = conditionPart;
            }
          }
        }
      }

      // Extract brand and model from title
      const brandModelMatch = title.match(/^([^für]+)/);
      const brandModel = brandModelMatch
        ? brandModelMatch[1].trim()
        : 'Unknown';

      // Try to extract brand and model separately
      const brandModelParts = brandModel.split(' ');
      const brand = brandModelParts[0] || 'Unknown';
      const model = brandModelParts.slice(1).join(' ') || 'Unknown';

      // Initialize additional car details variables
      let color = '';
      let interior = '';
      let cylinders = '';

      // Extract images from the specific gallery container
      const imageUrls = [];
      $(
        'article[data-testid="gallery-main-focus-container"] img[src*="img.classistatic.de"]'
      ).each((index, element) => {
        const imgSrc = $(element).attr('src');
        if (imgSrc && !imageUrls.includes(imgSrc)) {
          imageUrls.push(imgSrc);
        }
      });

      // Fallback: if no images found in gallery container, try the broader gallery selector
      if (imageUrls.length === 0) {
        $(
          'div[data-testid="image-gallery"] img[src*="img.classistatic.de"]'
        ).each((index, element) => {
          const imgSrc = $(element).attr('src');
          if (imgSrc && !imageUrls.includes(imgSrc)) {
            imageUrls.push(imgSrc);
          }
        });
      }

      // Additional fallback: if still no images, try any img with classistatic.de in the main content area
      if (imageUrls.length === 0) {
        $(
          'main img[src*="img.classistatic.de"], .main-content img[src*="img.classistatic.de"]'
        ).each((index, element) => {
          const imgSrc = $(element).attr('src');
          if (imgSrc && !imageUrls.includes(imgSrc)) {
            imageUrls.push(imgSrc);
          }
        });
      }

      // Enhanced transmission extraction from structured data and DOM
      if (!transmission) {
        // Try to extract from JSON-LD structured data
        $('script[type="application/ld+json"]').each((index, element) => {
          try {
            const jsonData = JSON.parse($(element).html());
            if (
              jsonData['@type'] === 'Product' &&
              jsonData.additionalProperty
            ) {
              const transmissionProp = jsonData.additionalProperty.find(
                (prop) =>
                  prop.name &&
                  (prop.name.toLowerCase().includes('getriebe') ||
                    prop.name.toLowerCase().includes('transmission') ||
                    prop.name.toLowerCase().includes('schaltung'))
              );
              if (transmissionProp && transmissionProp.value) {
                transmission = transmissionProp.value;
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

        // Try to extract from DOM elements
        if (!transmission) {
          const transmissionSelectors = [
            'span:contains("Getriebe")',
            'td:contains("Getriebe")',
            'div:contains("Getriebe")',
            'dt:contains("Getriebe")',
            '.specification:contains("Getriebe")',
            '.tech-data:contains("Getriebe")',
            '[data-testid*="transmission"]',
            '[data-testid*="gearbox"]',
          ];

          for (const selector of transmissionSelectors) {
            const element = $(selector);
            if (element.length > 0) {
              const elementText = element.text();
              const parentText = element.parent().text();
              const nextText = element.next().text();

              const combinedText = `${elementText} ${parentText} ${nextText}`;

              // Look for German transmission types
              if (
                combinedText.match(
                  /automatik|schaltgetriebe|handschaltung|manuell|cvt|doppelkupplung|stufenlos/i
                )
              ) {
                transmission = combinedText.trim();
                console.log(
                  `Found transmission via DOM selector: ${selector} -> ${transmission}`
                );
                break;
              }
            }
          }
        }

        // Last resort: search page text for transmission patterns
        if (!transmission) {
          const bodyText = $('body').text();
          const transmissionPatterns = [
            /(\d+-Gang-)?Automatikgetriebe/gi,
            /(\d+-Gang-)?Schaltgetriebe/gi,
            /(\d+-Gang-)?Handschaltung/gi,
            /(\d+-stufiges?\s+)?Automatikgetriebe/gi,
            /(\d+-stufiges?\s+)?Schaltgetriebe/gi,
            /CVT[\s-]?Getriebe/gi,
            /Doppelkupplungsgetriebe/gi,
            /Stufenloses\s+Automatikgetriebe/gi,
          ];

          for (const pattern of transmissionPatterns) {
            const match = bodyText.match(pattern);
            if (match) {
              transmission = match[0];
              console.log(
                `Found transmission via text pattern: ${pattern} -> ${transmission}`
              );
              break;
            }
          }
        }
      }

      // Extract technical data and features sections
      const technicalData = {};
      const features = [];

      // Extract technical data section (Technische Daten)
      $('section h3:contains("Technische Daten")')
        .parent()
        .find('dl dt')
        .each((index, element) => {
          const key = $(element).text().trim();
          const value = $(element).next('dd').text().trim();
          if (key && value) {
            technicalData[key] = value;

            // Update our main variables if we find better data
            if (key.includes('Getriebe') && !transmission) {
              transmission = value;
            }
            if (
              key.includes('Kilometerstand') &&
              (!mileage || mileage === '0')
            ) {
              const mileageNum = value.replace(/[^\d]/g, '');
              if (mileageNum) mileage = mileageNum;
            }
            if (
              key.includes('Leistung') &&
              (!horsepower || horsepower === '0')
            ) {
              const powerMatch = value.match(/(\d+)\s*PS/);
              if (powerMatch) horsepower = powerMatch[1];
            }
            if (key.includes('Kraftstoffart') && !fuelType) {
              fuelType = value;
            }
            if (key.includes('Erstzulassung') && !firstRegistration) {
              firstRegistration = value;
            }
          }
        });

      // Also try with data-testid attributes for more reliable extraction
      $('[data-testid$="-item"]').each((index, element) => {
        const testId = $(element).attr('data-testid');
        const key = $(element).text().trim();
        const value = $(element).next('dd').text().trim();

        if (key && value && testId) {
          const cleanKey = testId.replace('-item', '');
          technicalData[cleanKey] = value;

          // Map specific fields to our main variables
          if (testId === 'transmission-item' && !transmission) {
            transmission = value;
          }
          if (testId === 'mileage-item' && (!mileage || mileage === '0')) {
            const mileageNum = value.replace(/[^\d]/g, '');
            if (mileageNum) mileage = mileageNum;
          }
          if (testId === 'power-item' && (!horsepower || horsepower === '0')) {
            const powerMatch = value.match(/(\d+)\s*PS/);
            if (powerMatch) horsepower = powerMatch[1];
          }
          if (testId === 'fuel-item' && !fuelType) {
            fuelType = value;
          }
          if (testId === 'firstRegistration-item' && !firstRegistration) {
            firstRegistration = value;
          }
        }
      });

      // Extract features section (Ausstattung)
      $('section h3:contains("Ausstattung")')
        .parent()
        .find('ul li')
        .each((index, element) => {
          const feature = $(element).text().trim();
          if (feature) {
            features.push(feature);
          }
        });

      // Also try with data-testid for features
      $('[data-testid="vip-features-list"] li').each((index, element) => {
        const feature = $(element).text().trim();
        if (feature && !features.includes(feature)) {
          features.push(feature);
        }
      });

      // Combine technical data and features into a single features string
      let combinedFeatures = '';

      // Add technical data
      Object.entries(technicalData).forEach(([key, value]) => {
        if (combinedFeatures) combinedFeatures += ', ';
        combinedFeatures += `${key}: ${value}`;
      });

      // Add features
      if (features.length > 0) {
        if (combinedFeatures) combinedFeatures += ', ';
        combinedFeatures += 'Ausstattung: ' + features.join(', ');
      }

      console.log('--- Technical Data extracted ---');
      console.log('Technical Data:', technicalData);
      console.log('Features:', features);
      console.log('Combined Features String:', combinedFeatures);

      // Try to extract JSON data from script tags containing detailed car information
      let jsonData = null;
      let detailedCarData = null;

      $('script').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          try {
            // Look for JSON data with car details like makeKey, modelKey, features, etc.
            if (
              scriptContent.includes('makeKey') &&
              scriptContent.includes('modelKey')
            ) {
              // Find the JSON object containing car details
              const jsonMatch = scriptContent.match(
                /\{[^{}]*(?:makeKey|modelKey|features|color|interior)[^{}]*\}/
              );
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.makeKey || parsed.modelKey) {
                  detailedCarData = parsed;
                  console.log('--- Detailed Car Data extracted ---');
                  console.log('parsed:', parsed);
                }
              }
            }

            // Also look for price data
            if (
              scriptContent.includes('"price"') &&
              scriptContent.includes('"id"')
            ) {
              const jsonMatch = scriptContent.match(/\{[^{}]*"price"[^{}]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.price && parsed.id) {
                  jsonData = parsed;
                }
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });

      // Extract additional details from the JSON data
      if (detailedCarData) {
        // Update brand and model from JSON if available
        if (detailedCarData.makeKey && brand === 'Unknown') {
          brand = detailedCarData.makeKey;
        }
        if (detailedCarData.modelKey && model === 'Unknown') {
          model = detailedCarData.modelKey;
        }

        // Extract features from the JSON data
        if (
          detailedCarData.features &&
          Array.isArray(detailedCarData.features)
        ) {
          detailedCarData.features.forEach((feature) => {
            if (feature.tag === 'color') {
              color = feature.value;
            } else if (feature.tag === 'interior') {
              interior = feature.value;
            } else if (feature.tag === 'cylinder') {
              cylinders = feature.value;
            }
          });
        }

        // Update fuel type and transmission if available in JSON
        if (detailedCarData.fuelType && !fuelType) {
          fuelType = detailedCarData.fuelType;
        }
        if (detailedCarData.transmission && !transmission) {
          transmission = detailedCarData.transmission;
        }
      }

      // Log extracted data for debugging
      console.log('=== MOBILE.DE EXTRACTED DATA ===');
      console.log('URL:', url);
      console.log('Listing ID:', listingId);
      console.log('Title:', title);
      console.log('Brand:', brand);
      console.log('Model:', model);
      console.log('Price:', price, 'EUR');
      console.log('Mileage:', mileage, 'km');
      console.log('Power (kW):', power);
      console.log('Horsepower:', horsepower, 'PS');
      console.log('Fuel Type:', fuelType);
      console.log('Transmission:', transmission);
      console.log('First Registration:', firstRegistration);
      console.log('Condition:', condition);
      console.log('Total Images:', imageUrls.length);
      console.log('Technical Data Count:', Object.keys(technicalData).length);
      console.log('Equipment Features Count:', features.length);
      console.log(
        'Combined Features Length:',
        combinedFeatures ? combinedFeatures.length : 0,
        'characters'
      );
      console.log('================================');

      // Store original German data before translation
      const originalGermanData = {
        transmission: transmission,
        fuel_type: fuelType,
        condition: condition,
      };

      // Translate German data to English using GPT API
      let translatedData = null;
      try {
        translatedData = await translateMobileDeData({
          transmission,
          fuelType,
          condition,
          features: combinedFeatures,
          technical_data: technicalData,
          equipment_features: features,
        });
        console.log('--- Translation Results ---');
        console.log(
          'Original Transmission:',
          originalGermanData.transmission,
          '→ Translated:',
          translatedData.transmission
        );
        console.log(
          'Original Fuel Type:',
          originalGermanData.fuel_type,
          '→ Translated:',
          translatedData.fuelType
        );
        console.log(
          'Original Condition:',
          originalGermanData.condition,
          '→ Translated:',
          translatedData.condition
        );
        console.log('---------------------------');

        // Update main variables with translated values
        if (translatedData.transmission)
          transmission = translatedData.transmission;
        if (translatedData.fuelType) fuelType = translatedData.fuelType;
        if (translatedData.condition) condition = translatedData.condition;
      } catch (error) {
        console.error('Translation failed:', error.message);
      }

      // Compile all extracted data
      const extractedData = {
        mobilede_id: listingId,
        title: title,
        brand: brand,
        model: model,
        price: price,
        currency: 'EUR',
        mileage: mileage,
        power_kw: power,
        horsepower: horsepower,
        fuel_type: fuelType,
        transmission: transmission,
        first_registration: firstRegistration,
        condition: condition,
        description: description,
        features: combinedFeatures || null,
        technical_data:
          Object.keys(technicalData).length > 0 ? technicalData : null,
        equipment_features: features.length > 0 ? features : null,
        translation_applied: translatedData ? true : false,
        original_german_data: translatedData ? originalGermanData : null,
        color: color || null,
        interior: interior || null,
        cylinders: cylinders || null,
        original_image_urls: imageUrls.length > 0 ? imageUrls : null,
        main_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        total_images: imageUrls.length,
        json_data: jsonData,
        detailed_car_data: detailedCarData,
        page_data: pageData,
      };

      // Validate the extraction results
      const validation = validateMobileDeExtraction(html, extractedData);

      if (!validation.isValid) {
        console.log(`🚨 VALIDATION FAILED: ${validation.reason}`);
        console.log('📊 Current extraction data:', {
          htmlLength: html.length,
          title: extractedData.title,
          brand: extractedData.brand,
          model: extractedData.model,
          price: extractedData.price,
          totalImages: extractedData.total_images,
          hasTechnicalData: !!extractedData.technical_data,
          hasFeatures: !!extractedData.equipment_features,
        });

        // If this is not the last attempt, continue to retry
        if (attempt < maxRetries) {
          console.log(
            `🔄 Retrying extraction (attempt ${attempt + 1}/${maxRetries})...`
          );
          const waitTime = attempt * 3000; // 3 seconds, then 6 seconds
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue; // This will continue to the next iteration of the retry loop
        } else {
          console.log(
            '❌ Max retries reached, but extraction validation failed'
          );
          console.log('⚠️ Returning potentially incomplete data');
        }
      } else {
        console.log(`✅ VALIDATION PASSED: ${validation.reason}`);
      }

      // Return success response with scraped data
      return {
        url,
        htmlContentLength: html.length,
        message:
          'Mobile.de page rendered and car data extracted successfully via Bright Data',
        extractedData: extractedData,
        validation: validation,
      };
    } catch (error) {
      lastError = error;
      console.error(
        `Error scraping Mobile.de URL via Bright Data API (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      // Log specific error details if available
      if (error.response && error.response.data) {
        console.error(
          'Bright Data API Error Details:',
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = attempt * 5000; // 5 seconds, then 10 seconds
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all attempts failed, throw the last error
  console.error(
    'All attempts to scrape Mobile.de URL via Bright Data API failed:',
    lastError
  );
  throw new Error(
    `Failed to scrape Mobile.de URL via Bright Data API after ${maxRetries} attempts: ${lastError.message}`
  );
};

module.exports = {
  createListing,
  createListingWithImages,
  processCarStudioImagesAsync,
  getListing,
  getListingWithTranslations,
  getAllListings,
  getAllListingsWithTranslations,
  updateListing,
  deleteListing,

  extractListingSiteAListing,
  extractListingSiteCListing,
  extractHasznaltautoListing,
  extractSautoListing,
  extractMobileDeListing,
  extractListingSiteBListing,
};
