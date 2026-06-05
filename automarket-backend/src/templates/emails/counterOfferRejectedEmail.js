const carCard = require('./shared/carCard');
const logoFooter = require('./shared/logoFooter');
const notification = require('./shared/notification');
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

const counterOfferRejectedEmailTemplate = ({
  dealerName,
  listingDetails,
  offer,
  language = 'en',
  dashboardUrl = process.env.DASHBOARD_URL + '/offers' ||
  'https://dashboard.automarket.example.com/offers',
}) => {
  // Format the counter offer amount properly
  const formatOfferAmount = (amount) => {
    if (!amount) return '€0';
    if (typeof amount === 'number') {
      return `€${amount.toLocaleString()}`;
    }
    if (typeof amount === 'string') {
      // Remove any currency symbols and parse
      const cleanAmount = amount.replace(/[€$£,]/g, '');
      const numAmount = parseFloat(cleanAmount);
      if (!isNaN(numAmount)) {
        return `€${numAmount.toLocaleString()}`;
      }
      return amount; // Return as-is if can't parse
    }
    return '€0';
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
      return `${km_stand.toLocaleString()} Km`;
    }
    if (km_stand && typeof km_stand === 'string') {
      return `${km_stand} Km`;
    }
    return 'Km N/A';
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

  const formattedOffer = formatOfferAmount(offer);
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta
      http-equiv="Content-Type"
      content="text/html; charset=UTF-8"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Counter Offer Received</title>
    <style type="text/css">
      /* Basic CSS Reset for Email Clients */
      body,
      table,
      td,
      a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        -ms-interpolation-mode: bicubic;
      }

      /* General Styling */
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }

      table {
        border-collapse: collapse !important;
      }

      a {
        text-decoration: none;
      }

      /* Responsive Styles (limited, but helpful) */
      @media screen and (max-width: 600px) {
        .full-width-image {
          width: 100% !important;
        }

        .stack-column {
          display: block !important;
          width: 100% !important;
        }

        .stack-column-center {
          text-align: center !important;
        }

        .button-wrapper {
          width: 100% !important;
          text-align: center !important;
        }

        .button-wrapper a {
          width: 80% !important;
          display: block !important;
          margin: 10px auto !important;
        }

        .notification-column {
          padding-right: 30px !important;
        }
      }
    </style>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <center style="width: 100%; background-color: #f4f4f4">
      <!-- Outer Table for Centering and Max Width -->
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
        "
      >
        <tr>
          <td
            align="center"
            style="padding-left: 60px; background-color: #f2f2f7"
          >
            <!-- Logo Section -->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="border-collapse: collapse"
            >
              <tr>
                <td
                  align="left"
                  valign="middle"
                >
                  <img
                    src="https://cdn.automarket.example.com/favicon-dark.png"
                    alt="Logo"
                    width="180"
                    style="display: block; border: 0; height: auto;"
                  />
                </td>
                <td
                  align="right"
                  valign="middle"
                >
                  <img
                    src="https://cdn.automarket.example.com/image/upload/v1752927154/b2-arrow_emlqtu.png"
                    alt="Arrow Icon"
                    width="145"
                    height="221"
                    style="display: block; border: 0"
                  />
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td
            style="
              padding: 0px 60px 40px 60px;
              font-family: Arial, sans-serif;

              color: #333333;
              background-color: #f2f2f7;
              margin-top: 70px;
            "
          >
            <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
              >Offer Rejected</strong
            >
            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              The seller has rejected your offer for the following car
            </p>

            <!-- Vehicle Card Section -->
            ${carCard({
    title: getCarTitle(),
    subTitle: getCarSubtitle(),
    imageUrl: getCarImage(),
    mileage: getMileage(),
    fuelType: getFuelType(),
    transmission: getTransmission(),
    offerPrice: formattedOffer,
    hasNotification: true,
    variation: 'declined',
  })}

             <!-- Counter Offer Details -->
            ${notification({
    variation: 'declined',
    offerPrice: formattedOffer,
    language: language,
  })}

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              "
            >
              You may want to follow up with the seller to understand their decision or review the pricing strategy for this vehicle.
            </p>

          </td>
        </tr>

        <!-- Footer Section -->
        <tr>
          <td
            align="center"
          >
            ${logoFooter(language)}
        </tr>
      </table>
    </center>
  </body>
</html>
`;
};

module.exports = counterOfferRejectedEmailTemplate;
