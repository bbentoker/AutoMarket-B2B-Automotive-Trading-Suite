const carCard = require('../shared/carCard');
const deliveryStatusNotification = require('../shared/carStatusNotification');
const logoFooter = require('../shared/logoFooter');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Image URLs configuration
const IMAGES = {
  kmIcon:
    'https://cdn.automarket.example.com/mileage-icon.png',
  fuelIcon:
    'https://cdn.automarket.example.com/fuel-icon.png',
  transmissionIcon:
    'https://cdn.automarket.example.com/transmission-icon.png',
  greenTruckIcon:
    'https://assets.automarket.example.com/green-truck.png',
  upsLogo: 'https://assets.automarket.example.com/ups-logo.png',
  defaultCarImage:
    'https://assets.automarket.example.com/listings/259/e5cf3d38-5b83-4bdd-aec0-75694723f61c.jpg',
};

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

const documentsSentTemplate = (
  data,
  language = 'en',
  listing,
  dealerName,
  trackingNumber
) => {
  console.log('data in documentsSentTemplate', data);
  console.log('listing in documentsSentTemplate', listing?.dataValues);
  console.log('dealerName in documentsSentTemplate', dealerName);
  console.log('trackingNumber in documentsSentTemplate', trackingNumber);
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
    carData?.amount_sold_for || carData?.price || 0
  );

  const templates = {
    en: {
      subject: 'Confirmation: Documents Have Been Sent',
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
                      >Dear ${dealerName}</strong
                    >

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'documentsSent',
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
        hideYourOfferText: true,
      })}

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'ups',
        trackingNumber: listing?.dataValues?.tracking_code,
        language: language,
      })}


                     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                            <tr>
                              <td style="padding: 9px 32px;">
                                <!-- @TODO: Change the url later -->
                            
                                <a href="https://www.ups.com/track?loc=en_US&tracknum=${listing?.dataValues?.tracking_code || data?.trackingCode || data?.tracking_code || trackingNumber}" style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                              Track on UPS Express
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                    </table>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 20px;
                        color: #4F5A6899;
                      "
                    >
                      If you have any questions or need further assistance, please don't hesitate get in touch. We're here to help.
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
      subject: 'Bevestiging: Documenten zijn verzonden',
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
            <title>Documenten Verzonden</title>
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
                      >Beste ${dealerName}</strong
                    >

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'documentsSent',
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
        hideYourOfferText: true,
      })}

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'ups',
        trackingNumber: listing?.dataValues?.tracking_code,
        language: language,
      })}


                     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                            <tr>
                              <td style="padding: 9px 32px;">
                                <!-- @TODO: Change the url later -->
                            
                                <a href="https://www.ups.com/track?loc=en_US&tracknum=${listing?.dataValues?.tracking_code || data?.trackingCode || data?.tracking_code || trackingNumber}" style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                              Volgen via UPS Express
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                    </table>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 20px;
                        color: #4F5A6899;
                      "
                    >
                      Als u vragen heeft of hulp nodig heeft, aarzel dan niet om contact met ons op te nemen. Wij zijn er om u te helpen.
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
      subject: 'Confirmation : Documents envoyés',
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
            <title>Documents Envoyés</title>
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
                      >Cher ${dealerName}</strong
                    >

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'documentsSent',
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
        hideYourOfferText: true,
      })}

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'ups',
        trackingNumber: listing?.dataValues?.tracking_code,
        language: language,
      })}


                     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                            <tr>
                              <td style="padding: 9px 32px;">
                                <!-- @TODO: Change the url later -->
                            
                                <a href="https://www.ups.com/track?loc=en_US&tracknum=${listing?.dataValues?.tracking_code || data?.trackingCode || data?.tracking_code || trackingNumber}" style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                              Suivre via UPS Express
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                    </table>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 20px;
                        color: #4F5A6899;
                      "
                    >
                      Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.
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
      subject: 'Conferma: Documenti inviati',
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
            <title>Documenti Inviati</title>
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
                      >Gentile ${dealerName}</strong
                    >

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'documentsSent',
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
        hideYourOfferText: true,
      })}

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'ups',
        trackingNumber: listing?.dataValues?.tracking_code,
        language: language,
      })}


                     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                            <tr>
                              <td style="padding: 9px 32px;">
                                <!-- @TODO: Change the url later -->
                            
                                <a href="https://www.ups.com/track?loc=en_US&tracknum=${listing?.dataValues?.tracking_code || data?.trackingCode || data?.tracking_code || trackingNumber}" style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                              Traccia su UPS Express
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                    </table>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 20px;
                        color: #4F5A6899;
                      "
                    >
                      Se avete domande o necessitate di assistenza, non esitate a contattarci. Siamo qui per aiutarvi.
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
      subject: 'Bestätigung: Dokumente versendet',
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
            <title>Dokumente Versendet</title>
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
                      >Sehr geehrte/r ${dealerName}</strong
                    >

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'documentsSent',
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
        hideYourOfferText: true,
      })}

                    ${deliveryStatusNotification({
        carTitle,
        VIN,
        variation: 'ups',
        trackingNumber: listing?.dataValues?.tracking_code,
        language: language,
      })}


                     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 20px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                            <tr>
                              <td style="padding: 9px 32px;">
                                <!-- @TODO: Change the url later -->
                            
                                <a href="https://www.ups.com/track?loc=en_US&tracknum=${listing?.dataValues?.tracking_code || data?.trackingCode || data?.tracking_code || trackingNumber}" style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                              Verfolgen über UPS Express
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                    </table>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 20px;
                        color: #4F5A6899;
                      "
                    >
                      Falls Sie Fragen haben oder Unterstützung benötigen, zögern Sie bitte nicht, uns zu kontaktieren. Wir sind für Sie da.
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

module.exports = { documentsSentTemplate, languages };
