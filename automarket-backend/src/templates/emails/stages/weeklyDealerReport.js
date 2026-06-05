const carCard = require('../shared/carCard');
const logoFooter = require('../shared/logoFooter');
const { IMAGES } = require('../shared/constants');
const deliveryStatusNotification = require('../shared/carStatusNotification');
const carSoldCardHeader = require('../shared/carSoldCardHeader');
const carSoldContainer = require('../shared/carSoldContainer');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Helpers to transform incoming data to the template's expected shape
function getYearFromDateString(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const y = d.getFullYear();
    if (!isNaN(y)) return String(y);
  } catch (_) {}
  // fallback for strings like '2024-01-05' that may not parse in some environments
  const match = String(dateString).match(/^(\d{4})/);
  return match ? match[1] : '';
}

function formatMileage(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return `${value.toLocaleString()} km`;
  const str = String(value);
  return /km/i.test(str) ? str : `${str} km`;
}

function extractHorsePower(powerString, fallback) {
  if (typeof powerString === 'string') {
    const hpMatch =
      powerString.match(/(\d+)\s*hp/i) || powerString.match(/\((\d+)\s*hp\)/i);
    if (hpMatch) return `${hpMatch[1]} hp`;
    return powerString; // already a readable string
  }
  return fallback || '';
}

function getDemandFromSellTime(sellTime) {
  const n = Number(sellTime);
  if (isNaN(n)) return undefined;
  if (n <= 7) return 'veryHigh';
  if (n <= 21) return 'high';
  return undefined;
}

function buildFastSellingCarsFromSuggestions(suggestions = []) {
  return suggestions.map((sugg) => {
    const scraped = sugg.scraped_listing || {};
    const offered = sugg.suggestioned_listing || {};
    const comparison = sugg.price_comparison || {};

    const scrapedModel = [scraped.make, scraped.model]
      .filter(Boolean)
      .join(' ');
    const offeredModel = [offered.brand_name, offered.model]
      .filter(Boolean)
      .join(' ');

    return {
      // Fast-selling car (dealer's first deal from scraped listing)
      model: scrapedModel || scraped.model || '',
      horsePower: extractHorsePower(scraped.power, ''),
      gear: scraped.gearbox || scraped.transmission_type || '',
      mileage: scraped.mileage || formatMileage(scraped.km_stand),
      year: getYearFromDateString(scraped.first_registration),
      soldIn: Math.max(scraped.sell_time || 1, 1),
      image: scraped.image_url,
      price:
        comparison.dealer_price_adjusted ??
        scraped.adjusted_price ??
        scraped.price,
      vatStatus: offered.vat_status || offered.vat_or_margin || 'Excl. VAT',
      // Demand badge for the sold (scraped) car
      demand: getDemandFromSellTime(scraped.sell_time),
      // Offer car (our suggested listing)
      offerCar: {
        id: offered.id,
        model: offeredModel || offered.model || '',
        year: getYearFromDateString(offered.first_registration),
        horsePower: offered.horsepower || extractHorsePower(offered.power, ''),
        mileage: formatMileage(offered.km_stand || offered.mileage),
        gear: offered.transmission_type || offered.gearbox || '',
        soldIn: Math.max(scraped.sell_time || 1, 1),
        image: offered.image_url || scraped.image_url,
        price:
          comparison.our_price_adjusted ??
          offered.adjusted_price ??
          offered.listing_price,
        vatStatus: offered.vat_status || offered.vat_or_margin || 'Excl. VAT',
      },
    };
  });
}

const weeklyDealerReport = (
  data,
  language = 'en',
  listing,
  dealerName,
  loginCode = null
) => {
  // (First name) - (Company name) Report Week (number)
  const firstName = (data && data.userName) || 'Dealer';
  const companyName = (data && data.companyName) || 'Your Company';
  // Extract login code from data if not passed as parameter
  const userLoginCode = loginCode || data?.loginCode || null;
  // Extract weekly report email ID from data
  const weeklyReportEmailId = data?.weeklyReportEmailId || null;
  // Compute ISO week number
  const now = new Date();
  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };
  const weekNumber = getWeekNumber(now);

  // Map incoming suggestions to the expected fastSellingCars structure
  const fastSellingCars = buildFastSellingCarsFromSuggestions(
    (data && Array.isArray(data.suggestions) && data.suggestions) || []
  );

  // Toggleable metrics section (default false)
  const metricsFlag = !!(data && data.metrics);
  const mLastWeek =
    data && data.metricsData && typeof data.metricsData.lastWeek === 'number'
      ? data.metricsData.lastWeek
      : 0;
  const mWeekBefore =
    data && data.metricsData && typeof data.metricsData.weekBefore === 'number'
      ? data.metricsData.weekBefore
      : 0;
  const mChange = mLastWeek - mWeekBefore;
  const mIsIncrease = mChange >= 0;
  const mBadgeBg = mIsIncrease ? '#dcfce7' : '#fee2e2';
  const mTextColor = mIsIncrease ? '#008236' : '#b91c1c';
  const mIconUrl = mIsIncrease
    ? 'https://cdn.automarket.example.com/image/upload/v1754770617/trending-up_oltan8.png'
    : 'https://cdn.automarket.example.com/image/upload/v1754909258/trending-down_mwvyvu.png';
  const mChangeText = `${mIsIncrease ? '+' : ''}${mChange}`;
  const metricsHtml = `
    <tr>
      <td>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="24" style="width: 24px;"></td>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 10px; border: 1px solid #e5e7eb7c;">
                <tr>
                  <td>
                    <table border="0" cellpadding="21" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          ${carSoldCardHeader({
                            icon: 'https://cdn.automarket.example.com/image/upload/v1754764708/award_1_xnxl8l.png',
                            title: 'Sales Performance Overview',
                            subTitle: 'Weekly metrics and trends',
                          })}
                        </td>
                      </tr>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                    <table border="0" cellpadding="10" cellspacing="0" width="100%" style="color: #364153; font-size: 14px; line-height: 1.5rem;">
                      <tr>
                        <td width="25%" style="font-weight: 500; border-bottom: 1px solid #e5e7eb;">Metric</td>
                        <td width="25%" style="font-weight: 500; border-bottom: 1px solid #e5e7eb;">Last Week</td>
                        <td width="25%" style="font-weight: 500; border-bottom: 1px solid #e5e7eb;">Week Before</td>
                        <td width="25%" style="font-weight: 500; border-bottom: 1px solid #e5e7eb;">Change</td>
                      </tr>
                      <tr>
                        <td width="25%">Cars Sold</td>
                        <td width="25%">${mLastWeek}</td>
                        <td width="25%">${mWeekBefore}</td>
                        <td width="25%">
                          <table border="0" cellpadding="3" cellspacing="0" style="background-color: ${mBadgeBg}; border-radius: 4px; display: inline-block;">
                            <tr>
                              <td>
                                <span style="color: ${mTextColor}; font-size: 14px; white-space: nowrap;">
                                  &nbsp;
                                  <img width="12" height="12" src="${mIconUrl}" alt="Trending ${mIsIncrease ? 'Up' : 'Down'}" style="vertical-align: middle; margin-right: 4px;" />
                                  ${mChangeText}&nbsp;
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
            <td width="24" style="width: 24px;"></td>
          </tr>
        </table>
      </td>
    </tr>
     <tr>
      <td align="center">
        <center>
          <img
            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
            alt="Divider"
            width="50%"
            style="display: block; border: 0;"
          />
        </center>
      </td>
    </tr>
    `;

  const templates = {
    en: {
      subject: `${firstName} - ${companyName} Report Week ${weekNumber}`,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4" id="email-body">
                <center style="width: 100%; background-color: #f4f4f4" id="email-center">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      border-collapse: collapse;
                      max-width: 680px;
                      background-color: #ffffff;
                      overflow: hidden;
                      border-radius: 0.5rem;
                    "
                  >
                    <tr style="border: 0.25rem solid #E73C71"></tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table
                          border="0"
                          cellpadding="4"
                          cellspacing="0"
                          style="background-color: #fdf2f8; border: 1px solid #fccee8; border-radius: 999px; margin: auto; "
                          id="company-name-table"
                        >
                          <tr>
                            <td style="padding-left: 10px;" valign="center">
                              <img
                                src="https://cdn.automarket.example.com/image/upload/v1754756221/image-removebg-preview_fzoagu.png"
                                alt="Sparkles Icon"
                                width="24"
                                height="24"
                                style="display: block; border: 0;"
                              />
                            </td>
                            <td valign="center" align="center" style="color: #c6005c; padding-right: 10px;">
                              <center style="font-size: 14px;">${companyName}</center>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <center style="font-size: 26px;font-weight: bold; line-height: 1.2; color: #101828;">Weekly Performance Report</center>
                      </td>
                    </tr>
                    <tr>
                      <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" width="96" height="4">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754905486/output-onlinepngtools_aodakh.png"
                            alt="Pink Background"
                            width="96"
                            height="4"
                            style="max-width: 96px; height: 4px; display: block; border: 0; border-radius: 999px;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="12" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin: 0; color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">Hi <span style="color: #e60076">${firstName}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Here's your weekly performance report &mdash; a clear summary of how your dealership performed last week. It highlights your key sales figures, shows which vehicles sold the fastest, and includes personalized vehicle offers from us, based on what's currently working best for you.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">These insights are built on publicly available data to support smarter inventory decisions and help you continue driving strong results.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    ${metricsFlag ? metricsHtml : ''}
                   
                    <tr>
                      <td height="48" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="24"></td>
                            <td>
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754811433/trending-up-white_dnsfuq.png',
                                title: 'Your Fastest-Selling Cars Last Week',
                                subTitle:
                                  'Exclusive Offers Based on Your Most Successful Sales',
                              })}
                            </td>
                            <td width="24"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="21" width="100%">
                          <tr>
                            <td>
                              ${fastSellingCars.map((car, index) => carSoldContainer({ car, index: index + 1, language, loginCode: userLoginCode, weeklyReportEmailId })).join('')}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754854854/star_knb8rf.png',
                                title:
                                  "Inventory Sourced to Meet Your Dealership's Needs",
                                subTitle:
                                  'Data-Driven, Personalized Car Recommendation',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">At Car Click, we take a data-driven approach to offering vehicles tailored for your dealership.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0;">
                              <p style="margin: 0; color: #364153;">Our recommendations are based on your fastest-selling cars from the previous week.</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">By analyzing data from publicly available sources, we identify the vehicles with the highest demand — ensuring we present you with offers that align perfectly with what's proven to sell best at your dealership right now.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 14px;">
                              <p style="margin: 0; color: #c6005c;">Buying the right cars at the right prices has never been easier.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754857613/circle-check_rq0ir1.png',
                                title: 'We Respect Your Privacy',
                                subTitle:
                                  'Data protection and confidentiality commitment',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">At Car Click, we strictly use data that is publicly available, gathered from multiple trusted sources to aggregate meaningful insights for your dealership. This allows us to provide accurate, data-driven recommendations without ever relying on proprietary or private information.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0 0 0;">
                              <p style="margin: 0; color: #364153;">We are fully committed to protecting your privacy. Your dealership's data is never shared, sold, or disclosed to any third party. We maintain the highest standards of confidentiality and data security, ensuring that your information remains safe and solely used to enhance the services we provide to you.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="65" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754858747/divider-1-circle-2_tsfy1c-removebg-preview_t2kvav.png"
                            alt="Divider"
                            width="25%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 14px;">
                          <img
                          src="${IMAGES.headerLogo}"
                          alt="Car Click Logo"
                          height="37"
                        />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0"><i>Building the future of automotive trade</i></p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; padding: 7px 21px;">
                          <a href="https://automarket.example.com" style="text-decoration: none; color: #101828;">
                            Unsubscribe
                          </a>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; padding: 0 24px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="4" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0; font-size: 0.75rem; color: #6a7282;">© 2025 Car Click. All rights reserved.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0;font-size: 0.75rem; color: #6a7282;">This email was sent to you as part of our dealer partnership program.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr style="border: 0.25rem solid #E73C71"></tr>
                  </table>
                </center>
              </body>`,
    },
    nl: {
      subject: `${firstName} - ${companyName} Rapport Week ${weekNumber}`,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4" id="email-body">
                <center style="width: 100%; background-color: #f4f4f4" id="email-center">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      border-collapse: collapse;
                      max-width: 680px;
                      background-color: #ffffff;
                      overflow: hidden;
                      border-radius: 0.5rem;
                    "
                  >
                    <tr style="border: 0.25rem solid #E73C71"></tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table
                          border="0"
                          cellpadding="4"
                          cellspacing="0"
                          style="background-color: #fdf2f8; border: 1px solid #fccee8; border-radius: 999px; margin: auto; "
                          id="company-name-table"
                        >
                          <tr>
                            <td style="padding-left: 10px;" valign="center">
                              <img
                                src="https://cdn.automarket.example.com/image/upload/v1754756221/image-removebg-preview_fzoagu.png"
                                alt="Sparkles Icon"
                                width="24"
                                height="24"
                                style="display: block; border: 0;"
                              />
                            </td>
                            <td valign="center" align="center" style="color: #c6005c; padding-right: 10px;">
                              <center style="font-size: 14px;">${companyName}</center>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <center style="font-size: 26px;font-weight: bold; line-height: 1.2; color: #101828;">Wekelijks Prestatie Rapport</center>
                      </td>
                    </tr>
                    <tr>
                      <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" width="96" height="4">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754905486/output-onlinepngtools_aodakh.png"
                            alt="Pink Background"
                            width="96"
                            height="4"
                            style="max-width: 96px; height: 4px; display: block; border: 0; border-radius: 999px;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="12" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin: 0; color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">Hallo <span style="color: #e60076">${firstName}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Hier is uw wekelijkse prestatie rapport — een duidelijke samenvatting van hoe uw autobedrijf vorige week heeft gepresteerd. Het belicht uw belangrijkste verkoopcijfers, toont welke voertuigen het snelst verkochten, en bevat gepersonaliseerde voertuigaanbiedingen van ons, gebaseerd op wat momenteel het beste werkt voor u.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Deze inzichten zijn gebaseerd op openbaar beschikbare gegevens om slimmere voorraadbeslissingen te ondersteunen en u te helpen sterke resultaten te blijven behalen.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    ${metricsFlag ? metricsHtml : ''}
                   
                    <tr>
                      <td height="48" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="24"></td>
                            <td>
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754811433/trending-up-white_dnsfuq.png',
                                title:
                                  "Uw Snelst Verkopende Auto's Vorige Week",
                                subTitle:
                                  'Exclusieve Aanbiedingen Gebaseerd op Uw Meest Succesvolle Verkopen',
                              })}
                            </td>
                            <td width="24"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="21" width="100%">
                          <tr>
                            <td>
                              ${fastSellingCars.map((car, index) => carSoldContainer({ car, index: index + 1, language, loginCode: userLoginCode, weeklyReportEmailId })).join('')}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754854854/star_knb8rf.png',
                                title:
                                  "Voorraad Gesourced om aan Uw Autobedrijf's Behoeften te Voldoen",
                                subTitle:
                                  'Data-Gedreven, Gepersonaliseerde Auto Aanbeveling',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Bij Car Click nemen we een data-gedreven aanpak om voertuigen aan te bieden die zijn afgestemd op uw autobedrijf.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0;">
                              <p style="margin: 0; color: #364153;">Onze aanbevelingen zijn gebaseerd op uw snelst verkopende auto's van de vorige week.</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Door gegevens van openbaar beschikbare bronnen te analyseren, identificeren we de voertuigen met de hoogste vraag — en zorgen ervoor dat we u aanbiedingen presenteren die perfect aansluiten bij wat momenteel het beste verkoopt bij uw autobedrijf.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 14px;">
                              <p style="margin: 0; color: #c6005c;">Het kopen van de juiste auto's tegen de juiste prijzen is nog nooit zo eenvoudig geweest.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754857613/circle-check_rq0ir1.png',
                                title: 'Wij Respecteren Uw Privacy',
                                subTitle:
                                  'Toezegging voor Gegevensbescherming en Vertrouwelijkheid',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Bij Car Click gebruiken we strikt gegevens die openbaar beschikbaar zijn, verzameld van meerdere vertrouwde bronnen om betekenisvolle inzichten voor uw autobedrijf te aggregeren. Dit stelt ons in staat om nauwkeurige, data-gedreven aanbevelingen te geven zonder ooit te vertrouwen op eigendoms- of privé-informatie.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0 0 0;">
                              <p style="margin: 0; color: #364153;">We zijn volledig toegewijd aan het beschermen van uw privacy. De gegevens van uw autobedrijf worden nooit gedeeld, verkocht of bekendgemaakt aan derden. We handhaven de hoogste normen voor vertrouwelijkheid en gegevensbeveiliging, en zorgen ervoor dat uw informatie veilig blijft en uitsluitend wordt gebruikt om de diensten die we u bieden te verbeteren.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="65" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754858747/divider-1-circle-2_tsfy1c-removebg-preview_t2kvav.png"
                            alt="Divider"
                            width="25%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 14px;">
                          <img
                          src="${IMAGES.headerLogo}"
                          alt="Car Click Logo"
                          height="37"
                        />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0"><i>Bouwen aan de toekomst van de auto-handel</i></p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; padding: 7px 21px;">
                          <a href="https://automarket.example.com" style="text-decoration: none; color: #101828;">
                            Afmelden
                          </a>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; padding: 0 24px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="4" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0; font-size: 0.75rem; color: #6a7282;">© 2025 Car Click. Alle rechten voorbehouden.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0;font-size: 0.75rem; color: #6a7282;">Deze e-mail is naar u verzonden als onderdeel van ons dealer partnership programma.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                                         <tr style="border: 0.25rem solid #E73C71"></tr>
                   </table>
                 </center>
               </body>`,
    },
    fr: {
      subject: `${firstName} - ${companyName} Rapport Semaine ${weekNumber}`,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4" id="email-body">
                <center style="width: 100%; background-color: #f4f4f4" id="email-center">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      border-collapse: collapse;
                      max-width: 680px;
                      background-color: #ffffff;
                      overflow: hidden;
                      border-radius: 0.5rem;
                    "
                  >
                    <tr style="border: 0.25rem solid #E73C71"></tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table
                          border="0"
                          cellpadding="4"
                          cellspacing="0"
                          style="background-color: #fdf2f8; border: 1px solid #fccee8; border-radius: 999px; margin: auto; "
                          id="company-name-table"
                        >
                          <tr>
                            <td style="padding-left: 10px;" valign="center">
                              <img
                                src="https://cdn.automarket.example.com/image/upload/v1754756221/image-removebg-preview_fzoagu.png"
                                alt="Sparkles Icon"
                                width="24"
                                height="24"
                                style="display: block; border: 0;"
                              />
                            </td>
                            <td valign="center" align="center" style="color: #c6005c; padding-right: 10px;">
                              <center style="font-size: 14px;">${companyName}</center>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <center style="font-size: 26px;font-weight: bold; line-height: 1.2; color: #101828;">Rapport de Performance Hebdomadaire</center>
                      </td>
                    </tr>
                    <tr>
                      <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" width="96" height="4">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754905486/output-onlinepngtools_aodakh.png"
                            alt="Pink Background"
                            width="96"
                            height="4"
                            style="max-width: 96px; height: 4px; display: block; border: 0; border-radius: 999px;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="12" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin: 0; color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">Bonjour <span style="color: #e60076">${firstName}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Voici votre rapport de performance hebdomadaire — un résumé clair de la performance de votre concessionnaire la semaine dernière. Il met en évidence vos principaux chiffres de vente, montre quels véhicules se sont vendus le plus rapidement, et inclut des offres de véhicules personnalisées de notre part, basées sur ce qui fonctionne actuellement le mieux pour vous.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Ces analyses sont basés sur des données publiquement disponibles pour soutenir des décisions d'inventaire plus intelligentes et vous aider à continuer à obtenir de solides résultats.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    ${metricsFlag ? metricsHtml : ''}
                   
                    <tr>
                      <td height="48" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="24"></td>
                            <td>
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754811433/trending-up-white_dnsfuq.png',
                                title:
                                  'Vos Voitures les Plus Vendues la Semaine Dernière',
                                subTitle:
                                  'Offres Exclusives Basées sur Vos Ventes les Plus Réussies',
                              })}
                            </td>
                            <td width="24"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="21" width="100%">
                          <tr>
                            <td>
                              ${fastSellingCars.map((car, index) => carSoldContainer({ car, index: index + 1, language, loginCode, weeklyReportEmailId })).join('')}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754854854/star_knb8rf.png',
                                title:
                                  'Inventaire Sourcé pour Répondre aux Besoins de Votre Concessionnaire',
                                subTitle:
                                  'Recommandation de Voiture Personnalisée et Basée sur les Données',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Chez Car Click, nous adoptons une approche basée sur les données pour offrir des véhicules adaptés à votre concessionnaire.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0;">
                              <p style="margin: 0; color: #364153;">Nos recommandations sont basées sur vos voitures les plus vendues de la semaine précédente.</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">En analysant les données de sources publiquement disponibles, nous identifions les véhicules avec la plus forte demande — en nous assurant de vous présenter des offres qui s'alignent parfaitement avec ce qui se vend le mieux actuellement dans votre concessionnaire.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 14px;">
                              <p style="margin: 0; color: #c6005c;">Acheter les bonnes voitures aux bons prix n'a jamais été aussi facile.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754857613/circle-check_rq0ir1.png',
                                title: 'Nous Respectons Votre Confidentialité',
                                subTitle:
                                  'Engagement de Protection des Données et de Confidentialité',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Chez Car Click, nous utilisons strictement des données qui sont publiquement disponibles, collectées auprès de multiples sources fiables pour agréger des insights significatifs pour votre concessionnaire. Cela nous permet de fournir des recommandations précises et basées sur les données sans jamais nous fier à des informations propriétaires ou privées.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0 0 0;">
                              <p style="margin: 0; color: #364153;">Nous nous engageons pleinement à protéger votre confidentialité. Les données de votre concessionnaire ne sont jamais partagées, vendues ou divulguées à des tiers. Nous maintenons les plus hauts standards de confidentialité et de sécurité des données, en nous assurant que vos informations restent sûres et sont utilisées uniquement pour améliorer les services que nous vous fournissons.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="65" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754858747/divider-1-circle-2_tsfy1c-removebg-preview_t2kvav.png"
                            alt="Divider"
                            width="25%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 14px;">
                          <img
                          src="${IMAGES.headerLogo}"
                          alt="Car Click Logo"
                          height="37"
                        />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0"><i>Construire l'avenir du commerce automobile</i></p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; padding: 7px 21px;">
                          <a href="https://automarket.example.com" style="text-decoration: none; color: #101828;">
                            Se désabonner
                          </a>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; padding: 0 24px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="4" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0; font-size: 0.75rem; color: #6a7282;">© 2025 Car Click. Tous droits réservés.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0;font-size: 0.75rem; color: #6a7282;">Cet e-mail vous a été envoyé dans le cadre de notre programme de partenariat concessionnaire.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                                         <tr style="border: 0.25rem solid #E73C71"></tr>
                   </table>
                 </center>
               </body>`,
    },
    it: {
      subject: `${firstName} - ${companyName} Rapporto Settimana ${weekNumber}`,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4" id="email-body">
                <center style="width: 100%; background-color: #f4f4f4" id="email-center">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      border-collapse: collapse;
                      max-width: 680px;
                      background-color: #ffffff;
                      overflow: hidden;
                      border-radius: 0.5rem;
                    "
                  >
                    <tr style="border: 0.25rem solid #E73C71"></tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table
                          border="0"
                          cellpadding="4"
                          cellspacing="0"
                          style="background-color: #fdf2f8; border: 1px solid #fccee8; border-radius: 999px; margin: auto; "
                          id="company-name-table"
                        >
                          <tr>
                            <td style="padding-left: 10px;" valign="center">
                              <img
                                src="https://cdn.automarket.example.com/image/upload/v1754756221/image-removebg-preview_fzoagu.png"
                                alt="Sparkles Icon"
                                width="24"
                                height="24"
                                style="display: block; border: 0;"
                              />
                            </td>
                            <td valign="center" align="center" style="color: #c6005c; padding-right: 10px;">
                              <center style="font-size: 14px;">${companyName}</center>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <center style="font-size: 26px;font-weight: bold; line-height: 1.2; color: #101828;">Rapporto di Performance Settimanale</center>
                      </td>
                    </tr>
                    <tr>
                      <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" width="96" height="4">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754905486/output-onlinepngtools_aodakh.png"
                            alt="Pink Background"
                            width="96"
                            height="4"
                            style="max-width: 96px; height: 4px; display: block; border: 0; border-radius: 999px;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="12" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin: 0; color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">Ciao <span style="color: #e60076">${firstName}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Ecco il tuo rapporto di performance settimanale — un riassunto chiaro di come la tua concessionaria ha performato la scorsa settimana. Evidenzia le tue principali cifre di vendita, mostra quali veicoli si sono venduti più velocemente, e include offerte di veicoli personalizzate da parte nostra, basate su ciò che attualmente funziona meglio per te.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Questi insight sono basati su dati pubblicamente disponibili per supportare decisioni di inventario più intelligenti e aiutarti a continuare a ottenere risultati solidi.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    ${metricsFlag ? metricsHtml : ''}
                   
                    <tr>
                      <td height="48" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="24"></td>
                            <td>
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754811433/trending-up-white_dnsfuq.png',
                                title:
                                  'Le Tue Auto Più Vendute la Scorsa Settimana',
                                subTitle:
                                  'Offerte Esclusive Basate sulle Tue Vendite Più Riuscite',
                              })}
                            </td>
                            <td width="24"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="21" width="100%">
                          <tr>
                            <td>
                              ${fastSellingCars.map((car, index) => carSoldContainer({ car, index: index + 1, language, loginCode, weeklyReportEmailId })).join('')}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754854854/star_knb8rf.png',
                                title:
                                  'Inventario Sourcato per Soddisfare le Esigenze della Tua Concessionaria',
                                subTitle:
                                  'Raccomandazione Auto Personalizzata e Basata sui Dati',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">In Car Click, adottiamo un approccio basato sui dati per offrire veicoli adattati alla tua concessionaria.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0;">
                              <p style="margin: 0; color: #364153;">Le nostre raccomandazioni sono basate sulle tue auto più vendute della settimana precedente.</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Analizzando i dati da fonti pubblicamente disponibili, identifichiamo i veicoli con la domanda più alta — assicurandoci di presentarti offerte che si allineano perfettamente con ciò che attualmente si vende meglio nella tua concessionaria.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 14px;">
                              <p style="margin: 0; color: #c6005c;">Comprare le auto giuste ai prezzi giusti non è mai stato così facile.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754857613/circle-check_rq0ir1.png',
                                title: 'Rispettiamo la Tua Privacy',
                                subTitle:
                                  'Impegno per la Protezione dei Dati e la Riservatezza',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">In Car Click, utilizziamo rigorosamente dati che sono pubblicamente disponibili, raccolti da multiple fonti affidabili per aggregare insight significativi per la tua concessionaria. Questo ci permette di fornire raccomandazioni accurate e basate sui dati senza mai fare affidamento su informazioni proprietarie o private.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0 0 0;">
                              <p style="margin: 0; color: #364153;">Siamo pienamente impegnati a proteggere la tua privacy. I dati della tua concessionaria non sono mai condivisi, venduti o divulgati a terzi. Manteniamo i più alti standard di riservatezza e sicurezza dei dati, assicurandoci che le tue informazioni rimangano sicure e siano utilizzate esclusivamente per migliorare i servizi che ti forniamo.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="65" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754858747/divider-1-circle-2_tsfy1c-removebg-preview_t2kvav.png"
                            alt="Divider"
                            width="25%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 14px;">
                          <img
                          src="${IMAGES.headerLogo}"
                          alt="Car Click Logo"
                          height="37"
                        />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0"><i>Costruire il futuro del commercio automobilistico</i></p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; padding: 7px 21px;">
                          <a href="https://automarket.example.com" style="text-decoration: none; color: #101828;">
                            Annulla iscrizione
                          </a>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; padding: 0 24px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="4" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0; font-size: 0.75rem; color: #6a7282;">© 2025 Car Click. Tutti i diritti riservati.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0;font-size: 0.75rem; color: #6a7282;">Questa email ti è stata inviata come parte del nostro programma di partnership concessionaria.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                                         <tr style="border: 0.25rem solid #E73C71"></tr>
                   </table>
                 </center>
               </body>`,
    },
    de: {
      subject: `${firstName} - ${companyName} Bericht Woche ${weekNumber}`,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4" id="email-body">
                <center style="width: 100%; background-color: #f4f4f4" id="email-center">
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      border-collapse: collapse;
                      max-width: 680px;
                      background-color: #ffffff;
                      overflow: hidden;
                      border-radius: 0.5rem;
                    "
                  >
                    <tr style="border: 0.25rem solid #E73C71"></tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table
                          border="0"
                          cellpadding="4"
                          cellspacing="0"
                          style="background-color: #fdf2f8; border: 1px solid #fccee8; border-radius: 999px; margin: auto; "
                          id="company-name-table"
                        >
                          <tr>
                            <td style="padding-left: 10px;" valign="center">
                              <img
                                src="https://cdn.automarket.example.com/image/upload/v1754756221/image-removebg-preview_fzoagu.png"
                                alt="Sparkles Icon"
                                width="24"
                                height="24"
                                style="display: block; border: 0;"
                              />
                            </td>
                            <td valign="center" align="center" style="color: #c6005c; padding-right: 10px;">
                              <center style="font-size: 14px;">${companyName}</center>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <center style="font-size: 26px;font-weight: bold; line-height: 1.2; color: #101828;">Wöchentlicher Leistungsbericht</center>
                      </td>
                    </tr>
                    <tr>
                      <td height="8" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center" width="96" height="4">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754905486/output-onlinepngtools_aodakh.png"
                            alt="Pink Background"
                            width="96"
                            height="4"
                            style="max-width: 96px; height: 4px; display: block; border: 0; border-radius: 999px;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="12" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <p style="margin: 0; color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">Hallo <span style="color: #e60076">${firstName}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Hier ist Ihr wöchentlicher Leistungsbericht — eine klare Zusammenfassung der Leistung Ihres Autohauses in der vergangenen Woche. Er hebt Ihre wichtigsten Verkaufszahlen hervor, zeigt, welche Fahrzeuge am schnellsten verkauft wurden, und enthält personalisierte Fahrzeugangebote von uns, basierend auf dem, was derzeit am besten für Sie funktioniert.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="96"></td>
                            <td>
                              <p style="margin: 0;">Diese Erkenntnisse basieren auf öffentlich verfügbaren Daten, um intelligentere Bestandsentscheidungen zu unterstützen und Ihnen zu helfen, weiterhin starke Ergebnisse zu erzielen.</p>
                            </td>
                            <td width="96"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td height="40" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    ${metricsFlag ? metricsHtml : ''}
                   
                    <tr>
                      <td height="48" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="24"></td>
                            <td>
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754811433/trending-up-white_dnsfuq.png',
                                title:
                                  'Ihre Schnellstverkaufenden Autos Letzte Woche',
                                subTitle:
                                  'Exklusive Angebote Basierend auf Ihren Erfolgreichsten Verkäufen',
                              })}
                            </td>
                            <td width="24"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="21" width="100%">
                          <tr>
                            <td>
                              ${fastSellingCars.map((car, index) => carSoldContainer({ car, index: index + 1, language, loginCode, weeklyReportEmailId })).join('')}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754854854/star_knb8rf.png',
                                title:
                                  'Bestand Gesourced um die Bedürfnisse Ihres Autohauses zu Erfüllen',
                                subTitle:
                                  'Datengetriebene, Personalisierte Auto-Empfehlung',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Bei Car Click verfolgen wir einen datengetriebenen Ansatz, um Fahrzeuge anzubieten, die auf Ihr Autohaus zugeschnitten sind.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0;">
                              <p style="margin: 0; color: #364153;">Unsere Empfehlungen basieren auf Ihren schnellstverkaufenden Autos der vorherigen Woche.</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Durch die Analyse von Daten aus öffentlich verfügbaren Quellen identifizieren wir die Fahrzeuge mit der höchsten Nachfrage — und stellen sicher, dass wir Ihnen Angebote präsentieren, die perfekt zu dem passen, was derzeit in Ihrem Autohaus am besten verkauft wird.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 14px;">
                              <p style="margin: 0; color: #c6005c;">Die richtigen Autos zu den richtigen Preisen zu kaufen war noch nie einfacher.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td style="padding: 0 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 10px; border: 1px solid #e5e7eb; padding: 21px;">
                          <tr>
                            <td style="color: #4a5565; font-size: 16px; line-height: 24px; text-align: center; padding-bottom: 21px;">
                              ${carSoldCardHeader({
                                icon: 'https://cdn.automarket.example.com/image/upload/v1754857613/circle-check_rq0ir1.png',
                                title: 'Wir Respektieren Ihre Privatsphäre',
                                subTitle:
                                  'Verpflichtung zum Datenschutz und zur Vertraulichkeit',
                              })}
                            </td>
                          </tr>

                          <tr>
                            <td>
                              <p style="margin: 0; color: #364153;">Bei Car Click verwenden wir streng Daten, die öffentlich verfügbar sind, gesammelt von mehreren vertrauenswürdigen Quellen, um aussagekräftige Erkenntnisse für Ihr Autohaus zu aggregieren. Dies ermöglicht es uns, präzise, datengetriebene Empfehlungen zu geben, ohne uns jemals auf proprietäre oder private Informationen zu verlassen.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 14px 0 0 0;">
                              <p style="margin: 0; color: #364153;">Wir sind voll und ganz dem Schutz Ihrer Privatsphäre verpflichtet. Die Daten Ihres Autohauses werden niemals geteilt, verkauft oder an Dritte weitergegeben. Wir halten die höchsten Standards für Vertraulichkeit und Datensicherheit ein und stellen sicher, dass Ihre Informationen sicher bleiben und ausschließlich zur Verbesserung der Dienstleistungen verwendet werden, die wir Ihnen anbieten.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td height="23" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754762061/divider_pw1jmo.png"
                            alt="Divider"
                            width="50%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="65" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td align="center">
                        <center>
                          <img
                            src="https://cdn.automarket.example.com/image/upload/v1754858747/divider-1-circle-2_tsfy1c-removebg-preview_t2kvav.png"
                            alt="Divider"
                            width="25%"
                            style="display: block; border: 0;"
                          />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; padding: 14px;">
                          <img
                          src="${IMAGES.headerLogo}"
                          alt="Car Click Logo"
                          height="37"
                        />
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="14" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0"><i>Die Zukunft des Automobilhandels gestalten</i></p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="40" width="40%" align="center">
                        <center style="width: fit-content;border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; padding: 7px 21px;">
                          <a href="https://automarket.example.com" style="text-decoration: none; color: #101828;">
                            Abmelden
                          </a>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6; padding: 0 24px;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td height="4" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0; font-size: 0.75rem; color: #6a7282;">© 2025 Car Click. Alle Rechte vorbehalten.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <center>
                          <p style="margin: 0;font-size: 0.75rem; color: #6a7282;">Diese E-Mail wurde Ihnen als Teil unseres Händler-Partnerschaftsprogramms gesendet.</p>
                        </center>
                      </td>
                    </tr>

                    <tr>
                      <td height="28" style="font-size: 1px; line-height: 1px; background-color: #ffffff;">&nbsp;</td>
                    </tr>

                    <tr style="border: 0.25rem solid #E73C71"></tr>
                  </table>
                </center>
              </body>`,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { weeklyDealerReport, languages };
