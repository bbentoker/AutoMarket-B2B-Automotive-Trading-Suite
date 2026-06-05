// Removed autoMarketCleanTemplate import - no longer using the outer template wrapper

// Translations for wishlist notification email
const translations = {
  en: {
    subject: (firstName, dealerName) =>
      `${firstName}, these cars sold fast at ${dealerName} — and we have more`,
    greeting: (firstName) => `Hi ${firstName},`,
    mainMessage: (dealerName) =>
      `We saw which cars sold really fast at ${dealerName} in the last few days — and we've got similar models ready to deliver, at great purchase prices.`,
    presentationText: (dealerName) => `These cars are selling quickly for you`,
    bulletPoints: [
      'Handpicked based on your recent sales',
      'Available now — no wait times',
      'No upfront payment — pay on delivery',
    ],
    buttonText: 'Click here to see our offers',
    helpMessage: (dealerName) =>
      `The best way to sell more cars is to double down on what's already working for you.`,
    questionText: (firstName) => ``,
    bestRegards: 'Best regards,',
    signature: {
      name: 'Camilla Sangin',
      title: 'B2B Car Sales',
      email: 'info@automarket.example.com',
      website: 'Car Click',
      phone: '+46 12 92 20',
      address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
      postalCode: '',
      country: '',
      orgNumber: 'BE1025.264.462',
    },
  },
  it: {
    subject: (firstName, dealerName) =>
      `${firstName}, queste auto si sono vendute velocemente presso ${dealerName} — e ne abbiamo altre`,
    greeting: (firstName) => `Ciao ${firstName},`,
    mainMessage: (dealerName) =>
      `Abbiamo visto quali auto si sono vendute molto velocemente presso ${dealerName} negli ultimi giorni — e abbiamo modelli simili pronti per la consegna, a prezzi di acquisto ottimi.`,
    presentationText: (dealerName) =>
      `Queste auto si stanno vendendo velocemente per te`,
    bulletPoints: [
      'Selezionate in base alle tue vendite recenti',
      'Disponibili ora — nessun tempo di attesa',
      'Nessun pagamento anticipato — paga alla consegna',
    ],
    buttonText: 'Clicca qui per vedere le nostre offerte',
    helpMessage: (dealerName) =>
      `Il modo migliore per vendere più auto è raddoppiare su quello che sta già funzionando per te.`,
    questionText: (firstName) => ``,
    bestRegards: 'Cordiali saluti,',
    signature: {
      name: 'Camilla Sangin',
      title: 'Vendite Auto B2B',
      email: 'info@automarket.example.com',
      website: 'Car Click',
      phone: '+46 12 92 20',
      address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
      postalCode: '',
      country: '',
      orgNumber: 'BE1025.264.462',
    },
  },
  de: {
    subject: (firstName, dealerName) =>
      `${firstName}, diese Autos verkauften sich schnell bei ${dealerName} — und wir haben mehr`,
    greeting: (firstName) => `Hallo ${firstName},`,
    mainMessage: (dealerName) =>
      `Wir haben gesehen, welche Autos sich in den letzten Tagen wirklich schnell bei ${dealerName} verkauft haben — und wir haben ähnliche Modelle bereit zur Lieferung, zu großartigen Kaufpreisen.`,
    presentationText: (dealerName) =>
      `Diese Autos verkaufen sich schnell für Sie`,
    bulletPoints: [
      'Handverlesen basierend auf Ihren letzten Verkäufen',
      'Jetzt verfügbar — keine Wartezeiten',
      'Keine Vorauszahlung — zahlen Sie bei Lieferung',
    ],
    buttonText: 'Hier klicken, um unsere Angebote zu sehen',
    helpMessage: (dealerName) =>
      `Der beste Weg, mehr Autos zu verkaufen, ist, auf das zu setzen, was bereits für Sie funktioniert.`,
    questionText: (firstName) => ``,
    bestRegards: 'Mit freundlichen Grüßen,',
    signature: {
      name: 'Camilla Sangin',
      title: 'B2B Autoverkauf',
      email: 'info@automarket.example.com',
      website: 'Car Click',
      phone: '+46 12 92 20',
      address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
      postalCode: '',
      country: '',
      orgNumber: 'BE1025.264.462',
    },
  },
  nl: {
    subject: (firstName, dealerName) =>
      `${firstName}, deze auto's verkochten snel bij ${dealerName} — en we hebben er meer`,
    greeting: (firstName) => `Hallo ${firstName},`,
    mainMessage: (dealerName) =>
      `We zagen welke auto's de afgelopen dagen echt snel verkochten bij ${dealerName} — en we hebben vergelijkbare modellen klaar voor levering, tegen geweldige aankoopprijzen.`,
    presentationText: (dealerName) => `Deze auto's verkopen zich snel voor jou`,
    bulletPoints: [
      'Handmatig geselecteerd op basis van je recente verkopen',
      'Nu beschikbaar — geen wachttijden',
      'Geen vooruitbetaling — betaal bij levering',
    ],
    buttonText: 'Klik hier om onze aanbiedingen te zien',
    helpMessage: (dealerName) =>
      `De beste manier om meer auto's te verkopen is om in te zetten op wat al voor jou werkt.`,
    questionText: (firstName) => ``,
    bestRegards: 'Met vriendelijke groet,',
    signature: {
      name: 'Camilla Sangin',
      title: 'B2B Autoverkoop',
      email: 'info@automarket.example.com',
      website: 'Car Click',
      phone: '+46 12 92 20',
      address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
      postalCode: '',
      country: '',
      orgNumber: 'BE1025.264.462',
    },
  },
  fr: {
    subject: (firstName, dealerName) =>
      `${firstName}, ces voitures se sont vendues rapidement chez ${dealerName} — et nous en avons d'autres`,
    greeting: (firstName) => `Salut ${firstName},`,
    mainMessage: (dealerName) =>
      `Nous avons vu quelles voitures se sont vendues très rapidement chez ${dealerName} ces derniers jours — et nous avons des modèles similaires prêts à livrer, à d'excellents prix d'achat.`,
    presentationText: (dealerName) =>
      `Ces voitures se vendent rapidement pour vous`,
    bulletPoints: [
      'Sélectionnées à la main basées sur vos ventes récentes',
      "Disponibles maintenant — aucun temps d'attente",
      'Aucun paiement anticipé — payez à la livraison',
    ],
    buttonText: 'Cliquez ici pour voir nos offres',
    helpMessage: (dealerName) =>
      `La meilleure façon de vendre plus de voitures est de doubler sur ce qui fonctionne déjà pour vous.`,
    questionText: (firstName) => ``,
    bestRegards: 'Meilleures salutations,',
    signature: {
      name: 'Camilla Sangin',
      title: 'Vente de Voitures B2B',
      email: 'info@automarket.example.com',
      website: 'Car Click',
      phone: '+46 12 92 20',
      address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
      postalCode: '',
      country: '',
      orgNumber: 'BE1025.264.462',
    },
  },
};

function wishlistNotificationEmailCleanTemplate(data) {
  const { firstName, dealerName, wishlistUrl, language = 'en' } = data;
  const t = translations[language] || translations.en;

  const subject = t.subject(firstName, dealerName);
  const greeting = t.greeting(firstName);

  // Build bullet points HTML
  const bulletPointsHtml = t.bulletPoints
    .map((point) => `<li style="color: #000000;">${point}</li>`)
    .join('');

  // Build plain text content with left-aligned text, selective spacing, and black text color
  const plainTextContent = `
    <div style="color: #000000;">
      <p style="color: #000000;">${greeting}</p>
      <p style="color: #000000;">${t.mainMessage(dealerName)}</p>
      <p style="color: #000000;">${t.presentationText(dealerName)}</p>
      <ul style="color: #000000;">
        ${bulletPointsHtml}
      </ul>
      <p style="color: #000000;"><a href="${wishlistUrl}">${t.buttonText}</a></p>
      <p style="color: #000000;">${t.helpMessage(dealerName)}</p>
      <p style="color: #000000;">${t.questionText(firstName)}</p>
      <br>
      <br>
      <p style="color: #000000;">${t.bestRegards}</p>
      <p style="color: #000000;">${t.signature.name}</p>
      <p style="color: #000000;">${t.signature.title}</p>
      <p style="color: #000000;">${t.signature.email}</p>
      <p style="color: #000000;">${t.signature.website}</p>
      <p style="color: #000000;">${t.signature.phone}</p>
      <p style="color: #000000;">${t.signature.address}</p>
      <p style="color: #000000;">${t.signature.orgNumber}</p>
    </div>
  `;

  return {
    subject: subject,
    body: plainTextContent,
  };
}

module.exports = {
  wishlistNotificationEmailCleanTemplate,
  translations,
};
