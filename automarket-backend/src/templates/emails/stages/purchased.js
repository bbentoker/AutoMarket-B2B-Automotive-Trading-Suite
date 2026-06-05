const logoFooter = require('../shared/logoFooter');
const carCard = require('../shared/carCard');
const notification = require('../shared/notification');
const { IMAGES } = require('../shared/constants');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Helper functions for car details
const getCarImage = (data) => {
  if (data?.photos && data.photos.length > 0) {
    return (
      data.photos[0]?.dataValues?.url ||
      data.photos[0]?.url ||
      IMAGES.defaultCarImage
    );
  }
  return data?.main_image || data?.image || IMAGES.defaultCarImage;
};

const getCarTitle = (data) => {
  const brand = data?.brand_name || data?.brand || 'Car';
  const model = data?.model || '';
  const firstRegistration = data?.first_registration;

  if (brand && model && firstRegistration) {
    const firstWord = model.split(' ')[0];
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

const getCarSubtitle = (data) => {
  const model = data?.model || '';
  if (model) {
    const words = model.split(' ');
    if (words.length > 1) {
      return words.slice(1).join(' ');
    }
    return model;
  }
  return (
    data?.trim || data?.variant || data?.specification || 'Vehicle Details'
  );
};

const getMileage = (data) => {
  const km_stand = data?.km_stand || data?.odometer;
  if (km_stand && typeof km_stand === 'number') {
    return `${km_stand.toLocaleString()} km`;
  }
  if (km_stand && typeof km_stand === 'string') {
    return `${km_stand} km`;
  }
  return 'km N/A';
};

const getFuelType = (data) => {
  const fuel = data?.fuel_type || data?.fuel;
  if (fuel) {
    return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
  }
  return 'Fuel N/A';
};

const getTransmission = (data) => {
  const transmission_type = data?.transmission_type || data?.gear;
  if (transmission_type) {
    return (
      transmission_type.charAt(0).toUpperCase() +
      transmission_type.slice(1).toLowerCase()
    );
  }
  return 'Transmission N/A';
};

const formatPrice = (price, currency = '€') => {
  console.log('price', price);
  if (!price) return `${currency}0`;
  if (typeof price === 'number') {
    return `${currency}${price.toLocaleString()}`;
  }
  if (typeof price === 'string') {
    const cleanPrice = price.replace(/[€$£,]/g, '');
    const numPrice = parseFloat(cleanPrice);
    if (!isNaN(numPrice)) {
      return `${currency}${numPrice.toLocaleString()}`;
    }
    return price;
  }
  return `${currency}0`;
};

const purchasedTemplate = (data, language = 'en', listing, dealerName) => {
  // Use listing details if available, otherwise fall back to data
  const carData = listing || data;

  const [
    carTitle,
    carSubtitle,
    carImage,
    fuelType,
    transmission,
    mileage,
    price,
  ] = [
    getCarTitle(carData),
    getCarSubtitle(carData),
    getCarImage(carData),
    getFuelType(carData),
    getTransmission(carData),
    getMileage(carData),
    formatPrice(
      carData?.amount_sold_for || carData?.amountSoldFor || carData?.price || 0
    ),
  ];

  // Use actual VIN from data, fallback to placeholder
  const VIN = carData?.vin_number || carData?.vinNumber || 'VIN N/A';
  const offerPrice = formatPrice(
    carData?.amount_sold_for || carData?.amountSoldFor || carData?.price || 0,
    '€'
  );

  const templates = {
    en: {
      subject: 'Your Car Purchase Has Been Confirmed',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src=${IMAGES.headerLogo}
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
                      src=${IMAGES.headerRedLine}
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
                >Dear ${dealerName},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Great news! We're pleased to confirm the successful purchase of your <span style="font-weight: 700">${carTitle}</span>, <span style="font-weight: 700">VIN: ${VIN}</span>.
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice,
                hasNotification: true,
                variation: 'purchased',
                offerPrice: price,
              })}

              ${notification({
                variation: 'purchased',
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
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  font-weight: 700;
                  "
                >
                  Next Steps:
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  A proforma invoice will be sent to you shortly. We kindly ask that payment be completed within 48 hours to allow us to proceed with booking transport for your vehicle.
                </p>
              </p>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Thank you for placing your trust in Car Click.
              </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Best regards,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
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
    </body>`,
    },
    nl: {
      subject: 'Uw Auto Aankoop is Bevestigd',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src=${IMAGES.headerLogo}
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
                      src=${IMAGES.headerRedLine}
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
                >Beste ${dealerName},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Geweldig nieuws! Wij zijn verheugd de succesvolle aankoop van uw <span style="font-weight: 700">${carTitle}</span>, <span style="font-weight: 700">VIN: ${VIN}</span> te bevestigen.
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice,
                hasNotification: true,
                variation: 'purchased',
                offerPrice: price,
              })}

              ${notification({
                variation: 'purchased',
                language: language,
              })}



              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Dank u voor uw vertrouwen in Car Click.
              </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Met vriendelijke groet,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
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
    </body>`,
    },
    fr: {
      subject: 'Votre Achat de Voiture a été Confirmé',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src=${IMAGES.headerLogo}
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
                      src=${IMAGES.headerRedLine}
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
                >Cher ${dealerName},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Excellente nouvelle ! Nous sommes heureux de confirmer l'achat réussi de votre <span style="font-weight: 700">${carTitle}</span>, <span style="font-weight: 700">VIN: ${VIN}</span>.
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice,
                hasNotification: true,
                variation: 'purchased',
                offerPrice: price,
              })}

              ${notification({
                variation: 'purchased',
                language: language,
              })}



              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Merci de votre confiance en Car Click.
              </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Cordialement,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Équipe Car Click
                </p>
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
    </body>`,
    },
    it: {
      subject: 'Il Tuo Acquisto Auto è Stato Confermato',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src=${IMAGES.headerLogo}
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
                      src=${IMAGES.headerRedLine}
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
                >Gentile ${dealerName},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Ottime notizie! Siamo lieti di confermare l'acquisto avvenuto con successo della vostra <span style="font-weight: 700">${carTitle}</span>, <span style="font-weight: 700">VIN: ${VIN}</span>.
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice,
                hasNotification: true,
                variation: 'purchased',
                offerPrice: price,
              })}

              ${notification({
                variation: 'purchased',
                language: language,
              })}



              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Grazie per la vostra fiducia in Car Click.
              </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Cordiali saluti,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
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
    </body>`,
    },
    de: {
      subject: 'Ihr Autokauf wurde Bestätigt',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src=${IMAGES.headerLogo}
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
                      src=${IMAGES.headerRedLine}
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
                >Sehr geehrte/r ${dealerName},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Großartige Neuigkeiten! Wir freuen uns, den erfolgreichen Kauf Ihres <span style="font-weight: 700">${carTitle}</span>, <span style="font-weight: 700">VIN: ${VIN}</span> zu bestätigen.
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice,
                hasNotification: true,
                variation: 'purchased',
                offerPrice: price,
              })}

              ${notification({
                variation: 'purchased',
                language: language,
              })}



              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Vielen Dank für Ihr Vertrauen in Car Click.
              </p>

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;
                  margin-top: 24px;
                  "
              >
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                  >
                  Freundliche Grüße,
                </p>
                <p style="margin: 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #4F5A6899;"
                >
                  Team Car Click
                </p>
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
    </body>`,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { purchasedTemplate, languages };
