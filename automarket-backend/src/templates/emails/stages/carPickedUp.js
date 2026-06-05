const carCard = require('../shared/carCard');
const deliveryStatusNotification = require('../shared/carStatusNotification');
const logoFooter = require('../shared/logoFooter');
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

const carPickedUpTemplate = (data, language = 'en', listing, dealerName) => {
  // Use listing details if available, otherwise fall back to data
  const carData = listing || data;

  const [carTitle, carSubtitle, carImage, fuelType, transmission, mileage] = [
    getCarTitle(carData),
    getCarSubtitle(carData),
    getCarImage(carData),
    getFuelType(carData),
    getTransmission(carData),
    getMileage(carData),
  ];

  // Use actual VIN from data, fallback to placeholder
  const VIN = carData?.vin_number || carData?.vinNumber || 'VIN N/A';
  const offerPrice = formatPrice(
    carData?.amount_sold_for || carData?.price || 0,
    '€'
  );

  const templates = {
    en: {
      subject: 'Pickup Successful – Your car Is on the Way',
      body: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "[http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd](http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd)">
          <html xmlns="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">
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
                        >Dear ${dealerName}</strong
                      >

                      ${deliveryStatusNotification({
                        carTitle,
                        VIN,
                        variation: 'Car Picked Up',
                        language: language,
                      })}

                      ${carCard({
                        title: carTitle,
                        subTitle: carSubtitle,
                        imageUrl: carImage,
                        mileage,
                        fuelType,
                        transmission,
                        offerPrice,
                        hasNotification: true,
                        variation: 'Car Picked Up',
                        hideYourOfferText: true,
                      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 24px;
                          color: #4F5A6899;
                        "
                      >
                        If you have any questions, feel free to reach out &mdash; we're happy to assist.
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
          </body>
        </html>
`,
    },
    nl: {
      subject: 'Ophaling Succesvol – Uw Auto Is Onderweg',
      body: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "[http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd](http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd)">
          <html xmlns="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">
            <head>
              <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Auto Opgehaald</title>
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
                        >Beste ${dealerName}</strong
                      >

                      ${deliveryStatusNotification({
                        carTitle,
                        VIN,
                        variation: 'Car Picked Up',
                        language: language,
                      })}

                      ${carCard({
                        title: carTitle,
                        subTitle: carSubtitle,
                        imageUrl: carImage,
                        mileage,
                        fuelType,
                        transmission,
                        offerPrice,
                        hasNotification: true,
                        variation: 'Car Picked Up',
                        hideYourOfferText: true,
                      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 24px;
                          color: #4F5A6899;
                        "
                      >
                        Als u vragen heeft, neem dan gerust contact op &mdash; wij helpen u graag.
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
          </body>
        </html>
      `,
    },
    fr: {
      subject: 'Enlèvement Réussi – Votre Voiture Est En Route',
      body: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "[http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd](http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd)">
          <html xmlns="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">
            <head>
              <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Voiture Collectée</title>
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
                        >Cher ${dealerName}</strong
                      >

                      ${deliveryStatusNotification({
                        carTitle,
                        VIN,
                        variation: 'Car Picked Up',
                        language: language,
                      })}

                      ${carCard({
                        title: carTitle,
                        subTitle: carSubtitle,
                        imageUrl: carImage,
                        mileage,
                        fuelType,
                        transmission,
                        offerPrice,
                        hasNotification: true,
                        variation: 'Car Picked Up',
                        hideYourOfferText: true,
                      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 24px;
                          color: #4F5A6899;
                        "
                      >
                        Si vous avez des questions, n'hésitez pas à nous contacter &mdash; nous sommes là pour vous aider.
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
          </body>
        </html>
      `,
    },
    it: {
      subject: 'Ritiro Riuscito – La Sua Auto è in Viaggio',
      body: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "[http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd](http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd)">
          <html xmlns="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">
            <head>
              <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Auto Ritirata</title>
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
                        >Gentile ${dealerName}</strong
                      >

                      ${deliveryStatusNotification({
                        carTitle,
                        VIN,
                        variation: 'Car Picked Up',
                        language: language,
                      })}

                      ${carCard({
                        title: carTitle,
                        subTitle: carSubtitle,
                        imageUrl: carImage,
                        mileage,
                        fuelType,
                        transmission,
                        offerPrice,
                        hasNotification: true,
                        variation: 'Car Picked Up',
                        hideYourOfferText: true,
                      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 24px;
                          color: #4F5A6899;
                        "
                      >
                        Se ha delle domande, non esiti a contattarci &mdash; siamo qui per aiutarla.
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
          </body>
        </html>
      `,
    },
    de: {
      subject: 'Abholung Erfolgreich – Ihr Auto ist Unterwegs',
      body: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "[http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd](http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd)">
          <html xmlns="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">
            <head>
              <meta
                http-equiv="Content-Type"
                content="text/html; charset=UTF-8"
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Auto Abgeholt</title>
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
                        >Sehr geehrte/r ${dealerName}</strong
                      >

                      ${deliveryStatusNotification({
                        carTitle,
                        VIN,
                        variation: 'Car Picked Up',
                        language: language,
                      })}

                      ${carCard({
                        title: carTitle,
                        subTitle: carSubtitle,
                        imageUrl: carImage,
                        mileage,
                        fuelType,
                        transmission,
                        offerPrice,
                        hasNotification: true,
                        variation: 'Car Picked Up',
                        hideYourOfferText: true,
                      })}

                      <p
                        style="
                          font-size: 16px;
                          line-height: 24px;
                          margin-top: 24px;
                          color: #4F5A6899;
                        "
                      >
                        Wenn Sie Fragen haben, zögern Sie nicht, uns zu kontaktieren &mdash; wir helfen Ihnen gerne weiter.
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
          </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { carPickedUpTemplate, languages };
