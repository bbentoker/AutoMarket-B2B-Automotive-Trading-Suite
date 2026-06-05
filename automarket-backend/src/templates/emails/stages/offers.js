const carCard = require('../shared/carCard');
const logoFooter = require('../shared/logoFooter');
const { IMAGES } = require('../shared/constants');
const deliveryStatusNotification = require('../shared/carStatusNotification');

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

const offersTemplate = (data, language = 'en', listing) => {
  console.log('data', data);
  console.log('listing', listing);

  // Get dealer name from data
  const dealerName = data?.vendorAccountName || data?.dealerName || 'Dealer';

  // Use listing data for car details if available, otherwise fall back to data
  const carData = listing || data;
  const [carTitle, carSubtitle, carImage, fuelType, transmission, mileage] = [
    getCarTitle(carData),
    getCarSubtitle(carData),
    getCarImage(carData),
    getFuelType(carData),
    getTransmission(carData),
    getMileage(carData),
  ];

  // Use the actual offer amount from data, or fall back to a default
  const offerPrice = formatPrice(
    data?.offerAmount || data?.offer_amount || 0,
    '€'
  );

  const templates = {
    en: {
      subject: 'Your Offer Has Been Confirmed',
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

                        color: #333333;
                        background-color: #f2f2f7;
                        margin-top: 70px;
                      "
                    >
                      <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                        >Dear ${dealerName}!</strong
                      >

                      ${deliveryStatusNotification({
        carTitle,
        variation: 'offerConfirmation',
        language,
      })}


                      ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        offerPrice,
        fuelType,
        transmission,
      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        We've shared your proposal with the seller and are now awaiting their response. As soon as we receive an update, we'll notify you by email and within your dashboard.
                      </p>

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        We appreciate your continued trust in Car Click.
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
      subject: 'Uw Bod is Bevestigd',
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

                        color: #333333;
                        background-color: #f2f2f7;
                        margin-top: 70px;
                      "
                    >
                      <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                        >Beste ${dealerName}!</strong
                      >

                      ${deliveryStatusNotification({
        carTitle,
        variation: 'offerConfirmation',
        language,
      })}


                      ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        offerPrice,
        fuelType,
        transmission,
      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Wij hebben uw voorstel gedeeld met de verkoper en wachten nu op hun reactie. Zodra wij een update ontvangen, zullen wij u per e-mail en via uw dashboard op de hoogte stellen.
                      </p>

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Wij waarderen uw vertrouwen in Car Click.
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
      subject: 'Votre Offre a été Confirmée',
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

                        color: #333333;
                        background-color: #f2f2f7;
                        margin-top: 70px;
                      "
                    >
                      <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                        >Cher ${dealerName}!</strong
                      >

                      ${deliveryStatusNotification({
        carTitle,
        variation: 'offerConfirmation',
        language,
      })}


                      ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        offerPrice,
        fuelType,
        transmission,
      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Nous avons partagé votre proposition avec le vendeur et attendons maintenant sa réponse. Dès que nous recevrons une mise à jour, nous vous en informerons par e-mail et via votre tableau de bord.
                      </p>

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Nous apprécions votre confiance en Car Click.
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
      subject: 'La Tua Offerta è Stata Confermata',
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

                        color: #333333;
                        background-color: #f2f2f7;
                        margin-top: 70px;
                      "
                    >
                      <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                        >Gentile ${dealerName}!</strong
                      >

                      ${deliveryStatusNotification({
        carTitle,
        variation: 'offerConfirmation',
        language,
      })}


                      ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        offerPrice,
        fuelType,
        transmission,
      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Abbiamo condiviso la vostra proposta con il venditore e stiamo ora aspettando la loro risposta. Non appena riceveremo un aggiornamento, vi informeremo tramite e-mail e attraverso la vostra dashboard.
                      </p>

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Apprezziamo la vostra fiducia in Car Click.
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
      subject: 'Ihr Angebot wurde Bestätigt',
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

                        color: #333333;
                        background-color: #f2f2f7;
                        margin-top: 70px;
                      "
                    >
                      <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
                        >Sehr geehrte/r ${dealerName}!</strong
                      >

                      ${deliveryStatusNotification({
        carTitle,
        variation: 'offerConfirmation',
        language,
      })}


                      ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        offerPrice,
        fuelType,
        transmission,
      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Wir haben Ihren Vorschlag mit dem Verkäufer geteilt und warten nun auf dessen Antwort. Sobald wir ein Update erhalten, werden wir Sie per E-Mail und über Ihr Dashboard informieren.
                      </p>

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 20px;
                          color: #4F5A6899;
                        "
                      >
                        Wir schätzen Ihr Vertrauen in Car Click.
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

module.exports = { offersTemplate, languages };
