const carCard = require('./shared/carCard');
const logoFooter = require('./shared/logoFooter');
// Image URLs configuration
const IMAGES = {
  logo: 'https://cdn.automarket.example.com/favicon-dark.png',
  redLine:
    'https://assets.automarket.example.com/red-line2x.png',
  defaultCarImage:
    'https://assets.automarket.example.com/listings/259/e5cf3d38-5b83-4bdd-aec0-75694723f61c.jpg',
  purchaseProcess:
    'https://assets.automarket.example.com/purchase-process-content.png',
  carsFooter: 'https://assets.automarket.example.com/cars.png',
  footerLogo:
    'https://cdn.automarket.example.com/favicon-dark.png',
  transmissionIcon:
    'https://cdn.automarket.example.com/transmission-icon.png',
  kmIcon:
    'https://cdn.automarket.example.com/mileage-icon.png',
  fuelIcon:
    'https://cdn.automarket.example.com/fuel-icon.png',
  viewDetailsButton:
    'https://assets.automarket.example.com/details-icon.png',
  topIcon:
    'https://assets.automarket.example.com/right-top-vector.png',
  bottomIcon:
    'https://assets.automarket.example.com/left-bottom-vector.png',
  redBg: 'https://assets.automarket.example.com/red-bg.png',
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Translations for counter offer email
const translations = {
  en: {
    subject: 'Counter Offer Received',
    title: 'Counter Offer',
    greetingPrefix: 'Dear',
    message: 'We have received a counter offer for your vehicle.',
    originalOffer: 'Your original offer',
    counterOfferLabel: 'Counter offer',
    acceptButton: 'Accept Counter Offer',
    rejectButton: 'Reject Counter Offer',
    viewDashboard: 'View in Dashboard',
    carDetails: 'Car Details',
    mileageLabel: 'Mileage',
    fuelLabel: 'Fuel',
    transmissionLabel: 'Transmission',
    sellersCounterOffer: "Seller's Counter Offer",
    acceptButton: 'Accept',
    declineButton: 'Decline',
    acceptInstructions:
      'If you wish to accept this counter offer, please click the Accept button above.',
    bestRegards: 'Best regards',
    teamSignature: 'Team Car Click',
  },
  nl: {
    subject: 'Tegenaanbod Ontvangen',
    title: 'Tegenaanbod',
    greetingPrefix: 'Beste',
    message: 'We hebben een tegenaanbod ontvangen voor uw voertuig.',
    originalOffer: 'Uw oorspronkelijke aanbod',
    counterOfferLabel: 'Tegenaanbod',
    acceptButton: 'Tegenaanbod Accepteren',
    rejectButton: 'Tegenaanbod Afwijzen',
    viewDashboard: 'Bekijk in Dashboard',
    carDetails: 'Auto Details',
    mileageLabel: 'Kilometerstand',
    fuelLabel: 'Brandstof',
    transmissionLabel: 'Transmissie',
    sellersCounterOffer: "Verkoper's Tegenaanbod",
    acceptButton: 'Accepteren',
    declineButton: 'Afwijzen',
    acceptInstructions:
      'Als u dit tegenaanbod wilt accepteren, klik dan op de knop Accepteren hierboven.',
    bestRegards: 'Met vriendelijke groet',
    teamSignature: 'Team Car Click',
  },
  fr: {
    subject: 'Contre-offre Reçue',
    title: 'Contre-offre',
    greetingPrefix: 'Cher',
    message: 'Nous avons reçu une contre-offre pour votre véhicule.',
    originalOffer: 'Votre offre originale',
    counterOfferLabel: 'Contre-offre',
    acceptButton: 'Accepter la Contre-offre',
    rejectButton: 'Rejeter la Contre-offre',
    viewDashboard: 'Voir dans le Tableau de Bord',
    carDetails: 'Détails de la Voiture',
    mileageLabel: 'Kilométrage',
    fuelLabel: 'Carburant',
    transmissionLabel: 'Transmission',
    sellersCounterOffer: 'Contre-offre du Vendeur',
    acceptButton: 'Accepter',
    declineButton: 'Refuser',
    acceptInstructions:
      'Si vous souhaitez accepter cette contre-offre, veuillez cliquer sur le bouton Accepter ci-dessus.',
    bestRegards: 'Cordialement',
    teamSignature: 'Équipe Car Click',
  },
  it: {
    subject: 'Controfferta Ricevuta',
    title: 'Controfferta',
    greetingPrefix: 'Caro',
    message: 'Abbiamo ricevuto una controfferta per il tuo veicolo.',
    originalOffer: 'La tua offerta originale',
    counterOfferLabel: 'Controfferta',
    acceptButton: 'Accetta Controfferta',
    rejectButton: 'Rifiuta Controfferta',
    viewDashboard: 'Visualizza nel Cruscotto',
    carDetails: 'Dettagli Auto',
    mileageLabel: 'Chilometraggio',
    fuelLabel: 'Carburante',
    transmissionLabel: 'Trasmissione',
    sellersCounterOffer: 'Controfferta del Venditore',
    acceptButton: 'Accetta',
    declineButton: 'Rifiuta',
    acceptInstructions:
      'Se desideri accettare questa controfferta, clicca sul pulsante Accetta sopra.',
    bestRegards: 'Cordiali saluti',
    teamSignature: 'Team Car Click',
  },
  de: {
    subject: 'Gegenangebot Erhalten',
    title: 'Gegenangebot',
    greetingPrefix: 'Lieber',
    message: 'Wir haben ein Gegenangebot für Ihr Fahrzeug erhalten.',
    originalOffer: 'Ihr ursprüngliches Angebot',
    counterOfferLabel: 'Gegenangebot',
    acceptButton: 'Gegenangebot Annehmen',
    rejectButton: 'Gegenangebot Ablehnen',
    viewDashboard: 'Im Dashboard Anzeigen',
    carDetails: 'Fahrzeugdetails',
    mileageLabel: 'Kilometerstand',
    fuelLabel: 'Kraftstoff',
    transmissionLabel: 'Getriebe',
    sellersCounterOffer: 'Gegenangebot des Verkäufers',
    acceptButton: 'Annehmen',
    declineButton: 'Ablehnen',
    acceptInstructions:
      'Wenn Sie dieses Gegenangebot annehmen möchten, klicken Sie bitte auf die Schaltfläche Annehmen oben.',
    bestRegards: 'Mit freundlichen Grüßen',
    teamSignature: 'Team Car Click',
  },
};

const counterOfferEmailTemplate = ({
  dealerName,
  listingDetails,
  offer,
  counterOffer,
  language = 'en',
  dashboardUrl = process.env.DASHBOARD_URL + '/offers' ||
  'https://dashboard.automarket.example.com/offers',
}) => {
  // Format the counter offer amount properly
  const formatOfferAmount = (amount) => {
    if (!amount) return '€0';
    if (typeof amount === 'number') {
      return `€${amount.toLocaleString()}`;
    }
    if (typeof amount === 'string') {
      // Remove any currency symbols and parse
      const cleanAmount = amount.replace(/[€$£,]/g, '');
      const numAmount = parseFloat(cleanAmount);
      if (!isNaN(numAmount)) {
        return `€${numAmount.toLocaleString()}`;
      }
      return amount; // Return as-is if can't parse
    }
    return '€0';
  };

  // Get car image from first ListingPhotos
  const getCarImage = () => {
    if (listingDetails?.photos && listingDetails.photos.length > 0) {
      return (
        listingDetails.photos[0]?.dataValues?.url ||
        listingDetails.photos[0]?.url ||
        IMAGES.defaultCarImage
      );
    }
    return (
      listingDetails?.main_image ||
      listingDetails?.image ||
      IMAGES.defaultCarImage
    );
  };

  // Safely get car details with fallbacks
  const getCarTitle = () => {
    const brand =
      listingDetails?.brand_name ||
      listingDetails?.dataValues?.brand_name ||
      listingDetails?.brand ||
      'Car';
    const model =
      listingDetails?.model || listingDetails?.dataValues?.model || '';
    const firstRegistration =
      listingDetails?.first_registration ||
      listingDetails?.dataValues?.first_registration;

    if (brand && model && firstRegistration) {
      // Get first word of model
      const firstWord = model.split(' ')[0];
      // Extract year from first_registration (format: YYYY-MM-DD)
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

  const getCarSubtitle = () => {
    const model =
      listingDetails?.model || listingDetails?.dataValues?.model || '';
    if (model) {
      // Get everything after the first word
      const words = model.split(' ');
      if (words.length > 1) {
        return words.slice(1).join(' ');
      }
      return model;
    }
    return (
      listingDetails?.trim ||
      listingDetails?.variant ||
      listingDetails?.specification ||
      listingDetails?.dataValues?.trim ||
      listingDetails?.dataValues?.variant ||
      listingDetails?.dataValues?.specification ||
      'Vehicle Details'
    );
  };

  const getMileage = () => {
    const km_stand =
      listingDetails?.km_stand ||
      listingDetails?.odometer ||
      listingDetails?.dataValues?.km_stand ||
      listingDetails?.dataValues?.odometer;
    if (km_stand && typeof km_stand === 'number') {
      return `${km_stand.toLocaleString()} Km`;
    }
    if (km_stand && typeof km_stand === 'string') {
      return `${km_stand} Km`;
    }
    return 'Km N/A';
  };

  const getFuelType = () => {
    const fuel =
      listingDetails?.fuel_type ||
      listingDetails?.fuel ||
      listingDetails?.dataValues?.fuel_type ||
      listingDetails?.dataValues?.fuel;
    if (fuel) {
      return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
    }
    return 'Fuel N/A';
  };

  const getTransmission = () => {
    const transmission_type =
      listingDetails?.transmission_type ||
      listingDetails?.gear ||
      listingDetails?.dataValues?.transmission_type ||
      listingDetails?.dataValues?.gear;
    if (transmission_type) {
      return (
        transmission_type.charAt(0).toUpperCase() +
        transmission_type.slice(1).toLowerCase()
      );
    }
    return 'Transmission N/A';
  };

  const formattedCounterOffer = formatOfferAmount(counterOffer);
  const formattedOffer = formatOfferAmount(offer);

  // Get translations for the current language
  const t = translations[language] || translations.en;

  const templates = {
    en: {
      subject: t.subject,
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
    <title>${t.subject}</title>
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
            <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C">${t.greetingPrefix} ${dealerName || 'Dealer'},</strong>
            <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 24px; color: #4f5a6899">
              ${t.message}
            </p>

            <!-- Vehicle Card Section -->
            ${carCard({ title: getCarTitle(), subTitle: getCarSubtitle(), imageUrl: getCarImage(), mileage: getMileage(), fuelType: getFuelType(), transmission: getTransmission(), offerPrice: formattedOffer })}

            <!-- Counter Offer Details -->
            <p
              style="
                margin-top: 20px;
                font-size: 14px;
                text-align: center;
                color: #e91e63;
                margin-bottom: 0;
                line-height: 22px;
              "
            >
              ${t.sellersCounterOffer}
            </p>
            <p
              style="
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                color: #e91e63;
              "
            >
              ${formattedCounterOffer}
            </p>

            <!-- Buttons Section -->
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="border-collapse: collapse; margin-top: 10px"
            >
              <tr>
                <td align="center">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    style="border-collapse: collapse"
                  >
                     <tr>
                      <td
                        class="button-wrapper"
                        align="center"
                        style="padding: 0 10px 0 0"
                      >
                        <a
                          href="${dashboardUrl}"
                          target="_blank"
                          style="
                            background-color: #e91e63;
                            border: 1px solid #e91e63;
                            border-radius: 128px;
                            color: #ffffff;
                            display: inline-block;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            font-weight: bold;
                            line-height: 24px;
                            padding: 9px 42px;
                            text-align: center;
                            text-decoration: none;
                            mso-padding-alt: 10px 20px;
                          "
                          >${t.acceptButton}</a
                        >
                      </td>
                      <td
                        class="button-wrapper"
                        align="center"
                        style="padding: 0 0 0 10px"
                      >
                        <a
                          href="${dashboardUrl}"
                          target="_blank"
                          style="
                            background-color: #050b20;
                            border: 1px solid #050b20;
                            border-radius: 128px;
                            color: #ffffff;
                            display: inline-block;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            font-weight: bold;
                            line-height: 24px;
                            padding: 9px 42px;
                            text-align: center;
                            text-decoration: none;
                            mso-padding-alt: 10px 20px;
                          "
                          >${t.declineButton}</a
                        >
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p
              style="
                margin: 30px 0 0 0;
                font-size: 16px;
                text-align: center;
                color: #666666;
              "
            >
              ${t.acceptInstructions}
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
                ${t.bestRegards},
              </p>
              <p style="margin: 0;
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;"
                >
                ${t.teamSignature}
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

  return {
    subject: t.subject,
    body: templates.en.body,
  };
};

module.exports = { counterOfferEmailTemplate, languages };
