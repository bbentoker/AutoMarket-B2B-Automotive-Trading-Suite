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
  console.log('data in getCarTitle', data);
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

const paymentReceivedTemplate = (
  data,
  language = 'en',
  listing,
  dealerName
) => {
  console.log('data', data);
  // Use listing details if available, otherwise fall back to data
  const carData = data || listing;

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
  console.log('carTitle', carTitle);
  console.log('carSubtitle', carSubtitle);
  console.log('carImage', carImage);
  console.log('fuelType', fuelType);
  console.log('transmission', transmission);
  console.log('mileage', mileage);
  console.log('price', price);
  // Use actual VIN from data, fallback to placeholder
  const VIN = carData?.vin_number || carData?.vinNumber || 'VIN N/A';

  const templates = {
    en: {
      subject: 'Payment Received - Next Steps',
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
                >Dear ${dealerName || data?.vendorAccountName || 'Dealer'},</strong
              >

              <p
                style="
                  margin: 0;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                We're pleased to confirm that your payment for the <strong>${data.brand || carData.brand_name || 'Vehicle'} ${data.model || carData.model || ''}</strong> (VIN: <strong>${VIN}</strong>) has been successfully received. Thank you!
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                fuelType: fuelType,
                transmission: transmission,
                mileage: mileage,
                offerPrice: price,
              })}

              <!-- Transport Information -->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse; margin-top: 30px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #E3F2FD;
                      padding: 20px;
                      border-radius: 8px;
                      border-left: 4px solid #2196F3;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #1565C0;
                        font-weight: 500;
                      "
                    >
                      <strong>Next Steps:</strong><br>
                      We are now proceeding with transport arrangements for your vehicle and will update you shortly with the estimated pickup date.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Should you have any questions in the meantime, feel free to reach out to our team.
              </p>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Kind regards,<br>
                <strong>Team Car Click</strong>
              </p>
            </td>
          </tr>
          ${logoFooter(language)}
        </table>
      </center>
    </body>`,
    },
    nl: {
      subject: 'Betaling Ontvangen - Volgende Stappen',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
                >Beste ${dealerName || data?.vendorAccountName || 'Dealer'},</strong
              >

              <p
                style="
                  margin: 0;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                We zijn verheugd te bevestigen dat uw betaling voor de <strong>${data.brand || carData.brand_name || 'Voertuig'} ${data.model || carData.model || ''}</strong> (VIN: <strong>${VIN}</strong>) succesvol is ontvangen. Dank u wel!
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                fuelType: fuelType,
                transmission: transmission,
                mileage: mileage,
                offerPrice: price,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse; margin-top: 30px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #E8F5E8;
                      padding: 20px;
                      border-radius: 8px;
                      border-left: 4px solid #4CAF50;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #2E7D32;
                        font-weight: 500;
                      "
                    >
                      <strong>Volgende Stappen:</strong><br>
                      We gaan nu verder met de transportregelingen voor uw voertuig en zullen u binnenkort bijwerken met de geschatte ophaaldatum.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Mocht u in de tussentijd vragen hebben, aarzel dan niet om contact op te nemen met ons team.
              </p>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Met vriendelijke groet,<br>
                <strong>Team Car Click</strong>
              </p>
            </td>
          </tr>
          ${logoFooter(language)}
        </table>
      </center>
    </body>`,
    },
    fr: {
      subject: 'Paiement Reçu - Prochaines Étapes',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
                >Cher/Chère ${dealerName || data?.vendorAccountName || 'Client'},</strong
              >

              <p
                style="
                  margin: 0;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Nous sommes heureux de confirmer que votre paiement pour la <strong>${data.brand || carData.brand_name || 'Véhicule'} ${data.model || carData.model || ''}</strong> (VIN: <strong>${VIN}</strong>) a été reçu avec succès. Merci !
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                fuelType: fuelType,
                transmission: transmission,
                mileage: mileage,
                offerPrice: price,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse; margin-top: 30px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #E8F5E8;
                      padding: 20px;
                      border-radius: 8px;
                      border-left: 4px solid #4CAF50;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #2E7D32;
                        font-weight: 500;
                      "
                    >
                      <strong>Prochaines Étapes :</strong><br>
                      Nous procédons maintenant aux arrangements de transport pour votre véhicule et vous tiendrons informé(e) sous peu de la date de collecte estimée.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Si vous avez des questions entre-temps, n'hésitez pas à nous contacter.
              </p>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Cordialement,<br>
                <strong>Équipe Car Click</strong>
              </p>
            </td>
          </tr>
          ${logoFooter(language)}
        </table>
      </center>
    </body>`,
    },
    it: {
      subject: 'Pagamento Ricevuto - Prossimi Passi',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
                >Gentile ${dealerName || data?.vendorAccountName || 'Cliente'},</strong
              >

              <p
                style="
                  margin: 0;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Siamo lieti di confermare che il vostro pagamento per la <strong>${data.brand || carData.brand_name || 'Veicolo'} ${data.model || carData.model || ''}</strong> (VIN: <strong>${VIN}</strong>) è stato ricevuto con successo. Grazie!
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                fuelType: fuelType,
                transmission: transmission,
                mileage: mileage,
                offerPrice: price,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse; margin-top: 30px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #E8F5E8;
                      padding: 20px;
                      border-radius: 8px;
                      border-left: 4px solid #4CAF50;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #2E7D32;
                        font-weight: 500;
                      "
                    >
                      <strong>Prossimi Passi:</strong><br>
                      Stiamo ora procedendo con gli accordi di trasporto per il vostro veicolo e vi aggiorneremo a breve con la data stimata di ritiro.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Se avete domande nel frattempo, non esitate a contattare il nostro team.
              </p>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Cordiali saluti,<br>
                <strong>Team Car Click</strong>
              </p>
            </td>
          </tr>
          ${logoFooter(language)}
        </table>
      </center>
    </body>`,
    },
    de: {
      subject: 'Zahlung Erhalten - Nächste Schritte',
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
                >Liebe/r ${dealerName || data?.vendorAccountName || 'Kunde'},</strong
              >

              <p
                style="
                  margin: 0;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Wir freuen uns, bestätigen zu können, dass Ihre Zahlung für den <strong>${data.brand || carData.brand_name || 'Fahrzeug'} ${data.model || carData.model || ''}</strong> (VIN: <strong>${VIN}</strong>) erfolgreich eingegangen ist. Vielen Dank!
              </p>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                fuelType: fuelType,
                transmission: transmission,
                mileage: mileage,
                offerPrice: price,
              })}

              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse; margin-top: 30px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #E8F5E8;
                      padding: 20px;
                      border-radius: 8px;
                      border-left: 4px solid #4CAF50;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 24px;
                        color: #2E7D32;
                        font-weight: 500;
                      "
                    >
                      <strong>Nächste Schritte:</strong><br>
                      Wir kümmern uns nun um die Transportvereinbarungen für Ihr Fahrzeug und werden Sie in Kürze über das geschätzte Abholdatum informieren.
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Sollten Sie in der Zwischenzeit Fragen haben, zögern Sie nicht, unser Team zu kontaktieren.
              </p>

              <p
                style="
                  margin: 30px 0 0 0;
                  font-size: 16px;
                  line-height: 24px;
                  color: #1A202C;
                "
              >
                Freundliche Grüße,<br>
                <strong>Team Car Click</strong>
              </p>
            </td>
          </tr>
          ${logoFooter(language)}
        </table>
      </center>
    </body>`,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { paymentReceivedTemplate, languages };
