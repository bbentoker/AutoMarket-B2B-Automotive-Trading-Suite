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

const reservedTemplate = (
  data,
  language = 'en',
  listingDetails,
  dealerName
) => {
  console.log('listingDetails', listingDetails);

  // Use listingDetails if available, otherwise fall back to data
  const carData = listingDetails || data;

  const [
    carTitle,
    carSubtitle,
    carImage,
    fuelType,
    transmission,
    mileage,
    offerPrice,
  ] = [
    getCarTitle(carData),
    getCarSubtitle(carData),
    getCarImage(carData),
    getFuelType(carData),
    getTransmission(carData),
    getMileage(carData),
    formatPrice(carData?.listing_price || carData?.price || 0), // Use actual listing price
  ];

  // @TODO: Replace with actual dealer name when available
  const VIN = '1G6P44S90H1234567';

  const templates = {
    en: {
      subject: 'Your Reservation Has Been Confirmed',
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
                >Dear ${dealerName || data?.vendorAccountName || data?.dealerName || 'Dealer'},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Our team is currently working to finalize the next steps and will update you shortly via email and through your dashboard.
              </p>

               <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 10px; margin-top: 20px; padding: 24px;"
              >
                <tr>
                   <td align="center">
                    <img
                        src=${IMAGES.calenderIcon}
                        alt="Arrow Icon"
                        width="32"
                        height="32"
                        style="display: block; border: 0"
                      />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 16px; font-weight: 500; line-height: 16px; margin: 12px 0;">Reservation Confirmed</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 12px; margin: 0; line-height: 16px;">
                      We're pleased to confirm that the vehicle you selected has been successfully reserved. This guarantees it will not be made available to other buyers on our platform while we engage with the seller to move your purchase forward.
                    </p>
                  </td>
                </tr>
              </table>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                hasNotification: true,
                variation: 'confirmed',
                offerPrice,
                hideYourOfferText: true,
              })}


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
      subject: 'Uw Reservering is Bevestigd',
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
                >Beste ${dealerName || data?.vendorAccountName || data?.dealerName || 'Dealer'},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Ons team werkt momenteel aan de volgende stappen en zal u binnenkort via e-mail en via uw dashboard op de hoogte brengen.
              </p>

               <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 10px; margin-top: 20px; padding: 24px;"
              >
                <tr>
                   <td align="center">
                    <img
                        src=${IMAGES.calenderIcon}
                        alt="Arrow Icon"
                        width="32"
                        height="32"
                        style="display: block; border: 0"
                      />
                                            </td>
                                          </tr>
                                          <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 16px; font-weight: 500; line-height: 16px; margin: 12px 0;">Reservering Bevestigd</p>
                                            </td>
                                          </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 12px; margin: 0; line-height: 16px;">
                      Wij bevestigen dat het door u geselecteerde voertuig succesvol is gereserveerd. Dit garandeert dat het niet beschikbaar wordt gesteld aan andere kopers op ons platform terwijl wij met de verkoper in gesprek gaan om uw aankoop verder af te handelen.
                    </p>
                                            </td>
                                          </tr>
                                        </table>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                hasNotification: true,
                variation: 'confirmed',
                offerPrice,
                hideYourOfferText: true,
              })}


              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
              >
                Bedankt voor uw vertrouwen in Car Click.
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
      subject: 'Votre Réservation a été Confirmée',
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
                >Cher ${dealerName || data?.vendorAccountName || data?.dealerName || 'Dealer'},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Notre équipe travaille actuellement sur les prochaines étapes et vous tiendra informé prochainement par email et via votre tableau de bord.
              </p>

               <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 10px; margin-top: 20px; padding: 24px;"
              >
                <tr>
                   <td align="center">
                    <img
                        src=${IMAGES.calenderIcon}
                        alt="Arrow Icon"
                        width="32"
                        height="32"
                        style="display: block; border: 0"
                      />
                                            </td>
                                          </tr>
                                          <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 16px; font-weight: 500; line-height: 16px; margin: 12px 0;">Réservation Confirmée</p>
                                            </td>
                                          </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 12px; margin: 0; line-height: 16px;">
                      Nous sommes heureux de confirmer que le véhicule que vous avez sélectionné a été réservé avec succès. Cela garantit qu'il ne sera pas disponible pour d'autres acheteurs sur notre plateforme pendant que nous engageons la discussion avec le vendeur pour faire avancer votre achat.
                    </p>
                                            </td>
                                          </tr>
                                        </table>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                hasNotification: true,
                variation: 'confirmed',
                offerPrice,
                hideYourOfferText: true,
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
      subject: 'La Tua Prenotazione è Stata Confermata',
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
                >Gentile ${dealerName || data?.vendorAccountName || data?.dealerName || 'Dealer'},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Il nostro team sta attualmente lavorando ai prossimi passaggi e vi aggiornerà a breve via email e attraverso la vostra dashboard.
              </p>

               <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 10px; margin-top: 20px; padding: 24px;"
              >
                <tr>
                   <td align="center">
                    <img
                        src=${IMAGES.calenderIcon}
                        alt="Arrow Icon"
                        width="32"
                        height="32"
                        style="display: block; border: 0"
                      />
                                            </td>
                                          </tr>
                                          <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 16px; font-weight: 500; line-height: 16px; margin: 12px 0;">Prenotazione Confermata</p>
                                            </td>
                                          </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 12px; margin: 0; line-height: 16px;">
                      Siamo lieti di confermare che il veicolo da voi selezionato è stato prenotato con successo. Questo garantisce che non sarà disponibile per altri acquirenti sulla nostra piattaforma mentre ci impegniamo con il venditore per portare avanti il vostro acquisto.
                    </p>
                                            </td>
                                          </tr>
                                        </table>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                hasNotification: true,
                variation: 'confirmed',
                offerPrice,
                hideYourOfferText: true,
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
      subject: 'Ihre Reservierung wurde Bestätigt',
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
                >Sehr geehrte/r ${dealerName || data?.vendorAccountName || data?.dealerName || 'Dealer'},</strong
              >

              <p
                style="
                  font-size: 16px;
                  line-height: 24px;
                  margin-top: 24px;
                  color: #4F5A6899;
                "
              >
                Unser Team arbeitet derzeit an den nächsten Schritten und wird Sie in Kürze per E-Mail und über Ihr Dashboard informieren.
              </p>

               <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="background-color: #FFFFFF; border-radius: 10px; margin-top: 20px; padding: 24px;"
              >
                <tr>
                   <td align="center">
                    <img
                        src=${IMAGES.calenderIcon}
                        alt="Arrow Icon"
                        width="32"
                        height="32"
                        style="display: block; border: 0"
                      />
                                            </td>
                                          </tr>
                                          <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 16px; font-weight: 500; line-height: 16px; margin: 12px 0;">Reservierung Bestätigt</p>
                                            </td>
                                          </tr>
                <tr>
                  <td align="center">
                    <p style="color: #050B20; font-size: 12px; margin: 0; line-height: 16px;">
                      Wir freuen uns, bestätigen zu können, dass das von Ihnen ausgewählte Fahrzeug erfolgreich reserviert wurde. Dies garantiert, dass es anderen Käufern auf unserer Plattform nicht zur Verfügung steht, während wir mit dem Verkäufer in Kontakt treten, um Ihren Kauf voranzutreiben.
                    </p>
                                            </td>
                                          </tr>
                                        </table>

              ${carCard({
                title: carTitle,
                subTitle: carSubtitle,
                imageUrl: carImage,
                mileage,
                fuelType,
                transmission,
                hasNotification: true,
                variation: 'confirmed',
                offerPrice,
                hideYourOfferText: true,
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

module.exports = { reservedTemplate, languages };
