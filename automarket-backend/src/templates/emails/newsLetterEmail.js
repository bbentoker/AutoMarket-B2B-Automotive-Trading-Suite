// Translations for newsletter email
const translations = {
  en: {
    subject: (firstName, dealerName) =>
      `${firstName} – Fresh Cars Available Today for ${dealerName}`,
    greeting: (firstName) => `Hello ${firstName},`,
    mainMessage:
      'We have a great selection of cars available today at competitive purchase prices for your dealership.',
    firstTimeBuying:
      "If this is your first time buying from us, you'll only make payment once the vehicle has been delivered to you. Every car comes with a full inspection report for your peace of mind.",
    clickHereText: 'Click here to see cars for sale',
    replyMessage:
      "Simply reply to this email with the cars you're interested in, and we'll send you the inspection reports right away.",
    partnershipMessage:
      'We look forward to building a successful partnership and completing our first deal with you.',
    bestRegards: 'Best regards,',
    signature: {
      name: 'Camilla Sangin',
      website: 'www.automarket.example.com',
      email: 'info@automarket.example.com',
      company: 'Produktiv bilhandel i Sverige AB',
      address: 'Norrlandsgatan 16',
      postalCode: '111 43',
      country: 'Stockholm',
    },
  },
  it: {
    subject: (firstName, dealerName) =>
      `${firstName} – Auto Fresche Disponibili Oggi per ${dealerName}`,
    greeting: (firstName) => `Ciao ${firstName},`,
    mainMessage:
      'Abbiamo una grande selezione di auto disponibili oggi a prezzi di acquisto competitivi per la tua concessionaria.',
    firstTimeBuying:
      'Se questa è la prima volta che acquisti da noi, effettuerai il pagamento solo una volta che il veicolo ti sarà stato consegnato. Ogni auto viene fornita con un rapporto di ispezione completo per la tua tranquillità.',
    clickHereText: 'Clicca qui per vedere le auto in vendita',
    replyMessage:
      'Rispondi semplicemente a questa email con le auto che ti interessano e ti invieremo subito i rapporti di ispezione.',
    partnershipMessage:
      "Non vediamo l'ora di costruire una partnership di successo e completare il nostro primo affare con te.",
    bestRegards: 'Cordiali saluti,',
    signature: {
      name: 'Camilla Sangin',
      website: 'www.automarket.example.com',
      email: 'info@automarket.example.com',
      company: 'Produktiv bilhandel i Sverige AB',
      address: 'Norrlandsgatan 16',
      postalCode: '111 43',
      country: 'Stockholm',
    },
  },
  de: {
    subject: (firstName, dealerName) =>
      `${firstName} – Frische Autos Heute Verfügbar für ${dealerName}`,
    greeting: (firstName) => `Hallo ${firstName},`,
    mainMessage:
      'Wir haben heute eine große Auswahl an Autos zu wettbewerbsfähigen Einkaufspreisen für Ihr Autohaus verfügbar.',
    firstTimeBuying:
      'Wenn Sie zum ersten Mal bei uns kaufen, zahlen Sie erst, wenn das Fahrzeug an Sie geliefert wurde. Jedes Auto wird mit einem vollständigen Inspektionsbericht für Ihre Sicherheit geliefert.',
    clickHereText: 'Klicken Sie hier, um Autos zum Verkauf zu sehen',
    replyMessage:
      'Antworten Sie einfach auf diese E-Mail mit den Autos, die Sie interessieren, und wir senden Ihnen sofort die Inspektionsberichte.',
    partnershipMessage:
      'Wir freuen uns darauf, eine erfolgreiche Partnerschaft aufzubauen und unser erstes Geschäft mit Ihnen abzuschließen.',
    bestRegards: 'Mit freundlichen Grüßen,',
    signature: {
      name: 'Camilla Sangin',
      website: 'www.automarket.example.com',
      email: 'info@automarket.example.com',
      company: 'Produktiv bilhandel i Sverige AB',
      address: 'Norrlandsgatan 16',
      postalCode: '111 43',
      country: 'Stockholm',
    },
  },
  nl: {
    subject: (firstName, dealerName) =>
      `${firstName} – Verse Auto's Vandaag Beschikbaar voor ${dealerName}`,
    greeting: (firstName) => `Hallo ${firstName},`,
    mainMessage:
      "We hebben vandaag een geweldige selectie auto's beschikbaar tegen concurrerende inkoopprijzen voor uw dealership.",
    firstTimeBuying:
      'Als dit de eerste keer is dat u bij ons koopt, betaalt u pas nadat het voertuig bij u is afgeleverd. Elke auto wordt geleverd met een volledig inspectierapport voor uw gemoedsrust.',
    clickHereText: "Klik hier om auto's te koop te zien",
    replyMessage:
      "Reageer gewoon op deze email met de auto's waarin u geïnteresseerd bent, en we sturen u meteen de inspectierapporten.",
    partnershipMessage:
      'We kijken ernaar uit om een succesvolle partnerschap op te bouwen en onze eerste deal met u af te ronden.',
    bestRegards: 'Met vriendelijke groet,',
    signature: {
      name: 'Camilla Sangin',
      website: 'www.automarket.example.com',
      email: 'info@automarket.example.com',
      company: 'Produktiv bilhandel i Sverige AB',
      address: 'Norrlandsgatan 16',
      postalCode: '111 43',
      country: 'Stockholm',
    },
  },
  fr: {
    subject: (firstName, dealerName) =>
      `${firstName} – Voitures Fraîches Disponibles Aujourd'hui pour ${dealerName}`,
    greeting: (firstName) => `Bonjour ${firstName},`,
    mainMessage:
      "Nous avons une excellente sélection de voitures disponibles aujourd'hui à des prix d'achat compétitifs pour votre concession.",
    firstTimeBuying:
      "Si c'est la première fois que vous achetez chez nous, vous ne paierez qu'une fois le véhicule livré chez vous. Chaque voiture est accompagnée d'un rapport d'inspection complet pour votre tranquillité d'esprit.",
    clickHereText: 'Cliquez ici pour voir les voitures à vendre',
    replyMessage:
      "Répondez simplement à cet email avec les voitures qui vous intéressent, et nous vous enverrons les rapports d'inspection immédiatement.",
    partnershipMessage:
      'Nous avons hâte de construire un partenariat réussi et de conclure notre première affaire avec vous.',
    bestRegards: 'Meilleures salutations,',
    signature: {
      name: 'Camilla Sangin',
      website: 'www.automarket.example.com',
      email: 'info@automarket.example.com',
      company: 'Produktiv bilhandel i Sverige AB',
      address: 'Norrlandsgatan 16',
      postalCode: '111 43',
      country: 'Stockholm',
    },
  },
};

// Country ID to language mapping based on the newsletter contacts data
const countryToLanguageMap = {
  // German-speaking countries
  83: 'de', // Germany - German
  11: 'de', // Austria - German
  230: 'de', // Switzerland - German (if German part)

  // French-speaking countries
  76: 'fr', // France - French
  22: 'fr', // Belgium - French (if French part)

  // Italian-speaking countries
  110: 'it', // Italy - Italian

  // Dutch-speaking countries
  155: 'nl', // Netherlands - Dutch

  // English-speaking countries (and fallback)
  40: 'en', // Canada - English
  1: 'en', // United States - English
  15: 'en', // Australia - English
  211: 'en', // United Kingdom - English
  // Add more countries as needed - all others default to 'en'
};

// Country code to language mapping (using ISO country codes)
const countryCodeToLanguageMap = {
  DE: 'de', // Germany - German
  AT: 'de', // Austria - German
  CH: 'de', // Switzerland - German (default, could be fr/it too)

  FR: 'fr', // France - French
  BE: 'fr', // Belgium - French (default, could be nl too)

  IT: 'it', // Italy - Italian

  NL: 'nl', // Netherlands - Dutch

  // English-speaking countries (and fallback)
  US: 'en', // United States - English
  CA: 'en', // Canada - English
  GB: 'en', // United Kingdom - English
  AU: 'en', // Australia - English
  IE: 'en', // Ireland - English
  // Add more as needed - all others default to 'en'
};

// Function to get language from country code
function getLanguageFromCountryCode(countryCode) {
  if (!countryCode) return 'en';
  return countryCodeToLanguageMap[countryCode.toUpperCase()] || 'en';
}

// Legacy function for backward compatibility
function getLanguageFromCountryId(country_id) {
  return countryToLanguageMap[country_id] || 'en';
}

// Plain newsletter email template function with multi-language support
function autoMarketNewsletterTemplate({
  userName = 'there',
  dealerName = 'your dealership',
  carListings = [],
  newsletter_id = null,
  footerText = 'Thank you for choosing Car Click!',
  contactInfo = {
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
    phone: '+46 40 12 92 20',
  },
  contactId = null,
  country_id = null,
  countryCode = null,
  language = null,
}) {
  // Determine language - prefer country code over country_id
  let detectedLanguage;
  if (countryCode) {
    detectedLanguage = getLanguageFromCountryCode(countryCode);
  } else if (country_id) {
    detectedLanguage = getLanguageFromCountryId(country_id);
  } else {
    detectedLanguage = 'en';
  }

  const emailLanguage = language || detectedLanguage || 'en';

  // Language detection complete

  const t = translations[emailLanguage] || translations.en;

  // Generate subject line
  const subject = t.subject(userName, dealerName);

  // Build plain text content with black text color
  const plainTextContent = `
    <div style="color: #000000;">
      <p style="color: #000000;">${t.greeting(userName)}</p>
      <br>
      <p style="color: #000000;">${t.mainMessage}</p>
      <p style="color: #000000;">${t.firstTimeBuying}</p>
      <br>
      <p style="color: #000000;"><a href="https://browse.automarket.example.com/?newsletter_id=${newsletter_id}" style="color: #0000EE;">${t.clickHereText}</a></p>
      <br>
      <p style="color: #000000;">${t.replyMessage}</p>
      <p style="color: #000000;">${t.partnershipMessage}</p>
      <br>
      <br>
      <p style="color: #000000;">${t.bestRegards}</p>
      <p style="color: #000000;">${t.signature.name}</p>
      <p style="color: #000000;">${t.signature.company}</p>
      <p style="color: #000000;"><a href="http://${t.signature.website}" style="color: #0000EE;">${t.signature.website}</a></p>
      <p style="color: #000000;"><a href="mailto:${t.signature.email}" style="color: #0000EE;">${t.signature.email}</a></p>
      <p style="color: #000000;">${t.signature.address}</p>
      <p style="color: #000000;">${t.signature.postalCode}</p>
      <p style="color: #000000;">${t.signature.country}</p>
                         </div>
  `;

  return {
    subject: subject,
    body: plainTextContent,
  };
}

module.exports = autoMarketNewsletterTemplate;
