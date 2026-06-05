const { OpenAI } = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const { setTimeout } = require('timers/promises');
const Listing = require('../models/Listing');
const Advert = require('../models/advert');
const Status = require('../models/Status');
const fs = require('fs');
const {
  extractDataWithGPT,
} = require('../services/scrapingService');
const {
  createListingWithImages,
  getListingWithTranslations,
  getAllListingsWithTranslations,
  createListing: createListingService,
  getListing: getListingService,
  getAllListings: getAllListingsService,
  updateListing: updateListingService,
  deleteListing: deleteListingService,

  extractListingSiteAListing,
  extractListingSiteCListing,
  extractHasznaltautoListing,
  extractSautoListing,
  extractMobileDeListing,
  extractListingSiteBListing,
} = require('../services/listingService');
const StatusUpdate = require('../models/StatusUpdate');
const User = require('../models/User');
const { Op } = require('sequelize');
const ListingPhotos = require('../models/ListingPhotos');
const DamagedParts = require('../models/DamagedParts');
const Invoice = require('../models/Invoice');
const emailService = require('../services/emailService');
const { deleteImageFromS3, uploadPdfToS3 } = require('../services/s3Service');
const { createAndUploadInvoicePDF } = require('../services/pdfService');
const InvoiceService = require('../services/invoiceService');
const { getPuppeteerConfigForScraping } = require('../utils/puppeteerConfig');
const WishlistOptions = require('../models/WishlistOptions');

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY,
});

// Helper function to generate a random 5-character alphanumeric code
function generateReferenceCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate a unique reference number
async function generateUniqueReferenceNo() {
  let referenceNo;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop

  while (!isUnique && attempts < maxAttempts) {
    referenceNo = generateReferenceCode();

    // Check if this reference number already exists
    const existingListing = await Listing.findOne({
      where: { reference_no: referenceNo },
    });

    if (!existingListing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      'Unable to generate unique reference number after maximum attempts'
    );
  }

  return referenceNo;
}

// Prompt template for GPT to extract listing information
const EXTRACTION_PROMPT = `Please analyze the following HTML content and extract car listing information.

Return the data in JSON format with the following fields. Field names must remain in English. Field **values** must be translated and returned in lowercase.

Return the data in the following structure:

{
  "seller_email": "...",
  "seller_phone_number": "...",
  "brand_name": "...",
  "model": "...",
  "color": "...",
  "horsepower": ...,
  "registration_number": "...",
  "first_registration": "YYYY-MM-DD",
  "km_stand": ...,
  "fuel_type": "...",
  "transmission_type": "...",
  "country": "...",
  "equipment_package": "...",
  "co2_emissions": ...,
  "vin_number": "...",
  "estimated_price": ...,
  "features": "comma-separated, lowercase features"
}

Important notes:
- All field names must remain in English.
- All values must be translated and returned in lowercase.
- If an equipment section is present in the HTML, extract bullet points or list items and join them into a single lowercase comma-separated string under "features".

HTML Content:
`;

exports.getListingStatuses = async (req, res) => {
  try {
    // order by id
    const statuses = await Status.findAll({
      order: [['id', 'ASC']],
    });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get new listing count (is_viewed: false and status_id: 2)
exports.getNewListingCount = async (req, res) => {
  try {
    const count = await Listing.count({
      where: {
        is_viewed: false,
        status_id: 2,
        is_deleted: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getListingStatusesAndListingCounts = async (req, res) => {
  try {
    // for each status return listing count, also return a count of listings that are not viewed
    const statuses = await Status.findAll({
      order: [['id', 'ASC']],
    });
    const statusesAndListingCounts = await Promise.all(
      statuses.map(async (status) => {
        // Special case: if status_id is 1, count listings with status_id 1 or 3
        let whereCondition = { status_id: status.id, is_deleted: false };
        let notViewedWhereCondition = {
          status_id: status.id,
          is_viewed: false,
          is_deleted: false,
        };

        if (status.id === 1) {
          whereCondition = {
            status_id: { [Op.in]: [1, 3] },
            is_deleted: false,
          };
          notViewedWhereCondition = {
            status_id: { [Op.in]: [1, 3] },
            is_viewed: false,
            is_deleted: false,
          };
        }

        const count = await Listing.count({ where: whereCondition });
        const notViewedCount = await Listing.count({
          where: notViewedWhereCondition,
        });
        return { status, count, notViewedCount };
      })
    );
    res.json(statusesAndListingCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit);

    // Special case: if limit is 1000 or higher, treat as "get all" request
    if (limit && limit >= 10000) {
      console.log('Large limit detected, setting to null for no pagination');
      limit = null;
    }

    const offset = limit ? (page - 1) * limit : 0;

    // Extract status filter parameter
    let statusId = req.query.status_id ? parseInt(req.query.status_id) : null;

    // Special case: if status_id is 1, return listings with status_id 1 or 3
    let statusIds = null;
    if (statusId === 1) {
      statusIds = [1, 3];
      statusId = null; // Set to null since we're using statusIds array
    }

    // Extract search input parameter
    const input = req.query.input || null;

    // Validate pagination parameters
    if (limit !== null && (limit < 1 || limit > 1000)) {
      return res.status(400).json({
        message: 'Limit must be between 1 and 1000',
      });
    }

    if (page < 1) {
      return res.status(400).json({
        message: 'Page must be greater than 0',
      });
    }

    // Validate status_id parameter
    if (statusId !== null && (isNaN(statusId) || statusId < 1)) {
      return res.status(400).json({
        message: 'status_id must be a positive integer',
      });
    }
    const result = await getAllListingsService(
      limit, // Use the processed limit variable, not parseInt(req.query.limit)
      offset,
      statusIds || statusId, // Pass either statusIds array or single statusId
      input
    );

    // If status is 2, update is_viewed to true in the database for all returned listings
    if (result.listings && result.listings.length > 0) {
      const listingIds = result.listings.map((listing) => listing.id);

      // Update database records
      await Listing.update(
        { is_viewed: true },
        {
          where: {
            id: listingIds,
            is_viewed: false, // Only update if not already viewed
          },
        }
      );

      // Update the response data to reflect the database changes
      result.listings = result.listings.map((listing) => ({
        ...listing,
        is_viewed: true,
      }));
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await getListingService(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing is deleted
    if (listing.is_deleted) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create listing - Main listing creation method with images and file uploads
exports.createMainListingWithImages = async (req, res) => {
  try {
    // DEBUG: Log all damaged parts content for debugging
    console.log('=== DAMAGED PARTS DEBUG INFO ===');
    console.log(
      'req.body.damagedParts:',
      JSON.stringify(req.body.damagedParts, null, 2)
    );
    console.log(
      'Files info:',
      JSON.stringify(
        req.files
          ? req.files.map((file) => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          }))
          : [],
        null,
        2
      )
    );
    console.log('=== END DEBUG INFO ===');

    // FAIL FIRST: Validate required fields immediately
    const { brand_name, model, registration_number, vat_or_margin } = req.body;
    if (!brand_name || !model || !registration_number) {
      return res.status(400).json({
        error: 'Failed to create listing',
        details: 'brand_name, model, and registration_number are required',
      });
    }

    // FAIL FIRST: Check for duplicate registration number early
    console.log('Checking for duplicate registration number:', registration_number);
    const existingListing = await Listing.findOne({
      where: {
        registration_number: registration_number,
      },
    });
    console.log('Duplicate check complete. Found:', !!existingListing);
    if (existingListing) {
      return res.status(409).json({
        error: 'Duplicate listing',
        details: 'Registration number already exists',
        listing: existingListing,
      });
    }

    // Get the listing data directly from req.body
    const listingData = { vat_or_margin, ...req.body };

    // Clean numeric fields to prevent database errors
    const cleanNumericField = (value) => {
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    // Clean numeric fields that might be empty strings
    listingData.amount_purchased = cleanNumericField(
      listingData.amount_purchased
    );
    listingData.belgium_price = cleanNumericField(listingData.belgium_price);
    listingData.avg_selling_time = cleanNumericField(
      listingData.avg_selling_time
    );
    listingData.horsepower = cleanNumericField(listingData.horsepower);
    listingData.km_stand = cleanNumericField(listingData.km_stand);
    listingData.co2 = cleanNumericField(listingData.co2);
    listingData.listing_price = cleanNumericField(listingData.listing_price);
    listingData.submitted_offer_amount = cleanNumericField(
      listingData.submitted_offer_amount
    );
    listingData.amount_sold_for = cleanNumericField(
      listingData.amount_sold_for
    );
    listingData.transport_cost = cleanNumericField(listingData.transport_cost);
    // ASYNC OPTIMIZATION: Process images, files, and reference number in parallel
    const [
      processedImages,
      { manualImages, processedDamagedParts },
      referenceNo,
    ] = await Promise.all([
      // Process image URLs
      Promise.resolve().then(() => {
        if (listingData.images && typeof listingData.images === 'string') {
          return listingData.images
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url && !url.startsWith('@')); // Remove empty strings and @ prefix
        }
        return listingData.images;
      }),

      // Process file uploads
      processFileUploads(req.files, req.body),

      // Generate unique reference number
      generateUniqueReferenceNo(),
    ]);

    // Update listing data with processed images and reference number
    listingData.images = processedImages;
    listingData.reference_no = referenceNo;

    // Combine the data for immediate response
    const requestData = {
      ...listingData,
      manualImages,
      processedDamagedParts,
    };

    // ASYNC OPTIMIZATION: Create listing immediately and process images in background
    console.log('Calling createListingWithImages service...');
    const listing = await createListingWithImages(requestData);
    console.log('createListingWithImages service returned successfully');

    // Return success immediately
    res.status(201).json({
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({
      error: 'Failed to create listing',
      details: error.message,
    });
  }
};

// HELPER FUNCTION: Extract file processing logic for better async handling
async function processFileUploads(files, reqBody) {
  const manualImages = [];
  const damagedPartsImageFiles = [];

  // Early return if no files
  if (!files || files.length === 0) {
    return { manualImages, processedDamagedParts: [] };
  }

  // PARALLEL PROCESSING: Separate files by type concurrently
  files.forEach((file) => {
    if (file.fieldname === 'manuelImages') {
      manualImages.push(file.buffer);
    } else if (
      file.fieldname.includes('damagedParts') &&
      file.fieldname.includes('images')
    ) {
      damagedPartsImageFiles.push(file);
    }
  });

  // Process damaged parts with optimized structure
  const processedDamagedParts = await processDamagedParts(
    damagedPartsImageFiles,
    reqBody
  );

  return { manualImages, processedDamagedParts };
}

// HELPER FUNCTION: Optimized damaged parts processing
async function processDamagedParts(damagedPartsImageFiles, reqBody) {
  const processedDamagedParts = [];

  // Group files by part index with optimized parsing
  const partGroups = {};
  const imageCounters = {}; // Track how many images we've processed per part

  // First, extract part IDs and descriptions from reqBody.damagedParts array
  if (reqBody.damagedParts && Array.isArray(reqBody.damagedParts)) {
    reqBody.damagedParts.forEach((partData, partIndex) => {
      if (partData && partData.part) {
        if (!partGroups[partIndex]) {
          partGroups[partIndex] = {
            part: null,
            images: [],
            descriptions: [],
            partDescriptions: [], // Add support for partDescriptions
          };
          imageCounters[partIndex] = 0; // Initialize counter
        }
        partGroups[partIndex].part = partData.part;

        // Extract descriptions - handle both string and array cases
        if (partData.descriptions) {
          if (Array.isArray(partData.descriptions)) {
            partGroups[partIndex].descriptions = partData.descriptions;
          } else if (typeof partData.descriptions === 'string') {
            // If it's a string, use it as the first description
            partGroups[partIndex].descriptions = [partData.descriptions];
          }
        }

        // Extract partDescriptions for parts with no images
        if (
          partData.partDescriptions &&
          Array.isArray(partData.partDescriptions)
        ) {
          partGroups[partIndex].partDescriptions = partData.partDescriptions;
        }
      }
    });
  }

  // Process files sequentially to maintain proper order and avoid overwrites
  for (const file of damagedPartsImageFiles) {
    // Parse field name like "damagedParts[0][images][0]" or "damagedParts[0][images]"
    const match = file.fieldname.match(
      /damagedParts\[(\d+)\]\[images\](?:\[(\d+)\])?/
    );

    if (match) {
      const partIndex = parseInt(match[1]);
      let imageIndex;

      if (match[2]) {
        // Explicit image index provided
        imageIndex = parseInt(match[2]);
      } else {
        // No explicit index, use counter to avoid overwrites
        imageIndex = imageCounters[partIndex] || 0;
        imageCounters[partIndex] = (imageCounters[partIndex] || 0) + 1;
      }

      if (!partGroups[partIndex]) {
        partGroups[partIndex] = {
          part: null,
          images: [],
          descriptions: [],
          partDescriptions: [],
        };
      }

      partGroups[partIndex].images[imageIndex] = file.buffer;

      console.log(
        `Processed file: ${file.originalname} -> partIndex: ${partIndex}, imageIndex: ${imageIndex}`
      );
    } else {
      console.log('No match found for fieldname:', file.fieldname);
    }
  }

  // Build final damaged parts array
  Object.keys(partGroups).forEach((partIndex) => {
    const partData = partGroups[partIndex];

    if (partData.part) {
      // Handle parts with images
      if (partData.images.length > 0) {
        partData.images.forEach((imageBuffer, imageIndex) => {
          if (imageBuffer) {
            const description =
              partData.descriptions && partData.descriptions[imageIndex]
                ? partData.descriptions[imageIndex]
                : null;

            processedDamagedParts.push({
              part_id: parseInt(partData.part),
              image: imageBuffer,
              description: description,
            });

            console.log(
              `Created damaged part entry with image: part_id=${partData.part}, imageIndex=${imageIndex}, has_description=${!!description}`
            );
          }
        });
      }

      // Handle parts with no images but with partDescriptions
      if (partData.partDescriptions && partData.partDescriptions.length > 0) {
        partData.partDescriptions.forEach((description, descIndex) => {
          if (description && description.trim()) {
            processedDamagedParts.push({
              part_id: parseInt(partData.part),
              image: null, // No image for these entries
              description: description.trim(),
            });

            console.log(
              `Created damaged part entry without image: part_id=${partData.part}, descIndex=${descIndex}, description="${description.trim()}"`
            );
          }
        });
      }
    }
  });

  console.log(
    `Total damaged part entries to create: ${processedDamagedParts.length}`
  );

  return processedDamagedParts;
}

// HELPER FUNCTION: Process damaged parts for update (direct format)
async function processUpdateDamagedParts(damagedPartsArray, files) {
  const processedDamagedParts = [];

  // Handle file uploads for new damaged part images
  const damagedPartsImageFiles = [];
  if (files && files.length > 0) {
    files.forEach((file) => {
      if (
        file.fieldname.includes('damagedParts') &&
        file.fieldname.includes('images')
      ) {
        damagedPartsImageFiles.push(file);
      }
    });
  }

  // Process each damaged part from the direct format
  for (let i = 0; i < damagedPartsArray.length; i++) {
    const partData = damagedPartsArray[i];

    if (partData.part_id) {
      let imageBuffer = null;

      // Check if there's a new image file for this part
      const imageFile = damagedPartsImageFiles.find((file) => {
        const match = file.fieldname.match(/damagedParts\[(\d+)\]/);
        return match && parseInt(match[1]) === i;
      });

      if (imageFile) {
        // New image uploaded
        imageBuffer = imageFile.buffer;
        console.log(
          `New image uploaded for damaged part ${i}: ${imageFile.originalname}`
        );
      } else if (partData.photo && partData.photo.startsWith('http')) {
        // Keep existing photo URL (don't process as buffer)
        processedDamagedParts.push({
          part_id: parseInt(partData.part_id),
          image: null, // Don't process existing URLs as buffers
          description: partData.description,
          existingPhotoUrl: partData.photo, // Keep track of existing URL
        });
        continue;
      }

      // Create damaged part entry
      processedDamagedParts.push({
        part_id: parseInt(partData.part_id),
        image: imageBuffer, // null for text-only, buffer for new images
        description: partData.description,
      });

      console.log(
        `Processed update damaged part: part_id=${partData.part_id}, has_new_image=${!!imageBuffer}, description="${partData.description}"`
      );
    }
  }

  console.log(
    `Total update damaged part entries to process: ${processedDamagedParts.length}`
  );

  return processedDamagedParts;
}

// Create listing with direct data
exports.createListing = async (req, res) => {
  try {
    // Sanitize the request body data
    const listingData = sanitizeListingData(req.body);

    const listing = await createListingService(listingData);
    res.status(201).json({
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({
      error: 'Failed to create listing',
      details: error.message,
    });
  }
};

// Helper function to sanitize data - convert empty strings to null for numeric fields
const sanitizeListingData = (data) => {
  const numericFields = [
    'listing_price',
    'transport_cost',
    'submitted_offer_amount',
    'amount_sold_for',
    'amount_purchased',
    'km_stand',
    'seller_id',
    'status_id',
    'assigned_to_id',
    'expiration',
  ];

  const sanitizedData = { ...data };

  numericFields.forEach((field) => {
    if (sanitizedData[field] === '') {
      sanitizedData[field] = null;
    }
  });

  return sanitizedData;
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await getListingService(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing is deleted
    if (listing.is_deleted) {
      return res.status(400).json({ message: 'Cannot update deleted listing' });
    }

    // Sanitize the request body data
    const sanitizedData = sanitizeListingData(req.body);

    // Update the listing with the sanitized data
    const updatedListing = await updateListingService(
      req.params.id,
      sanitizedData
    );

    res.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update listing with images and damaged parts
exports.updateListingWithImages = async (req, res) => {
  try {
    const listing = await getListingService(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing is deleted
    if (listing.is_deleted) {
      return res.status(400).json({ message: 'Cannot update deleted listing' });
    }

    // DEBUG: Log all damaged parts content for debugging
    console.log('=== UPDATE DAMAGED PARTS DEBUG INFO ===');
    console.log(
      'req.body.damagedParts:',
      JSON.stringify(req.body.damagedParts, null, 2)
    );
    console.log(
      'Files info:',
      JSON.stringify(
        req.files
          ? req.files.map((file) => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          }))
          : [],
        null,
        2
      )
    );
    console.log('=== END UPDATE DEBUG INFO ===');

    // Get the listing data from req.body
    const { damagedParts, images, ...listingData } = req.body;

    // Process images if provided
    let processedImages;
    if (images && typeof images === 'string') {
      processedImages = images
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url && !url.startsWith('@')); // Remove empty strings and @ prefix
    } else {
      processedImages = images;
    }

    // Process manual image uploads
    const manualImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === 'manuelImages') {
          manualImages.push(file.buffer);
        }
      });
    }

    // Process damaged parts for update (direct format)
    let processedDamagedParts = [];
    if (damagedParts && Array.isArray(damagedParts)) {
      processedDamagedParts = await processUpdateDamagedParts(
        damagedParts,
        req.files
      );
    }

    // Combine the data for update
    const updateData = {
      ...listingData,
      images: processedImages,
      manualImages,
      processedDamagedParts,
    };

    // Update listing with images and damaged parts
    const updatedListing = await updateListingService(
      req.params.id,
      updateData
    );

    res.json({
      message: 'Listing updated successfully',
      data: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing with images:', error);
    res.status(400).json({
      error: 'Failed to update listing',
      details: error.message,
    });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const deletedListing = await deleteListingService(req.params.id);

    res.json({
      message: 'Listing deleted successfully',
      listing: {
        id: deletedListing.id,
        is_deleted: deletedListing.is_deleted,
        updated_at: deletedListing.updated_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.extractListingAdvanced = async (req, res) => {
  let browser;
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlObj = new URL(url);
    let extractedData;

    // Handle different domains
    if (urlObj.hostname.includes('listingsiteb.example.com')) {
      // Extract the ID from the end of the URL
      const match = url.match(/\/(\d+)(?:\/|$)/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid ListingSiteB URL format' });
      }

      // Use page scraping instead of deprecated API
      extractedData = await scrapeListingSiteBPage(url);

      if (!extractedData) {
        return res
          .status(400)
          .json({ error: 'Failed to extract data from listingsiteb.example.com' });
      }
    } else {
      // For other domains, use GPT API
      const browserOptions = getPuppeteerConfigForScraping();
      browser = await puppeteer.launch(browserOptions);
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });

      extractedData = await extractDataWithGPT(page);
    }

    // Create the listing with translations
    try {
      const listing = await createListingWithImages(extractedData, url);
      return res.status(201).json({
        message: 'Listing extracted and created successfully',
        data: listing,
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      return res.status(400).json({
        error: 'Failed to create listing',
        details: error.message,
      });
    }
  } catch (error) {
    console.error('Error extracting listing:', error);
    return res.status(500).json({
      error: 'Failed to extract listing information',
      details: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// admin panel uses this version to scrape
// Extract listing from URL (ListingSiteB only - returns extracted data without creating listing)
// Updated to use page rendering instead of deprecated API
exports.extractListingListingSiteB = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlObj = new URL(url);

    // Only handle ListingSiteB URLs
    if (!urlObj.hostname.includes('listingsiteb.example.com')) {
      return res.status(400).json({
        error:
          'Only ListingSiteB URLs are supported. Use the advanced endpoint for other URLs.',
      });
    }

    // Extract the ID from the end of the URL
    const match = url.match(/\/(\d+)(?:\/|$)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid ListingSiteB URL format' });
    }
    console.log('[extractListingListingSiteB] Extracting listing ID:', match[1]);

    // Use the shared helper function to scrape the page
    const extractedData = await extractListingSiteBListing(url);

    if (!extractedData) {
      return res
        .status(400)
        .json({ error: 'Failed to extract data from listingsiteb.example.com' });
    }

    // Return extracted data without creating listing
    return res.status(200).json({
      message: 'Data extracted successfully',
      data: extractedData,
    });
  } catch (error) {
    console.error('[extractListingListingSiteB] Error extracting listing:', error);
    return res.status(500).json({
      error: 'Failed to extract listing information',
      details: error.message,
    });
  }
};

// Extract listing from URL (ListingSiteA only - logs incoming URL)
exports.extractListingSiteA = async (req, res) => {
  try {
    const { url, oldversion } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log the incoming URL
    console.log('ListingSiteA URL received:', url, 'Old version:', !!oldversion);

    // Use the service to extract ListingSiteA data
    const scrapedData = await extractListingSiteAListing(url, oldversion);

    // Return success response with scraped data
    return res.status(200).json({
      message: 'ListingSiteA data scraped successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error scraping ListingSiteA URL:', error);
    return res.status(500).json({
      error: 'Failed to scrape ListingSiteA URL',
      details: error.message,
    });
  }
};

// Extract listing from URL (ListingSiteC only - logs incoming URL and HTML content)
exports.extractListingListingSiteC = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log the incoming URL
    console.log('ListingSiteC URL received:', url);

    // Use the service to extract ListingSiteC data
    const scrapedData = await extractListingSiteCListing(url);

    // Return success response with scraped data
    return res.status(200).json({
      message: 'ListingSiteC page rendered and HTML content logged successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error rendering ListingSiteC URL:', error);
    return res.status(500).json({
      error: 'Failed to render ListingSiteC URL',
      details: error.message,
    });
  }
};

// Extract listing from URL (Hasznaltauto only - logs incoming URL and HTML content)
exports.extractListingHasznaltauto = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log the incoming URL
    console.log('Hasznaltauto URL received:', url);

    // Use the service to extract Hasznaltauto data
    const scrapedData = await extractHasznaltautoListing(url);

    // Return success response with scraped data
    return res.status(200).json({
      message:
        'Hasznaltauto page rendered and HTML content logged successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error rendering Hasznaltauto URL:', error);
    return res.status(500).json({
      error: 'Failed to render Hasznaltauto URL',
      details: error.message,
    });
  }
};

// Extract listing from URL (Sauto.cz)
exports.extractListingSauto = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log the incoming URL
    console.log('Sauto.cz URL received:', url);

    // Use the service to extract Sauto.cz data
    const scrapedData = await extractSautoListing(url);

    // Return success response with scraped data
    return res.status(200).json({
      message: 'Sauto.cz listing extracted successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error extracting Sauto.cz listing:', error);
    return res.status(500).json({
      error: 'Failed to extract Sauto.cz listing',
      details: error.message,
    });
  }
};

// Extract listing from URL (Mobile.de only - logs incoming URL and HTML content)
exports.extractListingMobileDe = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log the incoming URL
    console.log('Mobile.de URL received:', url);

    // Use the service to extract Mobile.de data
    const scrapedData = await extractMobileDeListing(url);

    // Return success response with scraped data
    return res.status(200).json({
      message: 'Mobile.de page rendered and HTML content logged successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Error rendering Mobile.de URL:', error);
    return res.status(500).json({
      error: 'Failed to render Mobile.de URL',
      details: error.message,
    });
  }
};

// Get all listings with status id 1
exports.getAllListingsWithStatusOne = async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: {
        status_id: 1,
        is_deleted: false,
      },
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
      order: [['created_at', 'DESC']],
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update listing status
exports.updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId } = req.body;
    const listing = await Listing.findByPk(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Chec if listing is deleted
    if (listing.is_deleted) {
      return res
        .status(400)
        .json({ message: 'Cannot update status of deleted listing' });
    }

    const previousStatusId = listing.status_id;
    listing.status_id = statusId;
    listing.is_viewed = false;
    await listing.save();

    // Create a status update entry
    await StatusUpdate.create({
      listing_id: id,
      previous_status_id: previousStatusId,
      current_status_id: statusId,
    });
    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get listings based on status
exports.getListingsByStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const listings = await Listing.findAll({
      where: {
        status_id: statusId,
        is_deleted: false,
      },
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
      order: [['created_at', 'DESC']],
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reserve listing
exports.reserveListing = async (req, res) => {
  try {
    const { listing_id, dealer_id } = req.body;

    // Get the listing from database
    const listing = await Listing.findByPk(listing_id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get the dealer (user) from database
    const dealer = await User.findByPk(dealer_id);

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Update the listing's assigned_to_id
    await listing.update({
      assigned_to_id: dealer_id,
      status_id: 2,
      is_viewed: false,
    });

    // Send stage-based reservation email to the dealer
    try {
      const emailData = {
        vendorAccountName: dealer.name,
        brand: listing.brand_name,
        model: listing.model,
        vinNumber: listing.vin_number,
        registrationNumber: listing.registration_number,
        listingPrice: listing.listing_price,
        // You can add more fields as needed
      };

      const emailResponse = await emailService.sendStageEmail(
        'Reserved',
        dealer.email,
        emailData,
        dealer.language || 'en'
      );
    } catch (emailError) {
      console.error('Failed to send reservation stage email:', emailError);
      // Don't fail the reservation if email sending fails
    }

    res.status(200).json({
      message: 'Listing reserved successfully',
      data: {
        listing_id,
        dealer_id,
      },
    });
  } catch (error) {
    console.error('Error in reserveListing:', error);
    res.status(500).json({ error: error.message });
  }
};

// Make an offer on listing
exports.offerListing = async (req, res) => {
  try {
    const { listing_id, dealer_id, offer_amount } = req.body;

    if (!offer_amount) {
      return res.status(400).json({ error: 'Offer amount is required' });
    }

    // Get the listing from database
    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get the dealer (user) from database
    const dealer = await User.findByPk(dealer_id);

    if (!dealer) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Update the listing's assigned_to_id and store the offer amount
    await listing.update({
      status_id: 3,
      offer_amount: offer_amount,
      is_viewed: false,
      assigned_to_id: dealer_id,
    });

    // Send stage-based offers email to the dealer
    try {
      const emailData = {
        vendorAccountName: dealer.name,
        brand: listing.brand_name,
        model: listing.model,
        vinNumber: listing.vin_number,
        offerAmount: offer_amount,
      };

      await emailService.sendStageEmail(
        'Offers',
        dealer.email,
        emailData,
        dealer.language || 'en'
      );
    } catch (emailError) {
      console.error('Failed to send offers stage email:', emailError);
      // Don't fail the operation if email sending fails
    }

    res.status(200).json({
      message: 'Offer submitted successfully',
      data: {
        listing_id,
        dealer_id,
        offer_amount,
      },
    });
  } catch (error) {
    console.error('Error in offerListing:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add listing to wishlist
exports.addToWishlistScraped = async (req, res) => {
  try {
    const {
      listing_id,
      user_id,
      listing_vat_type,
      offered_price,
      offered_price_vat_type,
      currency,
    } = req.body;
    // Validate required fields
    if (!listing_id || !user_id) {
      return res.status(400).json({
        error: 'listing_id and user_id are required',
      });
    }

    // Verify that the listing exists
    const listing = await Advert.findByPk(listing_id);
    console.log('listing', listing.toJSON());
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify that the user exists
    const user = await User.findByPk(user_id);
    console.log('user', user.toJSON());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if wishlist option already exists for this user and listing
    const existingWishlistOption = await WishlistOptions.findOne({
      where: {
        user_id: user_id,
        listing_id: listing_id,
      },
    });

    const wishlistData = {
      user_id,
      listing_id,
      listing_vat_type: listing_vat_type || null,
      offered_price: offered_price || null,
      offered_price_vat_type: offered_price_vat_type || null,
      currency: currency || 'EUR',
    };

    let wishlistOption;
    let message;

    if (existingWishlistOption) {
      // Update existing wishlist option
      await existingWishlistOption.update(wishlistData);
      wishlistOption = existingWishlistOption;
      message = 'Wishlist option updated successfully';
    } else {
      // Create new wishlist option
      wishlistOption = await WishlistOptions.create(wishlistData);
      message = 'Listing added to wishlist successfully';
    }

    res.status(200).json({
      message,
      data: wishlistOption,
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add batch listings to wishlist
exports.addBatchToWishlist = async (req, res) => {
  try {
    const { wishlist_entries } = req.body;

    // Validate required fields
    if (
      !wishlist_entries ||
      !Array.isArray(wishlist_entries) ||
      wishlist_entries.length === 0
    ) {
      return res.status(400).json({
        error: 'wishlist_entries array is required and must not be empty',
      });
    }

    // Validate that all entries have required fields and get the user_id
    let user_id = null;
    for (const entry of wishlist_entries) {
      if (!entry.listing_id || !entry.user_id) {
        return res.status(400).json({
          error: 'listing_id and user_id are required for all wishlist entries',
        });
      }

      // Ensure all entries are for the same user
      if (user_id === null) {
        user_id = entry.user_id;
      } else if (user_id !== entry.user_id) {
        return res.status(400).json({
          error: 'All wishlist entries must be for the same user',
        });
      }
    }

    // Verify that the user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract listing IDs and verify all listings exist
    const listingIds = wishlist_entries.map((entry) => entry.listing_id);
    const listings = await Advert.findAll({
      where: {
        id: listingIds,
      },
    });

    if (listings.length !== listingIds.length) {
      const foundListingIds = listings.map((listing) => listing.id);
      const missingIds = listingIds.filter(
        (id) => !foundListingIds.includes(id)
      );
      return res.status(404).json({
        error: `Listings not found: ${missingIds.join(', ')}`,
      });
    }

    // Start transaction to ensure atomicity
    const transaction = await WishlistOptions.sequelize.transaction();

    try {
      // Delete all existing wishlist entries for this user
      await WishlistOptions.destroy({
        where: {
          user_id: user_id,
        },
        transaction,
      });

      // Prepare wishlist data for bulk creation
      const wishlistData = wishlist_entries.map((entry) => ({
        user_id: entry.user_id,
        listing_id: entry.listing_id,
        listing_vat_type: entry.listing_vat_type || null,
        offered_price: entry.offered_price || null,
        offered_price_vat_type: entry.offered_price_vat_type || null,
        currency: entry.currency || 'EUR',
      }));

      // Create new wishlist entries
      const createdWishlistOptions = await WishlistOptions.bulkCreate(
        wishlistData,
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message: 'Batch wishlist updated successfully',
        data: {
          user_id: user_id,
          entries_deleted: 'all previous entries',
          entries_created: createdWishlistOptions.length,
          wishlist_options: createdWishlistOptions,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error in addBatchToWishlist:', error);
    res.status(500).json({ error: error.message });
  }
};

// Set listing as purchased
exports.setPurchased = async (req, res) => {
  try {
    const { listing_id, amount_sold_for, transport_cost } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    if (!amount_sold_for) {
      return res.status(400).json({ error: 'Amount sold for is required' });
    }

    if (!transport_cost) {
      return res.status(400).json({ error: 'Transport cost is required' });
    }

    // Get the listing from database
    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing in database with sold amount and purchased status
    await listing.update({
      status_id: 4, // Assuming status_id 4 represents purchased
      amount_sold_for: amount_sold_for,
      transport_cost: transport_cost,
      is_viewed: false,
    });
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name, // Add this for consistency
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            amountSoldFor: amount_sold_for,
            amount_sold_for: amount_sold_for, // Add this for consistency
          };

          await emailService.sendStageEmail(
            'Purchased',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error('Failed to send purchased stage email:', emailError);
        // Don't fail the operation if email sending fails
      }
    }

    // Create invoice for the purchased listing
    // let invoice = null;
    // if (listing.assigned_to_id) {
    //   try {
    //     // Generate invoice number (you can customize this format)
    //     const invoiceNumber = `INV-${listing.reference_no || listing.id}-${Date.now()}`;

    //     // Set due date to 1 day from now
    //     const dueDate = new Date();
    //     dueDate.setDate(dueDate.getDate() + 1);

    //     // Ensure currency is in 3-character format
    //     let currencyCode = 'EUR'; // Default to EUR
    //     if (listing.currency) {
    //       // Convert common currency names to ISO codes
    //       const currencyMap = {
    //         euro: 'EUR',
    //         euros: 'EUR',
    //         dollar: 'USD',
    //         dollars: 'USD',
    //         pound: 'GBP',
    //         pounds: 'GBP',
    //         sek: 'SEK',
    //         krona: 'SEK',
    //         kronor: 'SEK',
    //       };

    //       const normalizedCurrency = listing.currency.toLowerCase();
    //       currencyCode =
    //         currencyMap[normalizedCurrency] ||
    //         listing.currency.toUpperCase().substring(0, 3);
    //     }

    //     invoice = await Invoice.create({
    //       dealer_id: listing.assigned_to_id,
    //       amount: amount_sold_for,
    //       currency: currencyCode,
    //       listing_id: listing_id,
    //       invoice_number: invoiceNumber,
    //       description: `Invoice for ${listing.brand_name} ${listing.model} - ${listing.registration_number}`,
    //       due_date: dueDate,
    //       is_paid: false,
    //     });

    //     // Get dealer details for PDF generation and email
    //     const dealer = await User.findByPk(listing.assigned_to_id);

    //     // Generate and upload PDF for the proforma invoice
    //     // try {
    //     //   console.log('Generating PDF for invoice:', invoiceNumber);

    //     //   // Prepare data for PDF generation
    //     //   const invoiceData = {
    //     //     invoice: invoice.toJSON(),
    //     //     dealer: dealer.toJSON(),
    //     //     listing: listing.toJSON(),
    //     //     company: {
    //     //       name: 'Folkbilar i Svedala AB',
    //     //       address: process.env.COMPANY_ADDRESS || 'Svedala, Sweden',
    //     //       phone: process.env.COMPANY_PHONE || '+46 xxx xxx xxx',
    //     //       email: process.env.COMPANY_EMAIL || 'info@folkbilar.se',
    //     //       website: process.env.COMPANY_WEBSITE || 'www.folkbilar.se',
    //     //     },
    //     //   };

    //     //   // Generate PDF and upload to S3
    //     //   const pdfUrl = await createAndUploadInvoicePDF(invoiceData);

    //     //   // Update invoice with PDF link
    //     //   await invoice.update({ link: pdfUrl });

    //     //   console.log('PDF generated and uploaded successfully:', pdfUrl);
    //     // } catch (pdfError) {
    //     //   console.error('Error generating PDF for invoice:', pdfError);
    //     //   // Don't fail the invoice creation if PDF generation fails
    //     // }

    //     // update the listing status to 14
    //     // mail the invoice to the dealer

    //     const transitionResult = await handleTransitions(
    //       listing.zoho_id,
    //       'Proforma Invoice Sent',
    //       {
    //         Stage: 'Proforma Invoice Sent', // Set the target stage
    //       }
    //     );

    //     // Update the listing in database with sold amount and purchased status
    //     await listing.update({
    //       status_id: 5, // Assuming status_id 4 represents purchased
    //       is_viewed: false,
    //     });
    //     // send email to the dealer
    //     const emailData = {
    //       vendorAccountName: dealer.name,
    //       brand: listing.brand_name,
    //       model: listing.model,
    //       vinNumber: listing.vin_number,
    //       invoiceUrl: `${process.env.DASHBOARD_URL}/invoices`,
    //     };
    //     await emailService.sendStageEmail(
    //       'Proforma Invoice Sent',
    //       dealer.email,
    //       emailData,
    //       dealer.language || 'en',
    //       listing
    //     );
    //   } catch (invoiceError) {
    //     console.error('Failed to create invoice:', invoiceError);
    //     // Don't fail the operation if invoice creation fails, but log it
    //   }
    // } else {
    //   console.warn(
    //     `No assigned dealer for listing ${listing_id}, skipping invoice creation`
    //   );
    // }

    res.status(200).json({
      message: 'Listing marked as purchased successfully',
      data: {
        listing_id,
        amount_sold_for,
      },
    });
  } catch (error) {
    console.error('Error in setPurchased:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.setProformaInvoiceSent = async (req, res) => {
  try {
    const { listing_id, billing_company } = req.body;

    // Validate billing_company parameter
    if (billing_company && !['swedish', 'belgian'].includes(billing_company)) {
      return res.status(400).json({
        error: 'Invalid billing_company. Must be "swedish" or "belgian"',
      });
    }

    // trigger transiton
    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    console.log('listing', listing.toJSON());
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 5, is_viewed: false });

    // Generate PDF invoice if billing_company is provided
    let invoiceResult = null;
    let s3InvoiceUrl = null;
    let invoiceEntry = null;
    if (billing_company) {
      try {
        console.log(
          `Generating ${billing_company} invoice for listing ${listing_id}...`
        );

        const invoiceService = new InvoiceService();
        invoiceResult = await invoiceService.generateInvoiceFromListing(
          billing_company,
          listing.toJSON(),
          {
            // Let the service generate sequential invoice number
            outputDir: process.env.INVOICE_OUTPUT_DIR || './invoices',
          }
        );

        console.log(`Invoice generated successfully: ${invoiceResult.pdfPath}`);

        // Upload invoice to S3 and prepare for email attachment
        try {
          const pdfBuffer = fs.readFileSync(invoiceResult.pdfPath);
          const userId = listing.assigned_to_id || 'unknown';
          const invoiceFileName = `${userId}-${invoiceResult.invoiceNumber}`;

          s3InvoiceUrl = await uploadPdfToS3(
            pdfBuffer,
            'invoices',
            invoiceFileName
          );

          console.log(`Invoice uploaded to S3: ${s3InvoiceUrl}`);

          // Store PDF buffer for email attachment
          invoiceResult.pdfBuffer = pdfBuffer;

          // Clean up local file after S3 upload
          fs.unlinkSync(invoiceResult.pdfPath);
          console.log(
            `Local invoice file cleaned up: ${invoiceResult.pdfPath}`
          );
        } catch (s3Error) {
          console.error('Failed to upload invoice to S3:', s3Error);
          // Continue with local file if S3 upload fails
          try {
            // Still try to read the buffer for email attachment
            invoiceResult.pdfBuffer = fs.readFileSync(invoiceResult.pdfPath);
          } catch (bufferError) {
            console.error('Failed to read PDF buffer:', bufferError);
          }
        }

        // Create invoice entry in database
        if (s3InvoiceUrl) {
          try {
            // Calculate due date (2 days from now)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 2);

            const currency = 'EUR';

            // Create invoice entry
            invoiceEntry = await Invoice.create({
              dealer_id: listing.assigned_to_id,
              amount: (
                parseFloat(
                  listing.amount_sold_for || listing.listing_price || 0
                ) + parseFloat(listing.transport_cost || 0)
              ).toFixed(2),
              currency: currency,
              is_paid: false,
              invoice_number: invoiceResult.invoiceNumber,
              description: `Proforma Invoice for ${listing.brand_name} ${listing.model} (VIN: ${listing.vin_number})`,
              due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
              listing_id: listing_id,
              link: s3InvoiceUrl,
            });

            console.log(`Invoice entry created with ID: ${invoiceEntry.id}`);
          } catch (dbError) {
            console.error(
              'Failed to create invoice entry in database:',
              dbError
            );
            // Continue without failing the operation
          }
        }

        // Optionally update the listing with invoice information
        await listing.update({
          proforma_invoice_number: invoiceResult.invoiceNumber,
          proforma_inv_date: new Date(),
          proforma_invoice_s3_url: s3InvoiceUrl,
        });
      } catch (invoiceError) {
        console.error('Failed to generate invoice:', invoiceError);
        // Don't fail the operation if invoice generation fails
        invoiceResult = { error: invoiceError.message };
      }
    }

    // Send stage-based proforma invoice sent email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          console.log(
            'Sending proforma invoice email to dealer:',
            dealer.email
          );
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name, // Add this for consistency
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            amount_sold_for: listing.amount_sold_for || listing.listing_price,
            price: (
              parseFloat(
                listing.amount_sold_for || listing.listing_price || 0
              ) + parseFloat(listing.transport_cost || 0)
            ).toFixed(2),
            invoiceUrl: s3InvoiceUrl, // Pass the S3 URL for the download link
          };

          console.log('Email data:', emailData);
          console.log('Listing data:', listing.toJSON());

          // Prepare email options with attachment if invoice was generated
          const emailOptions = {};
          if (
            invoiceResult &&
            !invoiceResult.error &&
            invoiceResult.pdfBuffer
          ) {
            try {
              emailOptions.attachments = [
                {
                  filename: `${invoiceResult.invoiceNumber}.pdf`,
                  data: invoiceResult.pdfBuffer,
                  contentType: 'application/pdf',
                },
              ];
              console.log('Invoice attachment prepared for email');
            } catch (attachmentError) {
              console.error(
                'Failed to prepare invoice attachment:',
                attachmentError
              );
              // Continue without attachment if there's an error
            }
          }

          await emailService.sendStageEmail(
            'Proforma Invoice Sent',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing,
            emailOptions
          );

          await emailService.sendStageEmail(
            'Proforma Invoice Sent',
            'info@automarket.example.com',
            emailData,
            dealer.language || 'en',
            listing,
            emailOptions
          );

          console.log('Proforma invoice email sent successfully');
        } else {
          console.log('Dealer not found for listing:', listing.assigned_to_id);
        }
      } catch (emailError) {
        console.error(
          'Failed to send proforma invoice sent stage email:',
          emailError
        );
        // Don't fail the operation if email sending fails
      }
    } else {
      console.log('No dealer assigned to listing:', listing_id);
    }

    res.status(200).json({
      message: 'Proforma invoice sent successfully',
      data: {
        listing_id,

        invoice: invoiceResult
          ? {
            success: !invoiceResult.error,
            invoiceNumber: invoiceResult.invoiceNumber || null,
            s3Url: s3InvoiceUrl || null,
            invoiceId: invoiceEntry ? invoiceEntry.id : null,
            error: invoiceResult.error || null,
          }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Payment Received transition
exports.setPaymentReceived = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // find the invoice for the listing
    const invoice = await Invoice.findOne({
      where: { listing_id: listing_id },
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    // update the invoice status to true
    await invoice.update({ is_paid: true });

    // Update the listing status
    await listing.update({ status_id: 6, is_viewed: false });

    // Send stage-based payment received email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name,
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            price: (
              parseFloat(
                listing.amount_sold_for || listing.listing_price || 0
              ) + parseFloat(listing.transport_cost || 0)
            ).toFixed(2),
            amount_sold_for: listing.amount_sold_for || listing.listing_price,
            km_stand: listing.km_stand,
            fuel_type: listing.fuel_type,
            transmission_type: listing.transmission_type,
            first_registration: listing.first_registration,
            currency: listing.currency,
            photos: listing.photos,
            main_image: listing.photos?.[0]?.url,
          };

          await emailService.sendStageEmail(
            'Payment Received',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error(
          'Failed to send payment received stage email:',
          emailError
        );
        // Don't fail the operation if email sending fails
      }
    }

    res.status(200).json({
      message: 'Payment received status updated successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setPaymentReceived:', error);
    res.status(500).json({ error: error.message });
  }
};

// Payment Sent transition
exports.setPaymentSent = async (req, res) => {
  try {
    const {
      listing_id,
      amount_purchased,
      seller_address,
      seller_company,
      seller_email,
      telephone,
    } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Prepare update data
    const updateData = {
      status_id: 7,
      is_viewed: false,
    };

    // Add optional fields if provided
    if (amount_purchased !== undefined)
      updateData.amount_purchased = amount_purchased;
    if (seller_address !== undefined)
      updateData.seller_address = seller_address;
    if (seller_company !== undefined)
      updateData.seller_company = seller_company;
    if (seller_email !== undefined) updateData.seller_email = seller_email;
    if (telephone !== undefined) updateData.telephone = telephone;

    // Update the listing with all provided data
    await listing.update(updateData);

    res.status(200).json({
      message: 'Payment sent status updated successfully',
      data: {
        listing_id,
        amount_purchased,
        seller_address,
        seller_company,
        seller_email,
        telephone,
      },
    });
  } catch (error) {
    console.error('Error in setPaymentSent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send Documents transition
exports.setSendDocuments = async (req, res) => {
  try {
    const { listing_id, tracking_code } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    if (!tracking_code) {
      return res.status(400).json({ error: 'Tracking code is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 9, is_viewed: false });

    // Send stage-based documents sent email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name,
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            trackingCode: tracking_code,
            tracking_code: tracking_code, // Add both formats for consistency
            price: listing.listing_price,
            currency: listing.currency,
            photos: listing.photos,
            main_image: listing.photos?.[0]?.url,
            km_stand: listing.km_stand,
            fuel_type: listing.fuel_type,
            transmission_type: listing.transmission_type,
            first_registration: listing.first_registration,
          };

          await emailService.sendStageEmail(
            'Documents Sent',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error('Failed to send documents sent stage email:', emailError);
        // Don't fail the operation if email sending fails
      }
    }

    res.status(200).json({
      message: 'Documents sent status updated successfully',
      data: {
        listing_id,
        tracking_code,
      },
    });
  } catch (error) {
    console.error('Error in setSendDocuments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Book Transport transition
exports.setBookTransport = async (req, res) => {
  try {
    const { listing_id, expected_pick_up_date, expected_delivery_date } =
      req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    if (!expected_pick_up_date) {
      return res
        .status(400)
        .json({ error: 'Expected pick up date is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 8, is_viewed: false });

    // Send stage-based transport booked email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name,
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            expectedPickUpDate: expected_pick_up_date,
            expected_pick_up_date: expected_pick_up_date,
            expectedDeliveryDate: expected_delivery_date,
            expected_delivery_date: expected_delivery_date,
            price: listing.listing_price,
            currency: listing.currency,
            photos: listing.photos,
            main_image: listing.photos?.[0]?.url,
            km_stand: listing.km_stand,
            fuel_type: listing.fuel_type,
            transmission_type: listing.transmission_type,
            first_registration: listing.first_registration,
          };

          await emailService.sendStageEmail(
            'Transport Booked',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error(
          'Failed to send transport booked stage email:',
          emailError
        );
        // Don't fail the operation if email sending fails
      }
    }

    res.status(200).json({
      message: 'Transport booked status updated successfully',
      data: {
        listing_id,
        expected_pick_up_date,
      },
    });
  } catch (error) {
    console.error('Error in setBookTransport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Car Picked Up transition
exports.setCarPickedUp = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 10, is_viewed: false });

    // Send stage-based car picked up email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name, // Add this for consistency
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
          };

          await emailService.sendStageEmail(
            'Car Picked Up',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error('Failed to send car picked up stage email:', emailError);
        // Don't fail the operation if email sending fails
      }
    }

    res.status(200).json({
      message: 'Car picked up status updated successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setCarPickedUp:', error);
    res.status(500).json({ error: error.message });
  }
};

// Car Delivered transition
exports.setCarDelivered = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 11, is_viewed: false });

    // Send stage-based car delivered email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            dealerName: dealer.name,
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            price: (
              parseFloat(
                listing.amount_sold_for || listing.listing_price || 0
              ) + parseFloat(listing.transport_cost || 0)
            ).toFixed(2),
            amount_sold_for: listing.amount_sold_for,
            listing_price: listing.listing_price,
            currency: listing.currency,
            photos: listing.photos,
            main_image: listing.photos?.[0]?.url,
            km_stand: listing.km_stand,
            fuel_type: listing.fuel_type,
            transmission_type: listing.transmission_type,
            first_registration: listing.first_registration,
          };

          await emailService.sendStageEmail(
            'Car Delivered',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error('Failed to send car delivered stage email:', emailError);
        // Don't fail the operation if email sending fails
      }
    }

    res.status(200).json({
      message: 'Car delivered status updated successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setCarDelivered:', error);
    res.status(500).json({ error: error.message });
  }
};

// Car De-registered transition
exports.setCarDeregistered = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 12, is_viewed: false });

    res.status(200).json({
      message: 'Car de-registered status updated successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setCarDeregistered:', error);
    res.status(500).json({ error: error.message });
  }
};

// Deal Done transition
exports.setDealDone = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 13, is_viewed: false });

    res.status(200).json({
      message: 'Deal completed successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setDealDone:', error);
    res.status(500).json({ error: error.message });
  }
};

// No Deal transition
exports.setNoDeal = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findByPk(listing_id, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']],
          limit: 1,
        },
      ],
    });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Update the listing status
    await listing.update({ status_id: 14, is_viewed: false });

    // Send stage-based no deal email to the dealer if assigned
    if (listing.assigned_to_id) {
      try {
        const dealer = await User.findByPk(listing.assigned_to_id);
        if (dealer) {
          const emailData = {
            vendorAccountName: dealer.name,
            brand: listing.brand_name,
            model: listing.model,
            vinNumber: listing.vin_number,
            listingPrice: listing.listing_price,
          };

          await emailService.sendStageEmail(
            'No Deal',
            dealer.email,
            emailData,
            dealer.language || 'en',
            listing
          );
        }
      } catch (emailError) {
        console.error('Failed to send no deal stage email:', emailError);
        // Don't fail the operation if email sending fails
      }
    }
    res.status(200).json({
      message: 'Deal marked as no deal successfully',
      data: {
        listing_id,
      },
    });
  } catch (error) {
    console.error('Error in setNoDeal:', error);
    res.status(500).json({ error: error.message });
  }
};

// Re-activate expired listing
exports.reactivateListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Find the listing
    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if listing is deleted
    if (listing.is_deleted) {
      return res
        .status(400)
        .json({ error: 'Cannot reactivate deleted listing' });
    }

    // Check if listing has an expiration duration set
    if (!listing.expiration) {
      return res.status(400).json({
        error: 'Cannot reactivate listing without expiration duration',
      });
    }

    const previousStatusId = listing.status_id;

    // Reset the listing's created_at to now (this effectively resets the expiration timer)
    // and move it back to "cars for sale" status (status_id: 1)
    // Use raw SQL to force update of created_at field
    const sequelize = require('../config/database');

    await sequelize.query(
      `UPDATE listings 
       SET status_id = :statusId, 
           created_at = NOW(), 
           is_viewed = false,
           updated_at = NOW()
       WHERE id = :listingId`,
      {
        replacements: {
          statusId: 1,
          listingId: parseInt(id),
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Create a status update entry for tracking
    await StatusUpdate.create({
      listing_id: id,
      previous_status_id: previousStatusId,
      current_status_id: 1,
    });

    // Calculate new expiration time for response
    const newExpirationTime = new Date(
      Date.now() + listing.expiration * 60 * 60 * 1000
    );

    console.log(
      `✅ Listing ID ${listing.id} (${listing.brand_name} ${listing.model} - ${listing.registration_number}) reactivated from status ${previousStatusId} to cars for sale (1). New expiration: ${newExpirationTime}`
    );

    res.status(200).json({
      message: 'Listing reactivated successfully',
      data: {
        listing_id: parseInt(id),
        previous_status_id: previousStatusId,
        current_status_id: 1,
        expiration_hours: listing.expiration,
        new_expiration_time: newExpirationTime,
        reactivated_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in reactivateListing:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteListingPhoto = async (req, res) => {
  try {
    const { id: listingId, photoId } = req.params;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    if (!photoId) {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const photo = await ListingPhotos.findOne({
      where: {
        id: photoId,
        listing_id: listingId,
      },
    });

    if (!photo) {
      return res
        .status(404)
        .json({ error: 'Photo not found or does not belong to this listing' });
    }

    // Delete the photo from S3 (if it's an S3 URL)
    if (photo.url && photo.url.includes('amazonaws.com')) {
      await deleteImageFromS3(photo.url);
    }

    // Delete the photo from the database
    await photo.destroy();

    res.status(200).json({
      message: 'Photo deleted successfully',
      data: {
        listing_id: listingId,
        photo_id: photoId,
      },
    });
  } catch (error) {
    console.error('Error in deleteListingPhoto:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getDealersScrapedListings = async (req, res) => {
  try {
    const { user_id } = req.body;
    const listings = await Advert.findAll({
      where: { seller_id: user_id, is_active: false },
      raw: true,
    });
    res.status(200).json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all listings with comprehensive filtering
exports.getAllListingsHomepage = async (req, res) => {
  try {
    const { Op, Sequelize } = require('sequelize');

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

    const { count, rows: listings } = await Listing.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          separate: true, // This ensures proper loading of all photos
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
        {
          model: DamagedParts,
          as: 'damagedParts',
          separate: true, // This ensures proper loading of all damaged parts
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`
              EXTRACT(EPOCH FROM (created_at + (INTERVAL '1 hour' * expiration) - NOW())) / 3600
            `),
            'remaining_hours',
          ],
        ],
      },
    });

    // Format the remaining time for each listing and include all photos and damaged parts
    const formattedListings = listings.map((listing) => {
      const remainingHours = parseFloat(
        listing.getDataValue('remaining_hours')
      );
      const hours = Math.floor(remainingHours);
      const minutes = Math.round((remainingHours - hours) * 60);
      const listingJson = listing.toJSON();

      // Extract year from first_registration
      const year = listingJson.first_registration
        ? new Date(listingJson.first_registration).getFullYear()
        : null;

      // Determine if available based on status_id (1 or 3 means available)
      const isAvailable = [1, 3].includes(listingJson.status_id);

      // Build condition report from damaged parts
      const conditionReport = listingJson.damagedParts && listingJson.damagedParts.length > 0
        ? listingJson.damagedParts.map(part =>
          `${part.part}: ${part.description || 'No description'}`
        ).join('; ')
        : 'No damages reported';

      // Construct listing URL (adjust base URL as needed)
      const listingUrl = `${process.env.FRONTEND_URL || 'https://automarket.example.com'}/listings/${listingJson.id}`;

      return {
        ...listingJson,
        remaining_time: `${hours}h ${minutes}m`,
        remaining_hours: undefined, // Remove the raw remaining_hours field
        photos: listingJson.photos || [], // Return all photos as an array
        damagedParts: listingJson.damagedParts || [], // Return all damaged parts as an array

        // Placeholder mappings for structured data
        Reference_Number: listingJson.reference_no,
        Listing_URL: listingUrl,
        VIN_Number: listingJson.vin_number,
        Vehicle_Location: listingJson.location,
        First_Registration: listingJson.first_registration,
        Year: year,
        Brand: listingJson.brand_name,
        Model: listingJson.model,
        Vehicle_Category: listingJson.vehicle_category,
        Trim_Package: listingJson.trim_package || listingJson.equipment_package,
        Price: listingJson.listing_price,
        Currency: listingJson.currency,
        Max_Discount: 500, // €500 max discount
        Transport_Cost: listingJson.transport_cost || 530, // €530 default
        Additional_Fees: 29, // €29 for UPS Express
        Odometer: listingJson.km_stand,
        Engine: listingJson.engine,
        Transmission: listingJson.transmission_type,
        Drivetrain: listingJson.drivetrain || listingJson.features,
        Fuel_Type: listingJson.fuel_type,
        Exterior_Color: listingJson.color,
        Interior_Color: listingJson.interior_color,
        Equipment: listingJson.features,
        Condition_Report: conditionReport,
        Is_Available: isAvailable,
        Previous_Accidents: listingJson.previous_accidents,
        Deposit_Amount: 500, // €500 deposit
        Number_of_Owners: listingJson.number_of_owners,
        Service_History: listingJson.service_history,
        Photos_of_Car: listingJson.photos || [],
        Excl_VAT: listingJson.vat_or_margin === 'Excl. VAT',
        Incl_VAT: listingJson.vat_or_margin === 'Incl. VAT',
        VAT_Status: listingJson.vat_or_margin,
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      listings: formattedListings,
      pagination: {
        currentPage: page,
        totalPages,
        totalListings: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error in getAllListingsHomepage:', error);
    res.status(500).json({ error: error.message });
  }
};