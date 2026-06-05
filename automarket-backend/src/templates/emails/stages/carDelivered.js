const carCard = require('../shared/carCard');
const logoFooter = require('../shared/logoFooter');

// Image URLs configuration
const IMAGES = {
  kmIcon:
    'https://cdn.automarket.example.com/mileage-icon.png',
  fuelIcon:
    'https://cdn.automarket.example.com/fuel-icon.png',
  transmissionIcon:
    'https://cdn.automarket.example.com/transmission-icon.png',
  defaultCarImage:
    'https://assets.automarket.example.com/listings/259/e5cf3d38-5b83-4bdd-aec0-75694723f61c.jpg',
};

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
  const km_stand = data?.km_stand;
  if (km_stand && typeof km_stand === 'number') {
    return `${km_stand.toLocaleString()} km`;
  }
  if (km_stand && typeof km_stand === 'string') {
    const numericValue = parseFloat(km_stand);
    if (!isNaN(numericValue)) {
      return `${numericValue.toLocaleString()} km`;
    }
    return `${km_stand} km`;
  }
  return 'km N/A';
};

const getFuelType = (data) => {
  const fuel = data?.fuel_type;
  if (fuel) {
    return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
  }
  return 'Fuel N/A';
};

const getTransmission = (data) => {
  const transmission_type = data?.transmission_type;
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

const carDeliveredTemplate = (data, language = 'en', listing, dealerName) => {
  // Use listing details if available, otherwise fall back to data
  console.log('data in carDeliveredTemplate', data);
  console.log('listing in carDeliveredTemplate', listing?.dataValues);
  console.log('dealerName in carDeliveredTemplate', dealerName);
  const carData = listing?.dataValues || data;
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

  const templates = {
    en: {
      subject: `${dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer'}, Your Car Has Been Delivered`,
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
                      >Car delivered</strong
                    >
                    <p
                      style="
                        margin: 30px 0 0 0;
                        font-size: 16px;
                        line-height: 24px;
                        font-weight: 700;
                        color: #050B2099;
                      "
                    >
                      Delivery Completed:
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #050B2099;
                      "
                    >
                      We are pleased to inform you that your <span style="font-weight: 600">${carTitle}</span> with the following VIN: <span style="font-weight: 600">${carData?.vin_number || carData?.vinNumber || 'VIN N/A'}</span> has been successfully delivered.
                    </p>

                    ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        offerPrice: price,
        hasNotification: true,
        variation: 'delivered',
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
                      Thank you for your trust in Car Click. We're proud to support your dealership and look forward to continuing to provide you with the right cars for your business.
                    </p>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 24px;
                        color: #4F5A6899;
                      "
                    >
                      Should you need anything further, we're just a message away.
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
      subject: `${dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer'}, Uw Auto Is Geleverd`,
      body: `
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
          <title>Auto Geleverd</title>
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
                      >Auto geleverd</strong
                    >
                    <p
                      style="
                        margin: 30px 0 0 0;
                        font-size: 16px;
                        line-height: 24px;
                        font-weight: 700;
                        color: #050B2099;
                      "
                    >
                      Levering Voltooid:
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #050B2099;
                      "
                    >
                      Wij zijn verheugd u te informeren dat uw <span style="font-weight: 600">${carTitle}</span> met het volgende VIN: <span style="font-weight: 600">${carData?.vin_number || carData?.vinNumber || 'VIN N/A'}</span> succesvol is geleverd.
                    </p>

                    ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        offerPrice: price,
        hasNotification: true,
        variation: 'delivered',
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
                      Dank u voor uw vertrouwen in Car Click. Wij zijn er trots op uw dealership te ondersteunen en kijken ernaar uit om u te blijven voorzien van de juiste voertuigen voor uw bedrijf.
                    </p>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 24px;
                        color: #4F5A6899;
                      "
                    >
                      Mocht u nog iets nodig hebben, dan zijn wij slechts een bericht van u verwijderd.
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
      subject: `${dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer'}, Votre Voiture a été Livrée`,
      body: `
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
          <title>Voiture Livrée</title>
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
                      >Voiture livrée</strong
                    >
                    <p
                      style="
                        margin: 30px 0 0 0;
                        font-size: 16px;
                        line-height: 24px;
                        font-weight: 700;
                        color: #050B2099;
                      "
                    >
                      Livraison Terminée:
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #050B2099;
                      "
                    >
                      Nous sommes heureux de vous informer que votre <span style="font-weight: 600">${carTitle}</span> avec le VIN suivant: <span style="font-weight: 600">${carData?.vin_number || carData?.vinNumber || 'VIN N/A'}</span> a été livrée avec succès.
                    </p>

                    ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        offerPrice: price,
        hasNotification: true,
        variation: 'delivered',
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
                      Merci de votre confiance en Car Click. Nous sommes fiers de soutenir votre concession et nous réjouissons de continuer à vous fournir les bons véhicules pour votre entreprise.
                    </p>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 24px;
                        color: #4F5A6899;
                      "
                    >
                      Si vous avez besoin de quoi que ce soit d'autre, nous ne sommes qu'à un message de vous.
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
      subject: `${dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer'}, La Tua Auto è Stata Consegnata`,
      body: `
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
          <title>Auto Consegnata</title>
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
                      >Auto consegnata</strong
                    >
                    <p
                      style="
                        margin: 30px 0 0 0;
                        font-size: 16px;
                        line-height: 24px;
                        font-weight: 700;
                        color: #050B2099;
                      "
                    >
                      Consegna Completata:
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #050B2099;
                      "
                    >
                      Siamo lieti di informarvi che la vostra <span style="font-weight: 600">${carTitle}</span> con il seguente VIN: <span style="font-weight: 600">${carData?.vin_number || carData?.vinNumber || 'VIN N/A'}</span> è stata consegnata con successo.
                    </p>

                    ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        offerPrice: price,
        hasNotification: true,
        variation: 'delivered',
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
                      Grazie per la vostra fiducia in Car Click. Siamo orgogliosi di supportare la vostra concessionaria e non vediamo l'ora di continuare a fornirvi i veicoli giusti per la vostra attività.
                    </p>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 24px;
                        color: #4F5A6899;
                      "
                    >
                      Se doveste aver bisogno di qualcos'altro, siamo a un messaggio di distanza.
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
      subject: `${dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer'}, Ihr Auto Wurde Geliefert`,
      body: `
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
          <title>Auto Geliefert</title>
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
                      >Auto geliefert</strong
                    >
                    <p
                      style="
                        margin: 30px 0 0 0;
                        font-size: 16px;
                        line-height: 24px;
                        font-weight: 700;
                        color: #050B2099;
                      "
                    >
                      Lieferung Abgeschlossen:
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #050B2099;
                      "
                    >
                      Wir freuen uns, Ihnen mitteilen zu können, dass Ihr <span style="font-weight: 600">${carTitle}</span> mit der folgenden VIN: <span style="font-weight: 600">${carData?.vin_number || carData?.vinNumber || 'VIN N/A'}</span> erfolgreich geliefert wurde.
                    </p>

                    ${carCard({
        title: carTitle,
        subTitle: carSubtitle,
        imageUrl: carImage,
        mileage,
        fuelType,
        transmission,
        offerPrice: price,
        hasNotification: true,
        variation: 'delivered',
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
                      Vielen Dank für Ihr Vertrauen in Car Click. Wir sind stolz darauf, Ihr Autohaus zu unterstützen und freuen uns darauf, Ihnen weiterhin die richtigen Fahrzeuge für Ihr Unternehmen zu liefern.
                    </p>

                    <p
                      style="
                        font-size: 16px;
                        line-height: 24px;
                        margin-top: 24px;
                        color: #4F5A6899;
                      "
                    >
                      Sollten Sie noch etwas benötigen, sind wir nur eine Nachricht entfernt.
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
        </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { carDeliveredTemplate, languages };
