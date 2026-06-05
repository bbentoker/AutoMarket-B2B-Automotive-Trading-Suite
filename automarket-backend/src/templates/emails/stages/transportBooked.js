const { IMAGES } = require('../shared/constants');
const logoFooter = require('../shared/logoFooter');
const carStatusNotification = require('../shared/carStatusNotification');
const carCard = require('../shared/carCard');

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

const transportBookedTemplate = (
  data,
  language = 'en',
  listingDetails,
  dealerName
) => {
  // Use listing details if available, otherwise fall back to data
  const carData = listingDetails || data;

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
    formatPrice(carData?.amount_sold_for || carData?.price || 0),
  ];

  // Use actual data or provide reasonable defaults
  const estimatedDeliveryDate =
    carData?.expected_delivery_date || data?.expectedDeliveryDate || 'TBD';
  const estimatedPickUpDate =
    carData?.expected_pick_up_date || data?.expectedPickUpDate || 'TBD';
  const VIN = carData?.vin_number || carData?.vinNumber || 'VIN N/A';

  const templates = {
    en: {
      subject: 'Your Vehicle Transport Is Scheduled',
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
                We're pleased to inform you that the transport of your vehicle has been successfully scheduled.
              </p>

              ${carStatusNotification({
                carTitle,
                variation: 'transportBooked',
                VIN,
                language: language,
              })}

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice: price,
                hideYourOfferText: true,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 14px 24px;"
              >
                <tr>
                  <td>
                    <ul style="margin: 0; padding: 0; color: #050B20">
                      <li>Expected Pick Up Date: ${data?.expectedPickUpDate || data?.expected_pick_up_date || 'TBD'}</li>
                      <li>Expected Delivery Date: ${data?.expectedDeliveryDate || data?.expected_delivery_date || 'TBD'}</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                If you have any questions or need further assistance, please don't hesitate to contact us. We're here to help every step of the way.
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
      subject: 'Uw Voertuigtransport is Ingepland',
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
                Wij zijn verheugd u te kunnen mededelen dat het transport van uw voertuig succesvol is ingepland.
              </p>

              ${carStatusNotification({
                carTitle,
                variation: 'transportBooked',
                VIN,
                language: language,
              })}

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice: price,
                hideYourOfferText: true,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 14px 24px;"
              >
                <tr>
                  <td>
                    <ul style="margin: 0; padding: 0; color: #050B20">
                      <li>Verwachte Ophaaldatum: ${data?.expectedPickUpDate || data?.expected_pick_up_date || 'Nog niet bekend'}</li>
                      <li>Verwachte Leveringsdatum: ${data?.expectedDeliveryDate || data?.expected_delivery_date || 'Nog niet bekend'}</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Als u vragen heeft of hulp nodig heeft, aarzel dan niet om contact met ons op te nemen. Wij zijn er om u bij elke stap te helpen.
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
      subject: 'Le Transport de Votre Véhicule est Programmé',
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
                Nous sommes heureux de vous informer que le transport de votre véhicule a été programmé avec succès.
              </p>

              ${carStatusNotification({
                carTitle,
                variation: 'transportBooked',
                VIN,
                language: language,
              })}

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice: price,
                hideYourOfferText: true,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 14px 24px;"
              >
                <tr>
                  <td>
                    <ul style="margin: 0; padding: 0; color: #050B20">
                      <li>Date de Collecte Prévue : ${data?.expectedPickUpDate || data?.expected_pick_up_date || 'À déterminer'}</li>
                      <li>Date de Livraison Prévue : ${data?.expectedDeliveryDate || data?.expected_delivery_date || 'À déterminer'}</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous aider à chaque étape.
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
      subject: 'Il Trasporto del Vostro Veicolo è Programmato',
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
                Siamo lieti di informarvi che il trasporto del vostro veicolo è stato programmato con successo.
              </p>

              ${carStatusNotification({
                carTitle,
                variation: 'transportBooked',
                VIN,
                language: language,
              })}

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice: price,
                hideYourOfferText: true,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 14px 24px;"
              >
                <tr>
                  <td>
                    <ul style="margin: 0; padding: 0; color: #050B20">
                      <li>Data di Ritiro Prevista: ${data?.expectedPickUpDate || data?.expected_pick_up_date || 'Da definire'}</li>
                      <li>Data di Consegna Prevista: ${data?.expectedDeliveryDate || data?.expected_delivery_date || 'Da definire'}</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Se avete domande o necessitate di assistenza, non esitate a contattarci. Siamo qui per aiutarvi in ogni fase.
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
      subject: 'Der Transport Ihres Fahrzeugs ist Geplant',
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
                Wir freuen uns, Ihnen mitteilen zu können, dass der Transport Ihres Fahrzeugs erfolgreich geplant wurde.
              </p>

              ${carStatusNotification({
                carTitle,
                variation: 'transportBooked',
                VIN,
                language: language,
              })}

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                offerPrice: price,
                hideYourOfferText: true,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 14px 24px;"
              >
                <tr>
                  <td>
                    <ul style="margin: 0; padding: 0; color: #050B20">
                      <li>Voraussichtliches Abholdatum: ${data?.expectedPickUpDate || data?.expected_pick_up_date || 'Noch nicht festgelegt'}</li>
                      <li>Voraussichtliches Lieferdatum: ${data?.expectedDeliveryDate || data?.expected_delivery_date || 'Noch nicht festgelegt'}</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Falls Sie Fragen haben oder Unterstützung benötigen, zögern Sie bitte nicht, uns zu kontaktieren. Wir sind für Sie da und helfen Ihnen bei jedem Schritt.
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

module.exports = { transportBookedTemplate, languages };
