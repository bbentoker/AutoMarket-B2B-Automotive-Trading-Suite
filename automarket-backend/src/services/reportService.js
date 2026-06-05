const { Op } = require('sequelize');
const UserReportOptions = require('../models/UserReportOptions');
const User = require('../models/User');
const Advert = require('../models/advert');
const Listing = require('../models/Listing');
const ListingPhotos = require('../models/ListingPhotos');

// Function to adjust price based on VAT status for comparison
function adjustPriceForComparison(listingPrice, vatStatus, isAdvert = false) {
  // Handle null/undefined prices
  if (listingPrice === null || listingPrice === undefined) {
    return 0;
  }

  // Convert to number if it's a string
  const price =
    typeof listingPrice === 'string' ? parseFloat(listingPrice) : listingPrice;

  // Handle NaN values
  if (isNaN(price)) {
    return 0;
  }

  // For our listings, return the price as-is (no VAT adjustment needed)
  // The VAT adjustment will be handled in getAdjustedPrices by adjusting the scraped listing
  return price;
}

// Function to get adjusted prices for comparison
function getAdjustedPrices(
  suggestionedListing,
  scrapedListing,
  isSwedish = false
) {
  // Validate inputs
  if (!suggestionedListing || !scrapedListing) {
    console.warn('Missing listing data for price comparison');
    return {
      ourAdjustedPrice: 0,
      dealerAdjustedPrice: 0,
      priceDifference: 0,
      priceDifferencePercentage: 0,
    };
  }

  // Keep our listing price as is (no adjustment needed)
  const ourAdjustedPrice = adjustPriceForComparison(
    suggestionedListing.listing_price,
    suggestionedListing.vat_or_margin,
    false
  );

  // Adjust scraped listing price to match our listing's VAT status
  let dealerAdjustedPrice = scrapedListing.price;

  // Convert scraped listing price to number if it's a string
  if (typeof dealerAdjustedPrice === 'string') {
    dealerAdjustedPrice = parseFloat(dealerAdjustedPrice);
  }

  // Handle null/undefined/NaN values
  if (
    dealerAdjustedPrice === null ||
    dealerAdjustedPrice === undefined ||
    isNaN(dealerAdjustedPrice)
  ) {
    dealerAdjustedPrice = 0;
  }

  // Scraped listings are always Incl. VAT, so we need to adjust based on our listing's VAT status
  if (suggestionedListing.vat_or_margin === 'Excl. VAT') {
    // Use different VAT rates: 8.1% for Swedish users, 21% for others
    const vatRate = isSwedish ? 1.081 : 1.21;
    // Convert scraped listing from Incl. VAT to Excl. VAT for comparison
    dealerAdjustedPrice = dealerAdjustedPrice / vatRate;
  }
  // If our listing is Incl. VAT, no adjustment needed for scraped listing

  // Calculate percentage difference safely
  let priceDifferencePercentage = 0;
  if (dealerAdjustedPrice > 0) {
    priceDifferencePercentage =
      ((dealerAdjustedPrice - ourAdjustedPrice) / dealerAdjustedPrice) * 100;
  }

  return {
    ourAdjustedPrice,
    dealerAdjustedPrice,
    priceDifference: dealerAdjustedPrice - ourAdjustedPrice,
    priceDifferencePercentage,
  };
}

/**
 * Generate email data for a specific user report option
 * @param {number} userReportOptionId - The ID of the UserReportOptions record
 * @param {boolean} isSwedish - Whether the user is Swedish (for VAT calculation)
 * @returns {Promise<Object>} Email data object with user info and suggestions
 */
async function generateWeeklyReportEmailData(
  userReportOptionId,
  isSwedish = false
) {
  try {
    // Get the user report option with user data
    const reportOption = await UserReportOptions.findByPk(userReportOptionId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'company_name', 'language'],
          raw: true,
        },
      ],
    });

    if (!reportOption) {
      throw new Error(
        `UserReportOptions with ID ${userReportOptionId} not found`
      );
    }

    if (!reportOption.user) {
      throw new Error(
        `User not found for report option ID ${userReportOptionId}`
      );
    }

    const user = reportOption.user;
    let suggestions = [];

    // Process each suggestion in the report option
    for (const suggestion of reportOption.suggestions) {
      const suggestionedListing = await Listing.findOne({
        where: {
          reference_no: suggestion.reference_code,
        },
        include: [
          {
            model: ListingPhotos,
            as: 'photos',
            attributes: ['id', 'url'],
            separate: true,
            order: [['id', 'ASC']],
            limit: 1,
          },
        ],
      });

      const scrapedListing = await Advert.findOne({
        where: {
          id: suggestion.listingsitea_listing_id,
        },
        raw: true,
      });

      if (suggestionedListing && scrapedListing) {
        const suggestionedListingPlain = suggestionedListing.get({
          plain: true,
        });
        const firstPhotoUrl =
          (suggestionedListingPlain.photos && suggestionedListingPlain.photos[0]
            ? suggestionedListingPlain.photos[0].url
            : null) || null;
        // Calculate adjusted prices for comparison
        const priceComparison = getAdjustedPrices(
          suggestionedListingPlain,
          scrapedListing,
          isSwedish
        );

        suggestions.push({
          suggestioned_listing: {
            ...suggestionedListingPlain,
            image_url: firstPhotoUrl,
            adjusted_price: priceComparison.ourAdjustedPrice,
            original_price: suggestionedListingPlain.listing_price,
            vat_status: suggestionedListingPlain.vat_or_margin,
          },
          scraped_listing: {
            ...scrapedListing,
            adjusted_price: priceComparison.dealerAdjustedPrice,
            original_price: scrapedListing.price,
            vat_status: 'Incl. VAT', // Adverts are always Incl. VAT
          },
          price_comparison: {
            price_difference: priceComparison.priceDifference,
            price_difference_percentage:
              priceComparison.priceDifferencePercentage,
            our_price_adjusted: priceComparison.ourAdjustedPrice,
            dealer_price_adjusted: priceComparison.dealerAdjustedPrice,
          },
        });
      }
    }

    // Prepare and return email data
    const emailData = {
      userName: user.name,
      companyName: user.company_name || 'Your Company',
      percentage: reportOption.percentage,
      suggestions: suggestions,
    };

    return {
      success: true,
      emailData,
      user,
      reportOption,
    };
  } catch (error) {
    console.error(
      `Error generating weekly report email data for ID ${userReportOptionId}:`,
      error.message
    );
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calculate weekly dealer report statistics.
 *
 * @param {Array} dealers - Array of dealer objects (User model)
 * @param {Array} currentWeekInventory - Current week inventory data
 * @param {Array} prevWeekInventory - Previous week inventory data
 * @param {Array} advertsForFastestSelling - Array of advert objects for fastest selling cars
 * @param {Array} allAdverts - Array of all advert objects for sold cars calculation
 * @returns {Object} Report data formatted like sales performance overview
 */
async function calculateReport(
  dealers,
  currentWeekInventory,
  prevWeekInventory,
  advertsForFastestSelling,
  allAdverts
) {
  // Helper: get the start of a week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper: get the end of a week (Sunday)
  const getWeekEnd = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Helper: get week number of the year
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    // January 4 is always in week 1
    const week1 = new Date(d.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1
    const week1Thursday = new Date(
      week1.getFullYear(),
      0,
      4 + 3 - ((week1.getDay() + 6) % 7)
    );
    return (
      1 +
      Math.round(
        ((d.getTime() - week1Thursday.getTime()) / 86400000 -
          3 +
          ((week1Thursday.getDay() + 6) % 7)) /
          7
      )
    );
  };

  // Time windows - Last week and week before that
  const now = new Date();
  const currentWeekStart = getWeekStart(now);

  // Last week (the week that just ended)
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(currentWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);

  // Calculate last week number
  const lastWeekNumber = getWeekNumber(lastWeekStart);
  const lastWeekYear = lastWeekStart.getFullYear();

  // Week before last week
  const weekBeforeStart = new Date(lastWeekStart);
  weekBeforeStart.setDate(weekBeforeStart.getDate() - 7);
  const weekBeforeEnd = new Date(lastWeekStart);
  weekBeforeEnd.setDate(weekBeforeEnd.getDate() - 1);
  weekBeforeEnd.setHours(23, 59, 59, 999);

  // Calculate week before last week number
  const weekBeforeNumber = getWeekNumber(weekBeforeStart);
  const weekBeforeYear = weekBeforeStart.getFullYear();

  // Group by dealer
  const dealerMap = {};
  dealers.forEach((dealer) => {
    dealerMap[dealer.id] = dealer;
  });

  // Helper: filter by date range
  function inRange(ad, start, end) {
    const soldDate = new Date(ad.last_seen || ad.updated_at || ad.created_at);
    return soldDate >= start && soldDate < end;
  }

  // Helper: group by region
  function groupByRegion(dealers) {
    const map = {};
    dealers.forEach((d) => {
      const region = d.billing_country || d.country || d.location || 'Unknown';
      if (!map[region]) map[region] = [];
      map[region].push(d.id);
    });
    return map;
  }

  // Calculate stats for sold cars based on last_seen date in adverts
  function calcStatsSoldCars(adverts, startDate, endDate) {
    const soldCars = adverts.filter((ad) => {
      if (!ad.last_seen) return false;
      const lastSeenDate = new Date(ad.last_seen);
      return lastSeenDate >= startDate && lastSeenDate <= endDate;
    });
    return { count: soldCars.length };
  }

  // Calculate for each dealer
  const dealerReports = dealers.map((dealer) => {
    // Filter adverts for this dealer (with safety check)
    const dealerAdverts = (allAdverts || []).filter(
      (ad) => ad.seller_id === dealer.id
    );

    // Calculate sold cars for last week and week before that
    const lastWeekStats = calcStatsSoldCars(
      dealerAdverts,
      lastWeekStart,
      lastWeekEnd
    );
    const weekBeforeStats = calcStatsSoldCars(
      dealerAdverts,
      weekBeforeStart,
      weekBeforeEnd
    );

    // Top 3 fastest selling cars for this specific dealer (lowest sell_time)
    const dealerFastestCars = advertsForFastestSelling
      .filter(
        (ad) =>
          ad.seller_id === dealer.id && // Filter by dealer's seller_id
          ad.sell_time !== null &&
          ad.sell_time !== undefined &&
          !isNaN(ad.sell_time) &&
          ad.sell_time <= 12
      )
      .sort((a, b) => a.sell_time - b.sell_time)
      .slice(0, 3)
      .map((ad) => ({
        id: ad.id,
        model: ad.model,
        make: ad.make,
        price: ad.price,
        power: ad.power,
        currency: ad.price_currency || ad.currency,
        sell_time: ad.sell_time,
        first_registration: ad.first_registration,
        created_at: ad.created_at,
        last_seen: ad.last_seen,
        mileage: ad.mileage || ad.km_stand,
        fuel_type: ad.fuel_type,
        transmission: ad.transmission_type || ad.gearbox,
        main_photo: ad.image_url || ad.photo_url || ad.main_photo || null,
        status: ad.status || ad.status_text || null,
      }));

    return {
      dealerId: dealer.id,
      dealerName: dealer.company_name || dealer.name,
      region:
        dealer.billing_country ||
        dealer.country ||
        dealer.location ||
        'Unknown',
      lastWeek: lastWeekStats,
      weekBefore: weekBeforeStats,
      topFastestCars: dealerFastestCars,
    };
  });

  // Regional comparison - based on sold cars (last_seen dates)
  const regionMap = groupByRegion(dealers);
  const regionStats = {};
  for (const region in regionMap) {
    const regionDealerIds = regionMap[region];

    // Get adverts for dealers in this region (with safety check)
    const regionAdverts = (allAdverts || []).filter((ad) =>
      regionDealerIds.includes(ad.seller_id)
    );

    // Calculate sold cars for last week and week before that for the region
    const lastWeekStats = calcStatsSoldCars(
      regionAdverts,
      lastWeekStart,
      lastWeekEnd
    );
    const weekBeforeStats = calcStatsSoldCars(
      regionAdverts,
      weekBeforeStart,
      weekBeforeEnd
    );

    regionStats[region] = {
      lastWeek: { count: lastWeekStats.count },
      weekBefore: { count: weekBeforeStats.count },
    };
  }

  // Attach region comparison to each dealer
  dealerReports.forEach((report) => {
    report.regionComparison = regionStats[report.region] || null;
  });

  // Format output like the sales performance overview image
  const formatSalesPerformanceOverview = (dealerReport) => {
    const { lastWeek, weekBefore, regionComparison, topFastestCars } =
      dealerReport;

    // Calculate changes
    const carsSoldChange = lastWeek.count - weekBefore.count;

    // Calculate regional performance comparison (simplified - only count comparison)
    let regionalPerformance = {
      percentage: 0,
      direction: '=',
      isFaster: false,
    };

    if (
      regionComparison &&
      regionComparison.lastWeek.count > 0 &&
      lastWeek.count > 0
    ) {
      // Simple count comparison
      const dealerCount = lastWeek.count;
      const regionalCount = regionComparison.lastWeek.count;

      if (regionalCount > 0) {
        const percentageDifference =
          ((dealerCount - regionalCount) / regionalCount) * 100;
        if (Math.abs(percentageDifference) > 1) {
          regionalPerformance = {
            percentage: Math.round(Math.abs(percentageDifference)),
            direction: percentageDifference > 0 ? '+' : '-',
            isFaster: percentageDifference > 0,
          };
        }
      }
    }

    return {
      dealerId: dealerReport.dealerId,
      dealerName: dealerReport.dealerName,
      region: dealerReport.region,
      metrics: {
        carsSold: {
          metric: 'Cars Sold',
          lastWeek: lastWeek.count,
          weekBefore: weekBefore.count,
          change: carsSoldChange,
          changeType: carsSoldChange >= 0 ? 'increase' : 'decrease',
        },
      },
      regionalPerformance,
      topFastestCars, // <-- include this in the output
    };
  };

  // Format all dealer reports
  const formattedReports = dealerReports.map(formatSalesPerformanceOverview);

  return {
    generatedAt: new Date(),
    weekInfo: {
      lastWeek: {
        weekNumber: lastWeekNumber,
        year: lastWeekYear,
        startDate: lastWeekStart,
        endDate: lastWeekEnd,
        period: `Week ${lastWeekNumber}, ${lastWeekYear}`,
      },
      weekBefore: {
        weekNumber: weekBeforeNumber,
        year: weekBeforeYear,
        startDate: weekBeforeStart,
        endDate: weekBeforeEnd,
        period: `Week ${weekBeforeNumber}, ${weekBeforeYear}`,
      },
    },
    salesPerformanceOverview: formattedReports,
    regionStats,
  };
}

module.exports = {
  calculateReport,
  generateWeeklyReportEmailData,
  adjustPriceForComparison,
  getAdjustedPrices,
};
