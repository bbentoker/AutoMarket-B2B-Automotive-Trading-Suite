const logoFooter = require('./shared/logoFooter');

// Image URLs configuration
const IMAGES = {
  logo: 'https://cdn.automarket.example.com/favicon-dark.png',
  redLine:
    'https://assets.automarket.example.com/red-line2x.png',
  defaultCarImage:
    'https://assets.automarket.example.com/listings/259/e5cf3d38-5b83-4bdd-aec0-75694723f61c.jpg',
  purchaseProcess:
    'https://assets.automarket.example.com/purchase-process-content.png',
  carsFooter: 'https://assets.automarket.example.com/cars.png',
  footerLogo:
    'https://cdn.automarket.example.com/favicon-dark.png',
  transmissionIcon:
    'https://cdn.automarket.example.com/transmission-icon.png',
  kmIcon:
    'https://cdn.automarket.example.com/mileage-icon.png',
  fuelIcon:
    'https://cdn.automarket.example.com/fuel-icon.png',
  viewDetailsButton:
    'https://assets.automarket.example.com/details-icon.png',
  topIcon:
    'https://assets.automarket.example.com/right-top-vector.png',
  bottomIcon:
    'https://assets.automarket.example.com/left-bottom-vector.png',
  redBg: 'https://assets.automarket.example.com/red-bg.png',
};

const reservationEmailTemplate = ({ userName, listingDetails }) => {
  console.log(listingDetails);
  console.log(userName);
  // Format the price properly
  const formatPrice = (price, currency = '€') => {
    if (!price) return `${currency}0`;
    if (typeof price === 'number') {
      return `${currency}${price.toLocaleString()}`;
    }
    if (typeof price === 'string') {
      // Remove any currency symbols and parse
      const cleanPrice = price.replace(/[€$£,]/g, '');
      const numPrice = parseFloat(cleanPrice);
      if (!isNaN(numPrice)) {
        return `${currency}${numPrice.toLocaleString()}`;
      }
      return price; // Return as-is if can't parse
    }
    return `${currency}0`;
  };

  // Get car image from first ListingPhotos
  const getCarImage = () => {
    if (listingDetails?.photos && listingDetails.photos.length > 0) {
      return (
        listingDetails.photos[0]?.dataValues?.url ||
        listingDetails.photos[0]?.url ||
        IMAGES.defaultCarImage
      );
    }
    return (
      listingDetails?.main_image ||
      listingDetails?.image ||
      IMAGES.defaultCarImage
    );
  };

  // Safely get car details with fallbacks
  const getCarTitle = () => {
    const brand =
      listingDetails?.brand_name ||
      listingDetails?.dataValues?.brand_name ||
      listingDetails?.brand ||
      'Car';
    const model =
      listingDetails?.model || listingDetails?.dataValues?.model || '';
    const firstRegistration =
      listingDetails?.first_registration ||
      listingDetails?.dataValues?.first_registration;

    if (brand && model && firstRegistration) {
      // Get first word of model
      const firstWord = model.split(' ')[0];
      // Extract year from first_registration (format: YYYY-MM-DD)
      const year = firstRegistration.split('-')[0];
      return `${brand} ${firstWord} - ${year}`;
    } else if (brand && model) {
      const firstWord = model.split(' ')[0];
      return `${brand} ${firstWord}`;
    } else if (brand) {
      return brand;
    }
    return 'Vehicle Details';
  };

  const getCarSubtitle = () => {
    const model =
      listingDetails?.model || listingDetails?.dataValues?.model || '';
    if (model) {
      // Get everything after the first word
      const words = model.split(' ');
      if (words.length > 1) {
        return words.slice(1).join(' ');
      }
      return model;
    }
    return (
      listingDetails?.trim ||
      listingDetails?.variant ||
      listingDetails?.specification ||
      listingDetails?.dataValues?.trim ||
      listingDetails?.dataValues?.variant ||
      listingDetails?.dataValues?.specification ||
      'Vehicle Details'
    );
  };

  const getMileage = () => {
    const km_stand =
      listingDetails?.km_stand ||
      listingDetails?.odometer ||
      listingDetails?.dataValues?.km_stand ||
      listingDetails?.dataValues?.odometer;
    if (km_stand && typeof km_stand === 'number') {
      return `${km_stand.toLocaleString()} km`;
    }
    if (km_stand && typeof km_stand === 'string') {
      return `${km_stand} km`;
    }
    return 'km N/A';
  };

  const getFuelType = () => {
    const fuel =
      listingDetails?.fuel_type ||
      listingDetails?.fuel ||
      listingDetails?.dataValues?.fuel_type ||
      listingDetails?.dataValues?.fuel;
    if (fuel) {
      return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
    }
    return 'Fuel N/A';
  };

  const getTransmission = () => {
    const transmission_type =
      listingDetails?.transmission_type ||
      listingDetails?.gear ||
      listingDetails?.dataValues?.transmission_type ||
      listingDetails?.dataValues?.gear;
    if (transmission_type) {
      return (
        transmission_type.charAt(0).toUpperCase() +
        transmission_type.slice(1).toLowerCase()
      );
    }
    return 'Transmission N/A';
  };

  const getVatOrMargin = () => {
    const vat_or_margin =
      listingDetails?.vat_or_margin ||
      listingDetails?.dataValues?.vat_or_margin;
    if (vat_or_margin) {
      return vat_or_margin;
    }
    return '';
  };

  const formattedPrice = formatPrice(
    listingDetails?.listing_price || listingDetails?.price
  );
  const vatOrMargin = getVatOrMargin();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Car Reservation Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #1a202c; background-color: #f8f9fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header Section -->
              <tr>
                <td style="padding: 32px 24px 48px 24px; text-align: left;">
                  <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 24px 0; line-height: 44px;">Hello ${userName},</h1>
                  <p style="font-size: 16px; color: rgba(79, 90, 104, 0.6); line-height: 24px; margin: 0;">You have successfully reserved the following car listing:</p>
                </td>
              </tr>
              
              <!-- Car Card Section -->
              <tr>
                <td style="padding: 0 24px 0 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #ececec; border-radius: 11px; overflow: hidden;">
                    <tr style="height: 200px;">
                      <!-- Car Image -->
                      <td width="45%" style="vertical-align: top; height: 200px;">
                        <img src="${getCarImage()}" 
                             alt="${getCarTitle()}" 
                             style="width: 100%; height: 200px; display: block; background-color: #a9a9a9; object-fit: cover;" />
                      </td>
                      
                      <!-- Car Details -->
                      <td width="55%" style="vertical-align: top; padding:0 17px 0 17px; height: 200px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-top: 20px;">
                              <h2 style="font-size: 16px; font-weight: 500; color: #050b20; margin: 0 0 4px 0; line-height: 16px;">${getCarTitle()}</h2>
                              <p style="font-size: 12px; color: #050b20; opacity: 0.5; margin: 0 0 9px 0; line-height: 16px;">${getCarSubtitle()}</p>
                              <!-- Reserved Tag -->
                              <span style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; margin-left: 8px;">Reserved</span>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="height: 1px; background-color: rgba(144, 163, 191, 0.2); margin: 9px 0;"></td>
                          </tr>
                          
                          <!-- Specifications Row -->
                          <tr>
                            <td>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="33%" style="text-align: center; vertical-align: top;">
                                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                      <tr>
                                        <td style="text-align: center; padding-top: 20px;">
                                          <img src="${IMAGES.kmIcon}" alt="Mileage" style="width: 16px; height: 16px; display: block; margin: 0 auto 9px auto;" />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="text-align: center;">
                                          <span style="font-size: 10px; color: rgba(144, 163, 191, 1); line-height: 16px;">${getMileage()}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td width="33%" style="text-align: center; vertical-align: top;">
                                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                      <tr>
                                        <td style="text-align: center; padding-top: 20px;">
                                          <img src="${IMAGES.fuelIcon}" alt="Fuel" style="width: 16px; height: 16px; display: block; margin: 0 auto 9px auto;" />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="text-align: center;">
                                          <span style="font-size: 10px; color: rgba(144, 163, 191, 1); line-height: 16px;">${getFuelType()}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td width="33%" style="text-align: center; vertical-align: top;">
                                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                      <tr>
                                        <td style="text-align: center; padding-top: 20px;">
                                          <img src="${IMAGES.transmissionIcon}" alt="Transmission" style="width: 16px; height: 16px; display: block; margin: 0 auto 9px auto;" />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="text-align: center;">
                                          <span style="font-size: 10px; color: rgba(144, 163, 191, 1); line-height: 16px;">${getTransmission()}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="height: 1px; background-color: rgba(144, 163, 191, 0.2); margin: 9px 0;"></td>
                          </tr>
                          <!-- Price Section -->
                          <tr>
                            <td style="padding-top: 20px;">
                              <span style="font-size: 13px; font-weight: 700; color: #050b20; line-height: 16px;">${formattedPrice}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Reservation Confirmed Section -->
              <tr>
                <td style="padding: 32px 24px; background-color: #f3f4f6; text-align: center;">
                  <h2 style="font-size: 18px; font-weight: 600; color: #7c3aed; margin: 0 0 8px 0; line-height: 1.4;">Reservation Confirmed!</h2>
                  <p style="font-size: 16px; color: #374151; line-height: 1.5; margin: 0 0 16px 0;">Our team will contact you shortly with further details.</p>
                  <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0;">Thank you for choosing our platform!</p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; text-align: center;">
                  <p style="font-size: 14px; color: #6b7280; line-height: 1.4; margin: 0;">Best regards,<br>Car Sales Platform Team</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = reservationEmailTemplate;
