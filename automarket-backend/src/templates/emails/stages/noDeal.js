const logoFooter = require('../shared/logoFooter');
const carCard = require('../shared/carCard');
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

const noDealTemplate = (data, language = 'en', listing, dealerName) => {
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
      formatPrice(carData?.listing_price || carData?.price || 0),
    ];

  const firstName =
    dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer';

  const templates = {
    en: {
      subject: `${firstName} - Your offer has been declined`,
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

                color: #1A202C;
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
              Unfortunately, we couldn't reach a deal with the seller for the <span style="font-weight: 600">${carTitle}</span>. We'll be in touch if we successfully source something similar.
              </p>

              <p
                style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
                "
              >
                In the meantime, feel free to browse other available cars directly on the platform.
              </p>

              ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        hasNotification: true,
        variation: 'declined',
        offerPrice: price,
        hideYourOfferText: true,
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
      subject: `${firstName} - Uw bod is afgewezen`,
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

                color: #1A202C;
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
              Helaas konden we geen deal bereiken met de verkoper voor de <span style="font-weight: 600">${carTitle}</span>. We nemen contact met u op als we iets vergelijkbaars vinden.
              </p>

              <p
                style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
                "
              >
                In de tussentijd kunt u andere beschikbare auto's direct op het platform bekijken.
              </p>

              ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        hasNotification: true,
        variation: 'declined',
        offerPrice: price,
        hideYourOfferText: true,
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
      subject: `${firstName} - Votre offre a été refusée`,
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

                color: #1A202C;
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
              Malheureusement, nous n'avons pas pu conclure un accord avec le vendeur pour la <span style="font-weight: 600">${carTitle}</span>. Nous vous contacterons si nous trouvons quelque chose de similaire.
              </p>

              <p
                style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
                "
              >
                En attendant, n'hésitez pas à consulter d'autres véhicules disponibles directement sur la plateforme.
              </p>

              ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        hasNotification: true,
        variation: 'declined',
        offerPrice: price,
        hideYourOfferText: true,
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
      subject: `${firstName} - La tua offerta è stata rifiutata`,
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

                color: #1A202C;
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
              Purtroppo non siamo riusciti a raggiungere un accordo con il venditore per la <span style="font-weight: 600">${carTitle}</span>. Vi contatteremo se troveremo qualcosa di simile.
              </p>

              <p
                style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
                "
              >
                Nel frattempo, potete consultare altri veicoli disponibili direttamente sulla piattaforma.
              </p>

              ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        hasNotification: true,
        variation: 'declined',
        offerPrice: price,
        hideYourOfferText: true,
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
      subject: `${firstName} - Ihr Angebot wurde abgelehnt`,
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

                color: #1A202C;
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
              Leider konnten wir keine Einigung mit dem Verkäufer für den <span style="font-weight: 600">${carTitle}</span> erzielen. Wir werden Sie kontaktieren, wenn wir etwas Ähnliches finden.
              </p>

              <p
                style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
                "
              >
                In der Zwischenzeit können Sie andere verfügbare Fahrzeuge direkt auf der Plattform durchsuchen.
              </p>

              ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        hasNotification: true,
        variation: 'declined',
        offerPrice: price,
        hideYourOfferText: true,
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
                  color: #4F5A6899;"
                  >
                  Mit freundlichen Grüßen,
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

module.exports = { noDealTemplate, languages };
