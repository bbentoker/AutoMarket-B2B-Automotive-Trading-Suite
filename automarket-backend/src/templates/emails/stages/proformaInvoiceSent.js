const carCard = require('../shared/carCard');
const logoFooter = require('../shared/logoFooter');
const { IMAGES } = require('../shared/constants');
const notification = require('../shared/notification');

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

const proformaInvoiceSentTemplate = (
  data,
  language = 'en',
  listing,
  dealerName,
  invoiceUrl = null
) => {
  // Use listing details if available, otherwise fall back to data
  const carData = listing || data;

  // Determine the invoice URL - use provided URL or fallback
  const finalInvoiceUrl = invoiceUrl || '#';
  const downloadAttributes = invoiceUrl ? 'download' : '';

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

  // Use actual VIN from data, fallback to placeholder
  const VIN = carData?.vin_number || carData?.vinNumber || 'VIN N/A';
  const firstName =
    dealerName?.split(' ')[0] || data?.dealerName?.split(' ')[0] || 'Dealer';

  const templates = {
    en: {
      subject: `${firstName}, Your Invoice Is Ready`,
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
                Please find the proforma invoice for the <span style="font-weight: 600">${carTitle}</span> <span style="font-weight: 600">(VIN: ${VIN})</span> attached to this email.
              </p>

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
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 1.5rem"
              >
                <tr>
                  <td align="center" style="; height: 1.25rem; letters-spacing: 0%; border-bottom: 1px solid #90A3BF32">
                    <p style="font-size: 1rem; line-height: 1rem; font-weight: 500; color: #050B20; margin-top: 0">
                      Dashboard Access
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align='center'>
                    <p style="font-size: 0.75rem; line-height: 1.5rem; color: #050B20;">
                      To view your invoice, please click the button below and log in to your account.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 20px;">
                            <tr>
                              <td style="padding: 8px 16px;">
                                <!-- Direct download link for invoice -->
                                <a href="${finalInvoiceUrl}" ${downloadAttributes} style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                                  View Invoice
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${notification({
        variation: 'invoiceSent',
        language: language,
      })}

              <p
              style="
              font-size: 16px;
              line-height: 24px;
              margin-top: 20px;
              color: #4F5A6899;
              "
              >
                If you have any questions or need assistance, don't hesitate to contact us.
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
      subject: `${firstName}, Uw Factuur is Gereed`,
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
                De proforma factuur voor de <span style="font-weight: 600">${carTitle}</span> <span style="font-weight: 600">(VIN: ${VIN})</span> is als bijlage bij deze e-mail gevoegd.
              </p>

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
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 1.5rem"
              >
                <tr>
                  <td align="center" style="; height: 1.25rem; letters-spacing: 0%; border-bottom: 1px solid #90A3BF32">
                    <p style="font-size: 1rem; line-height: 1rem; font-weight: 500; color: #050B20; margin-top: 0">
                      Dashboard Toegang
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align='center'>
                    <p style="font-size: 0.75rem; line-height: 1.5rem; color: #050B20;">
                      Om uw factuur te bekijken, klik op onderstaande knop en log in op uw account.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 20px;">
                            <tr>
                              <td style="padding: 8px 16px;">
                                <!-- Direct download link for invoice -->
                                <a href="${finalInvoiceUrl}" ${downloadAttributes} style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                                  Bekijk Factuur
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${notification({
        variation: 'invoiceSent',
        language: language,
      })}

              <p
              style="
              font-size: 16px;
              line-height: 24px;
              margin-top: 20px;
              color: #4F5A6899;
              "
              >
                Als u vragen heeft of hulp nodig heeft, aarzel dan niet om contact met ons op te nemen.
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
      subject: `${firstName}, Votre Facture est Prête`,
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
                Veuillez trouver ci-joint la facture proforma pour la <span style="font-weight: 600">${carTitle}</span> <span style="font-weight: 600">(VIN: ${VIN})</span>.
              </p>

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
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 1.5rem"
              >
                <tr>
                  <td align="center" style="; height: 1.25rem; letters-spacing: 0%; border-bottom: 1px solid #90A3BF32">
                    <p style="font-size: 1rem; line-height: 1rem; font-weight: 500; color: #050B20; margin-top: 0">
                      Accès au Tableau de Bord
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align='center'>
                    <p style="font-size: 0.75rem; line-height: 1.5rem; color: #050B20;">
                      Pour voir votre facture, veuillez cliquer sur le bouton ci-dessous et vous connecter à votre compte.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 20px;">
                            <tr>
                              <td style="padding: 8px 16px;">
                                <!-- Direct download link for invoice -->
                                <a href="${finalInvoiceUrl}" ${downloadAttributes} style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                                  Voir la Facture
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${notification({
        variation: 'invoiceSent',
        language: language,
      })}

              <p
              style="
              font-size: 16px;
              line-height: 24px;
              margin-top: 20px;
              color: #4F5A6899;
              "
              >
              Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.
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
      subject: `${firstName}, La Tua Fattura è Pronta`,
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
                In allegato troverete la fattura proforma per la <span style="font-weight: 600">${carTitle}</span> <span style="font-weight: 600">(VIN: ${VIN})</span>.
              </p>

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
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 1.5rem"
              >
                <tr>
                  <td align="center" style="; height: 1.25rem; letters-spacing: 0%; border-bottom: 1px solid #90A3BF32">
                    <p style="font-size: 1rem; line-height: 1rem; font-weight: 500; color: #050B20; margin-top: 0">
                      Accesso Dashboard
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align='center'>
                    <p style="font-size: 0.75rem; line-height: 1.5rem; color: #050B20;">
                      Per visualizzare la fattura, cliccare sul pulsante qui sotto e accedere al proprio account.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 20px;">
                            <tr>
                              <td style="padding: 8px 16px;">
                                <!-- Direct download link for invoice -->
                                <a href="${finalInvoiceUrl}" ${downloadAttributes} style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                                  Visualizza Fattura
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${notification({
        variation: 'invoiceSent',
        language: language,
      })}

              <p
              style="
              font-size: 16px;
              line-height: 24px;
              margin-top: 20px;
              color: #4F5A6899;
              "
              >
                Se avete domande o necessitate di assistenza, non esitate a contattarci.
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
      subject: `${firstName}, Ihre Rechnung ist Fertig`,
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
                Anbei finden Sie die Proforma-Rechnung für den <span style="font-weight: 600">${carTitle}</span> <span style="font-weight: 600">(VIN: ${VIN})</span>.
              </p>

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
                style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px; padding: 1.5rem"
              >
                <tr>
                  <td align="center" style="; height: 1.25rem; letters-spacing: 0%; border-bottom: 1px solid #90A3BF32">
                    <p style="font-size: 1rem; line-height: 1rem; font-weight: 500; color: #050B20; margin-top: 0">
                      Dashboard-Zugang
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align='center'>
                    <p style="font-size: 0.75rem; line-height: 1.5rem; color: #050B20;">
                      Um Ihre Rechnung einzusehen, klicken Sie bitte auf den Button unten und melden Sie sich in Ihrem Konto an.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 20px;">
                            <tr>
                              <td style="padding: 8px 16px;">
                                <!-- Direct download link for invoice -->
                                <a href="${finalInvoiceUrl}" ${downloadAttributes} style="color: white; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 24px; display: block;">
                                  Rechnung Ansehen
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${notification({
        variation: 'invoiceSent',
        language: language,
      })}

              <p
              style="
              font-size: 16px;
              line-height: 24px;
              margin-top: 20px;
              color: #4F5A6899;
              "
              >
              Falls Sie Fragen haben oder Unterstützung benötigen, zögern Sie nicht, uns zu kontaktieren.
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

module.exports = { proformaInvoiceSentTemplate, languages };
