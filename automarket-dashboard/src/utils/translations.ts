// Translation system for WeeklyReport and Wishlist components
export type SupportedLanguage = 'en' | 'nl' | 'fr' | 'it' | 'de';

export interface WeeklyReportTranslations {
  // Header section
  weeklyDealerReport: string;
  hiGreeting: string;
  performanceReportDescription: string;
  insightsDescription: string;
  
  // Sales Performance Overview
  salesPerformanceOverview: string;
  weeklyMetricsAndTrends: string;
  metric: string;
  lastWeek: string;
  weekBefore: string;
  change: string;
  carsSold: string;
  
  // Fastest Selling Cars
  fastestSellingCarsTitle: string;
  exclusiveOffersSubtitle: string;
  soldInDays: string;
  highDemandCar: string;
  basedOnSuccessfulSale: string;
  yourCarSoldQuickly: string;
  similarCarSourced: string;
  
  // Demand badges
  veryHighDemand: string;
  highDemand: string;
  
  // Car specifications
  advertised_price_excl_vat: string;
  price_excl_vat: string;
  viewOffer: string;
  viewOurOffer: string;
  
  // Market Information
  inventorySourcedTitle: string;
  dataDrivenSubtitle: string;
  dataDrivenApproach: string;
  recommendationsBasedOn: string;
  analyzingData: string;
  buyingRightCars: string;
  
  // Privacy Notice
  respectPrivacyTitle: string;
  dataProtectionSubtitle: string;
  publicDataOnly: string;
  privacyCommitment: string;
  
  // Footer
  buildingFuture: string;
  allRightsReserved: string;
  partnershipProgram: string;
}

export interface WishlistTranslations {
  // Loading and error states
  loadingFastestSelling: string;
  tryAgain: string;
  
  // Header section
  yourFastestSellingCars: string;
  hiGreeting: string;
  freeReportDescription: string;
  sourcingSimilarCars: string;
  clickInterestedButton: string;
  
  // Car specifications and details
  soldInDays: string;
  soldInDay: string;
  highDemandCarSoldQuickly: string;
  yourAdvertisedPrice: string;
  priceWeCanSourceForYou: string;
  
  // Demand badges
  veryHighDemand: string;
  highDemand: string;
  
  // Features list
  verifiedInspectionReport: string;
  equipmentTrimMatched: string;
  fastReliableTransport: string;
  bestPurchasePriceGuaranteed: string;
  
  // CTA and interest section
  youSoldCarFast: string;
  interestedLetUsFindCar: string;
  requestReceived: string;
  alreadyReceivedInterest: string;
  iAmInterested: string;
  processing: string;
  interestSaved: string;
  
  // Empty state
  wishlistEmpty: string;
  startAddingCars: string;
  
  // Section titles
  fastestSellingCarsLastWeek: string;
  opportunityToBuySimilar: string;
  smartInventoryBuying: string;
  dataDrivenWayToSource: string;
  weRespectYourPrivacy: string;
  dataProtectionCommitment: string;
  
  // Smart inventory section
  smartestCarsToBuy: string;
  ratherThanOfferingRandom: string;
  ourTeamReadyToHelp: string;
  simpleProcess: string;
  simpleProcessDescription: string;
  
  // Privacy section
  strictlyUsePublicData: string;
  fullyCommittedToPrivacy: string;
  
  // Footer
  buildingFutureAutomotive: string;
  allRightsReserved: string;
  emailSentPartnership: string;
  
  // VAT texts
  exclVat: string;
  inclVat: string;
}

export const weeklyReportTranslations: Record<SupportedLanguage, WeeklyReportTranslations> = {
  en: {
    // Header section
    weeklyDealerReport: "Weekly Dealer Report",
    hiGreeting: "Hi",
    performanceReportDescription: "Here's your weekly performance report — a clear summary of how your dealership performed last week. It highlights your key sales figures, shows which vehicles sold the fastest, and includes personalized vehicle offers from us, based on what's currently working best for you.",
    insightsDescription: "These insights are built on publicly available data to support smarter inventory decisions and help you continue driving strong results.",
    
    // Sales Performance Overview
    salesPerformanceOverview: "Sales Performance Overview",
    weeklyMetricsAndTrends: "Weekly metrics and trends",
    metric: "Metric",
    lastWeek: "Last week",
    weekBefore: "Week before",
    change: "Change",
    carsSold: "Cars Sold",
    
    // Fastest Selling Cars
    fastestSellingCarsTitle: "Your Fastest-Selling Cars Last Week",
    exclusiveOffersSubtitle: "Exclusive Offers Based on Your Successful Sales",
    soldInDays: "Sold in: {} days",
    highDemandCar: "High-demand car that sold quickly",
    basedOnSuccessfulSale: "Based on your successful sale",
    yourCarSoldQuickly: "Your car sold quickly.",
    similarCarSourced: "Here's a similar car sourced just for you.",
    
    // Demand badges
    veryHighDemand: "Very High Demand",
    highDemand: "High Demand",
    
    // Car specifications
    advertised_price_excl_vat: "Advertised Price excl. VAT",
    price_excl_vat: "Price excl. VAT",
    viewOffer: "View Offer",
    viewOurOffer: "View Our Offer",
    
    // Market Information
    inventorySourcedTitle: "Inventory Sourced to Meet Your Dealership's Needs",
    dataDrivenSubtitle: "Data-Driven, Personalized Car Recommendation",
    dataDrivenApproach: "At AutoMarket, we take a data-driven approach to offering vehicles tailored for your dealership.",
    recommendationsBasedOn: "Our recommendations are based on your fastest-selling cars from the previous week.",
    analyzingData: "By analyzing data from publicly available sources, we identify the vehicles with the highest demand — ensuring we present you with offers that align perfectly with what's proven to sell best at your dealership right now.",
    buyingRightCars: "Buying the right cars at the right prices has never been easier.",
    
    // Privacy Notice
    respectPrivacyTitle: "We Respect Your Privacy",
    dataProtectionSubtitle: "Data protection and confidentiality commitment",
    publicDataOnly: "At AutoMarket, we strictly use data that is publicly available, gathered from multiple trusted sources to aggregate meaningful insights for your dealership. This allows us to provide accurate, data-driven recommendations without ever relying on proprietary or private information.",
    privacyCommitment: "We are fully committed to protecting your privacy. Your dealership's data is never shared, sold, or disclosed to any third party. We maintain the highest standards of confidentiality and data security, ensuring that your information remains safe and solely used to enhance the services we provide to you.",
    
    // Footer
    buildingFuture: "Building the future of automotive trade",
    allRightsReserved: "© 2025 AutoMarket. All rights reserved.",
    partnershipProgram: "This report is generated as part of our dealer partnership program.",
  },
  
  nl: {
    // Header section
    weeklyDealerReport: "Wekelijks Dealer Rapport",
    hiGreeting: "Hallo",
    performanceReportDescription: "Hier is uw wekelijkse prestatie rapport — een duidelijke samenvatting van hoe uw autobedrijf vorige week heeft gepresteerd. Het belicht uw belangrijkste verkoopcijfers, toont welke voertuigen het snelst verkochten, en bevat gepersonaliseerde voertuigaanbiedingen van ons, gebaseerd op wat momenteel het beste werkt voor u.",
    insightsDescription: "Deze inzichten zijn gebaseerd op openbaar beschikbare gegevens om slimmere voorraadbeslissingen te ondersteunen en u te helpen sterke resultaten te blijven behalen.",
    
    // Sales Performance Overview
    salesPerformanceOverview: "Verkoopprestatie Overzicht",
    weeklyMetricsAndTrends: "Wekelijkse statistieken en trends",
    metric: "Statistiek",
    lastWeek: "Vorige week",
    weekBefore: "Week ervoor",
    change: "Verandering",
    carsSold: "Auto's Verkocht",
    
    // Fastest Selling Cars
    fastestSellingCarsTitle: "Uw Snelst Verkopende Auto's Vorige Week",
    exclusiveOffersSubtitle: "Exclusieve Aanbiedingen Gebaseerd op Uw Succesvolle Verkopen",
    soldInDays: "Verkocht in: {} dagen",
    highDemandCar: "Auto met hoge vraag die snel verkocht werd",
    basedOnSuccessfulSale: "Gebaseerd op uw succesvolle verkoop",
    yourCarSoldQuickly: "Uw auto verkocht snel.",
    similarCarSourced: "Hier is een vergelijkbare auto speciaal voor u gesourced.",
    
    // Demand badges
    veryHighDemand: "Zeer Hoge Vraag",
    highDemand: "Hoge Vraag",
    
    // Car specifications
    advertised_price_excl_vat: "Geadverteerde Prijs excl. BTW",
    price_excl_vat: "Prijs excl. BTW",
    viewOffer: "Aanbod Bekijken",
    viewOurOffer: "Ons Aanbod Bekijken",
    
    // Market Information
    inventorySourcedTitle: "Voorraad Gesourced om aan Uw Autobedrijf's Behoeften te Voldoen",
    dataDrivenSubtitle: "Data-Gedreven, Gepersonaliseerde Auto Aanbeveling",
    dataDrivenApproach: "Bij AutoMarket nemen we een data-gedreven aanpak om voertuigen aan te bieden die zijn afgestemd op uw autobedrijf.",
    recommendationsBasedOn: "Onze aanbevelingen zijn gebaseerd op uw snelst verkopende auto's van de vorige week.",
    analyzingData: "Door gegevens van openbaar beschikbare bronnen te analyseren, identificeren we de voertuigen met de hoogste vraag — en zorgen ervoor dat we u aanbiedingen presenteren die perfect aansluiten bij wat momenteel het beste verkoopt bij uw autobedrijf.",
    buyingRightCars: "Het kopen van de juiste auto's tegen de juiste prijzen is nog nooit zo eenvoudig geweest.",
    
    // Privacy Notice
    respectPrivacyTitle: "Wij Respecteren Uw Privacy",
    dataProtectionSubtitle: "Toezegging voor Gegevensbescherming en Vertrouwelijkheid",
    publicDataOnly: "Bij AutoMarket gebruiken we strikt gegevens die openbaar beschikbaar zijn, verzameld van meerdere vertrouwde bronnen om betekenisvolle inzichten voor uw autobedrijf te aggregeren. Dit stelt ons in staat om nauwkeurige, data-gedreven aanbevelingen te geven zonder ooit te vertrouwen op eigendoms- of privé-informatie.",
    privacyCommitment: "We zijn volledig toegewijd aan het beschermen van uw privacy. De gegevens van uw autobedrijf worden nooit gedeeld, verkocht of bekendgemaakt aan derden. We handhaven de hoogste normen voor vertrouwelijkheid en gegevensbeveiliging, en zorgen ervoor dat uw informatie veilig blijft en uitsluitend wordt gebruikt om de diensten die we u bieden te verbeteren.",
    
    // Footer
    buildingFuture: "Bouwen aan de toekomst van de auto-handel",
    allRightsReserved: "© 2025 AutoMarket. Alle rechten voorbehouden.",
    partnershipProgram: "Dit rapport is gegenereerd als onderdeel van ons dealer partnership programma.",
  },
  
  fr: {
    // Header section
    weeklyDealerReport: "Rapport Concessionnaire Hebdomadaire",
    hiGreeting: "Bonjour",
    performanceReportDescription: "Voici votre rapport de performance hebdomadaire — un résumé clair de la performance de votre concessionnaire la semaine dernière. Il met en évidence vos principaux chiffres de vente, montre quels véhicules se sont vendus le plus rapidement, et inclut des offres de véhicules personnalisées de notre part, basées sur ce qui fonctionne actuellement le mieux pour vous.",
    insightsDescription: "Ces analyses sont basés sur des données publiquement disponibles pour soutenir des décisions d'inventaire plus intelligentes et vous aider à continuer à obtenir de solides résultats.",
    
    // Sales Performance Overview
    salesPerformanceOverview: "Aperçu des Performances de Vente",
    weeklyMetricsAndTrends: "Métriques et tendances hebdomadaires",
    metric: "Métrique",
    lastWeek: "Semaine dernière",
    weekBefore: "Semaine précédente",
    change: "Changement",
    carsSold: "Voitures Vendues",
    
    // Fastest Selling Cars
    fastestSellingCarsTitle: "Vos Voitures les Plus Vendues la Semaine Dernière",
    exclusiveOffersSubtitle: "Offres Exclusives Basées sur Vos Ventes les Plus Réussies",
    soldInDays: "Vendue en: {} jours",
    highDemandCar: "Voiture en forte demande qui s'est vendue rapidement",
    basedOnSuccessfulSale: "Basé sur votre vente réussie",
    yourCarSoldQuickly: "Votre voiture s'est vendue rapidement.",
    similarCarSourced: "Voici une voiture similaire sourcée juste pour vous.",
    
    // Demand badges
    veryHighDemand: "Très Forte Demande",
    highDemand: "Forte Demande",
    
    // Car specifications
    advertised_price_excl_vat: "Prix Annoncé HT",
    price_excl_vat: "Prix HT",
    viewOffer: "Voir l'Offre",
    viewOurOffer: "Voir Notre Offre",
    
    // Market Information
    inventorySourcedTitle: "Inventaire Sourcé pour Répondre aux Besoins de Votre Concessionnaire",
    dataDrivenSubtitle: "Recommandation de Voiture Personnalisée et Basée sur les Données",
    dataDrivenApproach: "Chez AutoMarket, nous adoptons une approche basée sur les données pour offrir des véhicules adaptés à votre concessionnaire.",
    recommendationsBasedOn: "Nos recommandations sont basées sur vos voitures les plus vendues de la semaine précédente.",
    analyzingData: "En analysant les données de sources publiquement disponibles, nous identifions les véhicules avec la plus forte demande — en nous assurant de vous présenter des offres qui s'alignent parfaitement avec ce qui se vend le mieux actuellement dans votre concessionnaire.",
    buyingRightCars: "Acheter les bonnes voitures aux bons prix n'a jamais été aussi facile.",
    
    // Privacy Notice
    respectPrivacyTitle: "Nous Respectons Votre Confidentialité",
    dataProtectionSubtitle: "Engagement de Protection des Données et de Confidentialité",
    publicDataOnly: "Chez AutoMarket, nous utilisons strictement des données qui sont publiquement disponibles, collectées auprès de multiples sources fiables pour agréger des insights significatifs pour votre concessionnaire. Cela nous permet de fournir des recommandations précises et basées sur les données sans jamais nous fier à des informations propriétaires ou privées.",
    privacyCommitment: "Nous nous engageons pleinement à protéger votre confidentialité. Les données de votre concessionnaire ne sont jamais partagées, vendues ou divulguées à des tiers. Nous maintenons les plus hauts standards de confidentialité et de sécurité des données, en nous assurant que vos informations restent sûres et sont utilisées uniquement pour améliorer les services que nous vous fournissons.",
    
    // Footer
    buildingFuture: "Construire l'avenir du commerce automobile",
    allRightsReserved: "© 2025 AutoMarket. Tous droits réservés.",
    partnershipProgram: "Ce rapport est généré dans le cadre de notre programme de partenariat concessionnaire.",
  },
  
  it: {
    // Header section
    weeklyDealerReport: "Rapporto Concessionaria Settimanale",
    hiGreeting: "Ciao",
    performanceReportDescription: "Ecco il tuo rapporto di performance settimanale — un riassunto chiaro di come la tua concessionaria ha performato la scorsa settimana. Evidenzia le tue principali cifre di vendita, mostra quali veicoli si sono venduti più velocemente, e include offerte di veicoli personalizzate da parte nostra, basate su ciò che attualmente funziona meglio per te.",
    insightsDescription: "Questi insight sono basati su dati pubblicamente disponibili per supportare decisioni di inventario più intelligenti e aiutarti a continuare a ottenere risultati solidi.",
    
    // Sales Performance Overview
    salesPerformanceOverview: "Panoramica delle Performance di Vendita",
    weeklyMetricsAndTrends: "Metriche e tendenze settimanali",
    metric: "Metrica",
    lastWeek: "Settimana scorsa",
    weekBefore: "Settimana precedente",
    change: "Cambiamento",
    carsSold: "Auto Vendute",
    
    // Fastest Selling Cars
    fastestSellingCarsTitle: "Le Tue Auto Più Vendute la Scorsa Settimana",
    exclusiveOffersSubtitle: "Offerte Esclusive Basate sulle Tue Vendite Più Riuscite",
    soldInDays: "Venduta in: {} giorni",
    highDemandCar: "Auto ad alta domanda che si è venduta velocemente",
    basedOnSuccessfulSale: "Basato sulla tua vendita di successo",
    yourCarSoldQuickly: "La tua auto si è venduta velocemente.",
    similarCarSourced: "Ecco un'auto simile sourced apposta per te.",
    
    // Demand badges
    veryHighDemand: "Domanda Molto Alta",
    highDemand: "Alta Domanda",
    
    // Car specifications
    advertised_price_excl_vat: "Prezzo Pubblicizzato IVA Escl.",
    price_excl_vat: "Prezzo IVA Escl.",
    viewOffer: "Visualizza Offerta",
    viewOurOffer: "Visualizza la Nostra Offerta",
    
    // Market Information
    inventorySourcedTitle: "Inventario Sourced per Soddisfare le Esigenze della Tua Concessionaria",
    dataDrivenSubtitle: "Raccomandazione Auto Personalizzata e Basata sui Dati",
    dataDrivenApproach: "In AutoMarket, adottiamo un approccio basato sui dati per offrire veicoli adattati alla tua concessionaria.",
    recommendationsBasedOn: "Le nostre raccomandazioni sono basate sulle tue auto più vendute della settimana precedente.",
    analyzingData: "Analizzando i dati da fonti pubblicamente disponibili, identifichiamo i veicoli con la domanda più alta — assicurandoci di presentarti offerte che si allineano perfettamente con ciò che attualmente si vende meglio nella tua concessionaria.",
    buyingRightCars: "Comprare le auto giuste ai prezzi giusti non è mai stato così facile.",
    
    // Privacy Notice
    respectPrivacyTitle: "Rispettiamo la Tua Privacy",
    dataProtectionSubtitle: "Impegno per la Protezione dei Dati e la Riservatezza",
    publicDataOnly: "In AutoMarket, utilizziamo rigorosamente dati che sono pubblicamente disponibili, raccolti da multiple fonti affidabili per aggregare insight significativi per la tua concessionaria. Questo ci permette di fornire raccomandazioni accurate e basate sui dati senza mai fare affidamento su informazioni proprietarie o private.",
    privacyCommitment: "Siamo pienamente impegnati a proteggere la tua privacy. I dati della tua concessionaria non sono mai condivisi, venduti o divulgati a terzi. Manteniamo i più alti standard di riservatezza e sicurezza dei dati, assicurandoci che le tue informazioni rimangano sicure e siano utilizzate esclusivamente per migliorare i servizi che ti forniamo.",
    
    // Footer
    buildingFuture: "Costruire il futuro del commercio automobilistico",
    allRightsReserved: "© 2025 AutoMarket. Tutti i diritti riservati.",
    partnershipProgram: "Questo rapporto è generato come parte del nostro programma di partnership concessionaria.",
  },
  
  de: {
    // Header section
    weeklyDealerReport: "Wöchentlicher Händlerbericht",
    hiGreeting: "Hallo",
    performanceReportDescription: "Hier ist Ihr wöchentlicher Leistungsbericht — eine klare Zusammenfassung der Leistung Ihres Autohauses in der vergangenen Woche. Er hebt Ihre wichtigsten Verkaufszahlen hervor, zeigt, welche Fahrzeuge am schnellsten verkauft wurden, und enthält personalisierte Fahrzeugangebote von uns, basierend auf dem, was derzeit am besten für Sie funktioniert.",
    insightsDescription: "Diese Erkenntnisse basieren auf öffentlich verfügbaren Daten, um intelligentere Bestandsentscheidungen zu unterstützen und Ihnen zu helfen, weiterhin starke Ergebnisse zu erzielen.",
    
    // Sales Performance Overview
    salesPerformanceOverview: "Verkaufsleistungsübersicht",
    weeklyMetricsAndTrends: "Wöchentliche Kennzahlen und Trends",
    metric: "Kennzahl",
    lastWeek: "Letzte Woche",
    weekBefore: "Woche davor",
    change: "Änderung",
    carsSold: "Verkaufte Autos",
    
    // Fastest Selling Cars
    fastestSellingCarsTitle: "Ihre Schnellstverkaufenden Autos Letzte Woche",
    exclusiveOffersSubtitle: "Exklusive Angebote Basierend auf Ihren Erfolgreichsten Verkäufen",
    soldInDays: "Verkauft in: {} Tagen",
    highDemandCar: "Auto mit hoher Nachfrage, das sich schnell verkauft hat",
    basedOnSuccessfulSale: "Basierend auf Ihrem erfolgreichen Verkauf",
    yourCarSoldQuickly: "Ihr Auto hat sich schnell verkauft.",
    similarCarSourced: "Hier ist ein ähnliches Auto, das speziell für Sie gesourced wurde.",
    
    // Demand badges
    veryHighDemand: "Sehr Hohe Nachfrage",
    highDemand: "Hohe Nachfrage",
    
    // Car specifications
    advertised_price_excl_vat: "Beworbener Preis zzgl. MwSt.",
    price_excl_vat: "Preis zzgl. MwSt.",
    viewOffer: "Angebot Ansehen",
    viewOurOffer: "Unser Angebot Ansehen",
    
    // Market Information
    inventorySourcedTitle: "Bestand Gesourced um die Bedürfnisse Ihres Autohauses zu Erfüllen",
    dataDrivenSubtitle: "Datengetriebene, Personalisierte Auto-Empfehlung",
    dataDrivenApproach: "Bei AutoMarket verfolgen wir einen datengetriebenen Ansatz, um Fahrzeuge anzubieten, die auf Ihr Autohaus zugeschnitten sind.",
    recommendationsBasedOn: "Unsere Empfehlungen basieren auf Ihren schnellstverkaufenden Autos der vorherigen Woche.",
    analyzingData: "Durch die Analyse von Daten aus öffentlich verfügbaren Quellen identifizieren wir die Fahrzeuge mit der höchsten Nachfrage — und stellen sicher, dass wir Ihnen Angebote präsentieren, die perfekt zu dem passen, was derzeit in Ihrem Autohaus am besten verkauft wird.",
    buyingRightCars: "Die richtigen Autos zu den richtigen Preisen zu kaufen war noch nie einfacher.",
    
    // Privacy Notice
    respectPrivacyTitle: "Wir Respektieren Ihre Privatsphäre",
    dataProtectionSubtitle: "Verpflichtung zum Datenschutz und zur Vertraulichkeit",
    publicDataOnly: "Bei AutoMarket verwenden wir streng Daten, die öffentlich verfügbar sind, gesammelt von mehreren vertrauenswürdigen Quellen, um aussagekräftige Erkenntnisse für Ihr Autohaus zu aggregieren. Dies ermöglicht es uns, präzise, datengetriebene Empfehlungen zu geben, ohne uns jemals auf proprietäre oder private Informationen zu verlassen.",
    privacyCommitment: "Wir sind voll und ganz dem Schutz Ihrer Privatsphäre verpflichtet. Die Daten Ihres Autohauses werden niemals geteilt, verkauft oder an Dritte weitergegeben. Wir halten die höchsten Standards für Vertraulichkeit und Datensicherheit ein und stellen sicher, dass Ihre Informationen sicher bleiben und ausschließlich zur Verbesserung der Dienstleistungen verwendet werden, die wir Ihnen anbieten.",
    
    // Footer
    buildingFuture: "Die Zukunft des Automobilhandels gestalten",
    allRightsReserved: "© 2025 AutoMarket. Alle Rechte vorbehalten.",
    partnershipProgram: "Dieser Bericht wird als Teil unseres Händler-Partnerschaftsprogramms generiert.",
  },
};

export const wishlistTranslations: Record<SupportedLanguage, WishlistTranslations> = {
  en: {
    // Loading and error states
    loadingFastestSelling: "Loading Your Fastest-Selling Cars This Week",
    tryAgain: "Try Again",
    
    // Header section
    yourFastestSellingCars: "Your Fastest-Selling Cars This Week",
    hiGreeting: "Hi",
    freeReportDescription: "This free report highlights the fastest-selling cars at {}, giving you the insights you need to stay ahead and make smarter purchasing decisions.",
    sourcingSimilarCars: "Our team can help you quickly source similar high-demand vehicles—at the best prices, completely free, with no obligation to buy.",
    clickInterestedButton: "Just click the \"I'm Interested\" button, and we'll find the same cars for your dealership at the best prices, with no obligation to buy.",
    
    // Car specifications and details
    soldInDays: "Sold in: {} days",
    soldInDay: "Sold in: {} day",
    highDemandCarSoldQuickly: "High-demand car that sold quickly",
    yourAdvertisedPrice: "Your Advertised Price",
    priceWeCanSourceForYou: "Price We Can Source For You",
    
    // Demand badges
    veryHighDemand: "Very High Demand",
    highDemand: "High Demand",
    
    // Features list
    verifiedInspectionReport: "Verified Inspection Report",
    equipmentTrimMatched: "Equipment Trim Matched",
    fastReliableTransport: "Fast & Reliable Transport",
    bestPurchasePriceGuaranteed: "Best Purchase Price Guaranteed",
    
    // CTA and interest section
    youSoldCarFast: "You sold your car fast. Let us find you a similar car at the best price",
    interestedLetUsFindCar: "Interested? Let us find this car for you — fast, free, and with no commitment.",
    requestReceived: "Request received! We're now searching for this car at the best possible price for you.",
    alreadyReceivedInterest: "We've already received your interest in this car and are working on finding it for you.",
    iAmInterested: "I am interested",
    processing: "Processing...",
    interestSaved: "Interest Saved",
    
    // Empty state
    wishlistEmpty: "Your wishlist is empty",
    startAddingCars: "Start adding cars to your wishlist to see them here.",
    
    // Section titles
    fastestSellingCarsLastWeek: "Your Fastest-Selling Cars Last Week",
    opportunityToBuySimilar: "Opportunity to buy similar high-performing cars",
    smartInventoryBuying: "Smart Inventory Buying Based on Your Demand",
    dataDrivenWayToSource: "A data-driven way to source your next profitable vehicles",
    weRespectYourPrivacy: "We Respect Your Privacy",
    dataProtectionCommitment: "Data protection and confidentiality commitment",
    
    // Smart inventory section
    smartestCarsToBuy: "At AutoMarket, we believe the smartest cars to buy are the ones you're already selling the fastest—because nothing proves demand better than your own results.",
    ratherThanOfferingRandom: "Rather than offering random stock, we analyze which models move quickest at your dealership and focus on sourcing similar vehicles that match your real market demand.",
    ourTeamReadyToHelp: "Our team is ready to help you source similar cars that are selling fastest at your dealership—at the best prices, completely free, with no obligation to buy.",
    simpleProcess: "Simple process:",
    simpleProcessDescription: "Click \"I am interested\" and we'll handle the rest - from buying to delivery.",
    
    // Privacy section
    strictlyUsePublicData: "At AutoMarket, we strictly use data that is publicly available, gathered from multiple trusted sources to aggregate meaningful insights for your dealership. This allows us to provide accurate, data-driven recommendations without ever relying on proprietary or private information.",
    fullyCommittedToPrivacy: "We are fully committed to protecting your privacy. Your dealership's data is never shared, sold, or disclosed to any third party. We maintain the highest standards of confidentiality and data security, ensuring that your information remains safe and solely used to enhance the services we provide to you.",
    
    // Footer
    buildingFutureAutomotive: "Building the future of automotive trade",
    allRightsReserved: "© 2025 AutoMarket. All rights reserved.",
    emailSentPartnership: "This email was sent to you as part of our dealer partnership program.",
    
    // VAT texts
    exclVat: "Excl. VAT",
    inclVat: "Incl. VAT",
  },
  
  nl: {
    // Loading and error states
    loadingFastestSelling: "Laden van Uw Snelst Verkopende Auto's Deze Week",
    tryAgain: "Probeer Opnieuw",
    
    // Header section
    yourFastestSellingCars: "Uw Snelst Verkopende Auto's Deze Week",
    hiGreeting: "Hallo",
    freeReportDescription: "Dit gratis rapport belicht de snelst verkopende auto's bij {}, en geeft u de inzichten die u nodig heeft om voorop te blijven lopen en slimmere aankoopbeslissingen te nemen.",
    sourcingSimilarCars: "Ons team kan u helpen om snel vergelijkbare auto's met hoge vraag te sourcen—tegen de beste prijzen, volledig gratis, zonder verplichtingen om te kopen.",
    clickInterestedButton: "Klik gewoon op de \"Ik ben geïnteresseerd\" knop, en we vinden dezelfde auto's voor uw autobedrijf tegen de beste prijzen, zonder verplichtingen om te kopen.",
    
    // Car specifications and details
    soldInDays: "Verkocht in: {} dagen",
    soldInDay: "Verkocht in: {} dag",
    highDemandCarSoldQuickly: "Auto met hoge vraag die snel verkocht werd",
    yourAdvertisedPrice: "Uw Geadverteerde Prijs",
    priceWeCanSourceForYou: "Prijs Die We Voor U Kunnen Sourcen",
    
    // Demand badges
    veryHighDemand: "Zeer Hoge Vraag",
    highDemand: "Hoge Vraag",
    
    // Features list
    verifiedInspectionReport: "Geverifieerd Inspectie Rapport",
    equipmentTrimMatched: "Uitrusting Trim Gematcht",
    fastReliableTransport: "Snel & Betrouwbaar Transport",
    bestPurchasePriceGuaranteed: "Beste Aankoopprijs Gegarandeerd",
    
    // CTA and interest section
    youSoldCarFast: "U verkocht uw auto snel. Laat ons een vergelijkbare auto voor u vinden tegen de beste prijs",
    interestedLetUsFindCar: "Geïnteresseerd? Laat ons deze auto voor u vinden — snel, gratis, en zonder verplichtingen.",
    requestReceived: "Verzoek ontvangen! We zoeken nu naar deze auto tegen de best mogelijke prijs voor u.",
    alreadyReceivedInterest: "We hebben uw interesse in deze auto al ontvangen en werken eraan om deze voor u te vinden.",
    iAmInterested: "Ik ben geïnteresseerd",
    processing: "Verwerken...",
    interestSaved: "Interesse Opgeslagen",
    
    // Empty state
    wishlistEmpty: "Uw verlanglijst is leeg",
    startAddingCars: "Begin met het toevoegen van auto's aan uw verlanglijst om ze hier te zien.",
    
    // Section titles
    fastestSellingCarsLastWeek: "Uw Snelst Verkopende Auto's Vorige Week",
    opportunityToBuySimilar: "Mogelijkheid om vergelijkbare goed presterende auto's te kopen",
    smartInventoryBuying: "Slim Voorraad Inkopen Gebaseerd op Uw Vraag",
    dataDrivenWayToSource: "Een data-gedreven manier om uw volgende winstgevende voertuigen te sourcen",
    weRespectYourPrivacy: "Wij Respecteren Uw Privacy",
    dataProtectionCommitment: "Toezegging voor Gegevensbescherming en Vertrouwelijkheid",
    
    // Smart inventory section
    smartestCarsToBuy: "Bij AutoMarket geloven we dat de slimste auto's om te kopen degenen zijn die u al het snelst verkoopt—omdat niets de vraag beter bewijst dan uw eigen resultaten.",
    ratherThanOfferingRandom: "In plaats van willekeurige voorraad aan te bieden, analyseren we welke modellen het snelst bewegen bij uw autobedrijf en focussen we ons op het sourcen van vergelijkbare voertuigen die overeenkomen met uw echte marktvraag.",
    ourTeamReadyToHelp: "Ons team staat klaar om u te helpen vergelijkbare auto's te sourcen die het snelst verkopen bij uw autobedrijf—tegen de beste prijzen, volledig gratis, zonder verplichtingen om te kopen.",
    simpleProcess: "Eenvoudig proces:",
    simpleProcessDescription: "Klik op \"Ik ben geïnteresseerd\" en wij regelen de rest - van inkoop tot levering.",
    
    // Privacy section
    strictlyUsePublicData: "Bij AutoMarket gebruiken we strikt gegevens die openbaar beschikbaar zijn, verzameld van meerdere vertrouwde bronnen om betekenisvolle inzichten voor uw autobedrijf te aggregeren. Dit stelt ons in staat om nauwkeurige, data-gedreven aanbevelingen te geven zonder ooit te vertrouwen op eigendoms- of privé-informatie.",
    fullyCommittedToPrivacy: "We zijn volledig toegewijd aan het beschermen van uw privacy. De gegevens van uw autobedrijf worden nooit gedeeld, verkocht of bekendgemaakt aan derden. We handhaven de hoogste normen voor vertrouwelijkheid en gegevensbeveiliging, en zorgen ervoor dat uw informatie veilig blijft en uitsluitend wordt gebruikt om de diensten die we u bieden te verbeteren.",
    
    // Footer
    buildingFutureAutomotive: "Bouwen aan de toekomst van de auto-handel",
    allRightsReserved: "© 2025 AutoMarket. Alle rechten voorbehouden.",
    emailSentPartnership: "Deze e-mail is naar u verzonden als onderdeel van ons dealer partnership programma.",
    
    // VAT texts
    exclVat: "Excl. BTW",
    inclVat: "Incl. BTW",
  },
  
  fr: {
    // Loading and error states
    loadingFastestSelling: "Chargement de Vos Voitures les Plus Vendues Cette Semaine",
    tryAgain: "Réessayer",
    
    // Header section
    yourFastestSellingCars: "Vos Voitures les Plus Vendues Cette Semaine",
    hiGreeting: "Bonjour",
    freeReportDescription: "Ce rapport gratuit met en évidence les voitures les plus vendues chez {}, vous donnant les insights dont vous avez besoin pour rester en avance et prendre des décisions d'achat plus intelligentes.",
    sourcingSimilarCars: "Notre équipe peut vous aider à sourcer rapidement des véhicules similaires en forte demande—aux meilleurs prix, entièrement gratuit, sans obligation d'achat.",
    clickInterestedButton: "Cliquez simplement sur le bouton \"Je suis intéressé\", et nous trouverons les mêmes voitures pour votre concession aux meilleurs prix, sans obligation d'achat.",
    
    // Car specifications and details
    soldInDays: "Vendue en: {} jours",
    soldInDay: "Vendue en: {} jour",
    highDemandCarSoldQuickly: "Voiture en forte demande qui s'est vendue rapidement",
    yourAdvertisedPrice: "Votre Prix Annoncé",
    priceWeCanSourceForYou: "Prix Que Nous Pouvons Sourcer Pour Vous",
    
    // Demand badges
    veryHighDemand: "Très Forte Demande",
    highDemand: "Forte Demande",
    
    // Features list
    verifiedInspectionReport: "Rapport d'Inspection Vérifié",
    equipmentTrimMatched: "Équipement Trim Adapté",
    fastReliableTransport: "Transport Rapide et Fiable",
    bestPurchasePriceGuaranteed: "Meilleur Prix d'Achat Garanti",
    
    // CTA and interest section
    youSoldCarFast: "Vous avez vendu votre voiture rapidement. Laissez-nous vous trouver une voiture similaire au meilleur prix",
    interestedLetUsFindCar: "Intéressé? Laissez-nous trouver cette voiture pour vous — rapidement, gratuitement, et sans engagement.",
    requestReceived: "Demande reçue! Nous recherchons maintenant cette voiture au meilleur prix possible pour vous.",
    alreadyReceivedInterest: "Nous avons déjà reçu votre intérêt pour cette voiture et travaillons à la trouver pour vous.",
    iAmInterested: "Je suis intéressé",
    processing: "Traitement...",
    interestSaved: "Intérêt Sauvegardé",
    
    // Empty state
    wishlistEmpty: "Votre liste de souhaits est vide",
    startAddingCars: "Commencez à ajouter des voitures à votre liste de souhaits pour les voir ici.",
    
    // Section titles
    fastestSellingCarsLastWeek: "Vos Voitures les Plus Vendues la Semaine Dernière",
    opportunityToBuySimilar: "Opportunité d'acheter des voitures similaires performantes",
    smartInventoryBuying: "Achat d'Inventaire Intelligent Basé sur Votre Demande",
    dataDrivenWayToSource: "Une façon basée sur les données de sourcer vos prochains véhicules rentables",
    weRespectYourPrivacy: "Nous Respectons Votre Confidentialité",
    dataProtectionCommitment: "Engagement de Protection des Données et de Confidentialité",
    
    // Smart inventory section
    smartestCarsToBuy: "Chez AutoMarket, nous croyons que les voitures les plus intelligentes à acheter sont celles que vous vendez déjà le plus rapidement—car rien ne prouve mieux la demande que vos propres résultats.",
    ratherThanOfferingRandom: "Plutôt que d'offrir du stock aléatoire, nous analysons quels modèles bougent le plus rapidement dans votre concession et nous concentrons sur le sourcing de véhicules similaires qui correspondent à votre vraie demande de marché.",
    ourTeamReadyToHelp: "Notre équipe est prête à vous aider à sourcer des voitures similaires qui se vendent le plus rapidement dans votre concession—aux meilleurs prix, entièrement gratuit, sans obligation d'achat.",
    simpleProcess: "Processus simple:",
    simpleProcessDescription: "Cliquez sur \"Je suis intéressé\" et nous nous occupons du reste - de l'achat à la livraison.",
    
    // Privacy section
    strictlyUsePublicData: "Chez AutoMarket, nous utilisons strictement des données qui sont publiquement disponibles, collectées auprès de multiples sources fiables pour agréger des insights significatifs pour votre concession. Cela nous permet de fournir des recommandations précises et basées sur les données sans jamais nous fier à des informations propriétaires ou privées.",
    fullyCommittedToPrivacy: "Nous nous engageons pleinement à protéger votre confidentialité. Les données de votre concession ne sont jamais partagées, vendues ou divulguées à des tiers. Nous maintenons les plus hauts standards de confidentialité et de sécurité des données, en nous assurant que vos informations restent sûres et sont utilisées uniquement pour améliorer les services que nous vous fournissons.",
    
    // Footer
    buildingFutureAutomotive: "Construire l'avenir du commerce automobile",
    allRightsReserved: "© 2025 AutoMarket. Tous droits réservés.",
    emailSentPartnership: "Cet e-mail vous a été envoyé dans le cadre de notre programme de partenariat concessionnaire.",
    
    // VAT texts
    exclVat: "HT",
    inclVat: "TTC",
  },
  
  it: {
    // Loading and error states
    loadingFastestSelling: "Caricamento delle Tue Auto Più Vendute Questa Settimana",
    tryAgain: "Riprova",
    
    // Header section
    yourFastestSellingCars: "Le Tue Auto Più Vendute Questa Settimana",
    hiGreeting: "Ciao",
    freeReportDescription: "Questo report gratuito evidenzia le auto più vendute presso {}, dandoti gli insight di cui hai bisogno per rimanere avanti e prendere decisioni d'acquisto più intelligenti.",
    sourcingSimilarCars: "Il nostro team può aiutarti a sourcing rapidamente veicoli simili ad alta domanda—ai migliori prezzi, completamente gratuito, senza obbligo di acquisto.",
    clickInterestedButton: "Clicca semplicemente il pulsante \"Sono interessato\", e troveremo le stesse auto per la tua concessionaria ai migliori prezzi, senza obbligo di acquisto.",
    
    // Car specifications and details
    soldInDays: "Venduta in: {} giorni",
    soldInDay: "Venduta in: {} giorno",
    highDemandCarSoldQuickly: "Auto ad alta domanda che si è venduta velocemente",
    yourAdvertisedPrice: "Il Tuo Prezzo Pubblicizzato",
    priceWeCanSourceForYou: "Prezzo Che Possiamo Sourcing Per Te",
    
    // Demand badges
    veryHighDemand: "Domanda Molto Alta",
    highDemand: "Alta Domanda",
    
    // Features list
    verifiedInspectionReport: "Rapporto di Ispezione Verificato",
    equipmentTrimMatched: "Equipaggiamento Trim Abbinato",
    fastReliableTransport: "Trasporto Veloce e Affidabile",
    bestPurchasePriceGuaranteed: "Miglior Prezzo d'Acquisto Garantito",
    
    // CTA and interest section
    youSoldCarFast: "Hai venduto la tua auto velocemente. Lascia che troviamo un'auto simile per te al miglior prezzo",
    interestedLetUsFindCar: "Interessato? Lascia che troviamo questa auto per te — velocemente, gratuitamente, e senza impegni.",
    requestReceived: "Richiesta ricevuta! Ora stiamo cercando questa auto al miglior prezzo possibile per te.",
    alreadyReceivedInterest: "Abbiamo già ricevuto il tuo interesse per questa auto e stiamo lavorando per trovarla per te.",
    iAmInterested: "Sono interessato",
    processing: "Elaborazione...",
    interestSaved: "Interesse Salvato",
    
    // Empty state
    wishlistEmpty: "La tua lista dei desideri è vuota",
    startAddingCars: "Inizia ad aggiungere auto alla tua lista dei desideri per vederle qui.",
    
    // Section titles
    fastestSellingCarsLastWeek: "Le Tue Auto Più Vendute la Scorsa Settimana",
    opportunityToBuySimilar: "Opportunità di acquistare auto simili ad alte prestazioni",
    smartInventoryBuying: "Acquisto di Inventario Intelligente Basato sulla Tua Domanda",
    dataDrivenWayToSource: "Un modo basato sui dati per sourcing i tuoi prossimi veicoli redditizi",
    weRespectYourPrivacy: "Rispettiamo la Tua Privacy",
    dataProtectionCommitment: "Impegno per la Protezione dei Dati e la Riservatezza",
    
    // Smart inventory section
    smartestCarsToBuy: "In AutoMarket, crediamo che le auto più intelligenti da acquistare sono quelle che stai già vendendo più velocemente—perché niente prova meglio la domanda dei tuoi stessi risultati.",
    ratherThanOfferingRandom: "Piuttosto che offrire stock casuale, analizziamo quali modelli si muovono più velocemente nella tua concessionaria e ci concentriamo sul sourcing di veicoli simili che corrispondono alla tua vera domanda di mercato.",
    ourTeamReadyToHelp: "Il nostro team è pronto ad aiutarti a sourcing auto simili che si vendono più velocemente nella tua concessionaria—ai migliori prezzi, completamente gratuito, senza obbligo di acquisto.",
    simpleProcess: "Processo semplice:",
    simpleProcessDescription: "Clicca \"Sono interessato\" e ci occuperemo del resto - dall'acquisto alla consegna.",
    
    // Privacy section
    strictlyUsePublicData: "In AutoMarket, utilizziamo rigorosamente dati che sono pubblicamente disponibili, raccolti da multiple fonti affidabili per aggregare insight significativi per la tua concessionaria. Questo ci permette di fornire raccomandazioni accurate e basate sui dati senza mai fare affidamento su informazioni proprietarie o private.",
    fullyCommittedToPrivacy: "Siamo pienamente impegnati a proteggere la tua privacy. I dati della tua concessionaria non sono mai condivisi, venduti o divulgati a terzi. Manteniamo i più alti standard di riservatezza e sicurezza dei dati, assicurandoci che le tue informazioni rimangano sicure e siano utilizzate esclusivamente per migliorare i servizi che ti forniamo.",
    
    // Footer
    buildingFutureAutomotive: "Costruire il futuro del commercio automobilistico",
    allRightsReserved: "© 2025 AutoMarket. Tutti i diritti riservati.",
    emailSentPartnership: "Questa email ti è stata inviata come parte del nostro programma di partnership concessionaria.",
    
    // VAT texts
    exclVat: "IVA Escl.",
    inclVat: "IVA Incl.",
  },
  
  de: {
    // Loading and error states
    loadingFastestSelling: "Laden Ihrer Schnellstverkaufenden Autos Diese Woche",
    tryAgain: "Erneut Versuchen",
    
    // Header section
    yourFastestSellingCars: "Ihre Schnellstverkaufenden Autos Diese Woche",
    hiGreeting: "Hallo",
    freeReportDescription: "Dieser kostenlose Bericht hebt die schnellstverkaufenden Autos bei {} hervor und gibt Ihnen die Erkenntnisse, die Sie brauchen, um voraus zu bleiben und intelligentere Kaufentscheidungen zu treffen.",
    sourcingSimilarCars: "Unser Team kann Ihnen helfen, schnell ähnliche Fahrzeuge mit hoher Nachfrage zu sourcen—zu den besten Preisen, völlig kostenlos, ohne Kaufverpflichtung.",
    clickInterestedButton: "Klicken Sie einfach auf den \"Ich bin interessiert\" Button, und wir finden die gleichen Autos für Ihr Autohaus zu den besten Preisen, ohne Kaufverpflichtung.",
    
    // Car specifications and details
    soldInDays: "Verkauft in: {} Tagen",
    soldInDay: "Verkauft in: {} Tag",
    highDemandCarSoldQuickly: "Auto mit hoher Nachfrage, das sich schnell verkauft hat",
    yourAdvertisedPrice: "Ihr Beworbener Preis",
    priceWeCanSourceForYou: "Preis Den Wir Für Sie Sourcen Können",
    
    // Demand badges
    veryHighDemand: "Sehr Hohe Nachfrage",
    highDemand: "Hohe Nachfrage",
    
    // Features list
    verifiedInspectionReport: "Verifizierter Inspektionsbericht",
    equipmentTrimMatched: "Ausstattung Trim Abgestimmt",
    fastReliableTransport: "Schneller & Zuverlässiger Transport",
    bestPurchasePriceGuaranteed: "Bester Einkaufspreis Garantiert",
    
    // CTA and interest section
    youSoldCarFast: "Sie haben Ihr Auto schnell verkauft. Lassen Sie uns ein ähnliches Auto für Sie zum besten Preis finden",
    interestedLetUsFindCar: "Interessiert? Lassen Sie uns dieses Auto für Sie finden — schnell, kostenlos, und ohne Verpflichtungen.",
    requestReceived: "Anfrage erhalten! Wir suchen jetzt nach diesem Auto zum bestmöglichen Preis für Sie.",
    alreadyReceivedInterest: "Wir haben bereits Ihr Interesse an diesem Auto erhalten und arbeiten daran, es für Sie zu finden.",
    iAmInterested: "Ich bin interessiert",
    processing: "Verarbeitung...",
    interestSaved: "Interesse Gespeichert",
    
    // Empty state
    wishlistEmpty: "Ihre Wunschliste ist leer",
    startAddingCars: "Beginnen Sie damit, Autos zu Ihrer Wunschliste hinzuzufügen, um sie hier zu sehen.",
    
    // Section titles
    fastestSellingCarsLastWeek: "Ihre Schnellstverkaufenden Autos Letzte Woche",
    opportunityToBuySimilar: "Gelegenheit, ähnliche leistungsstarke Autos zu kaufen",
    smartInventoryBuying: "Intelligenter Bestandskauf Basierend auf Ihrer Nachfrage",
    dataDrivenWayToSource: "Ein datengetriebener Weg, Ihre nächsten profitablen Fahrzeuge zu sourcen",
    weRespectYourPrivacy: "Wir Respektieren Ihre Privatsphäre",
    dataProtectionCommitment: "Verpflichtung zum Datenschutz und zur Vertraulichkeit",
    
    // Smart inventory section
    smartestCarsToBuy: "Bei AutoMarket glauben wir, dass die intelligentesten Autos zum Kaufen diejenigen sind, die Sie bereits am schnellsten verkaufen—denn nichts beweist Nachfrage besser als Ihre eigenen Ergebnisse.",
    ratherThanOfferingRandom: "Anstatt zufällige Bestände anzubieten, analysieren wir, welche Modelle sich am schnellsten in Ihrem Autohaus bewegen und konzentrieren uns auf das Sourcing ähnlicher Fahrzeuge, die Ihrer echten Marktnachfrage entsprechen.",
    ourTeamReadyToHelp: "Unser Team ist bereit, Ihnen zu helfen, ähnliche Autos zu sourcen, die sich am schnellsten in Ihrem Autohaus verkaufen—zu den besten Preisen, völlig kostenlos, ohne Kaufverpflichtung.",
    simpleProcess: "Einfacher Prozess:",
    simpleProcessDescription: "Klicken Sie auf \"Ich bin interessiert\" und wir kümmern uns um den Rest - vom Kauf bis zur Lieferung.",
    
    // Privacy section
    strictlyUsePublicData: "Bei AutoMarket verwenden wir streng Daten, die öffentlich verfügbar sind, gesammelt von mehreren vertrauenswürdigen Quellen, um aussagekräftige Erkenntnisse für Ihr Autohaus zu aggregieren. Dies ermöglicht es uns, präzise, datengetriebene Empfehlungen zu geben, ohne uns jemals auf proprietäre oder private Informationen zu verlassen.",
    fullyCommittedToPrivacy: "Wir sind voll und ganz dem Schutz Ihrer Privatsphäre verpflichtet. Die Daten Ihres Autohauses werden niemals geteilt, verkauft oder an Dritte weitergegeben. Wir halten die höchsten Standards für Vertraulichkeit und Datensicherheit ein und stellen sicher, dass Ihre Informationen sicher bleiben und ausschließlich zur Verbesserung der Dienstleistungen verwendet werden, die wir Ihnen anbieten.",
    
    // Footer
    buildingFutureAutomotive: "Die Zukunft des Automobilhandels gestalten",
    allRightsReserved: "© 2025 AutoMarket. Alle Rechte vorbehalten.",
    emailSentPartnership: "Diese E-Mail wurde Ihnen als Teil unseres Händler-Partnerschaftsprogramms gesendet.",
    
    // VAT texts
    exclVat: "zzgl. MwSt.",
    inclVat: "inkl. MwSt.",
  },
};

// Utility function to get translations for a specific language
export function getTranslations(language: string): WeeklyReportTranslations {
  const supportedLanguage = (language as SupportedLanguage) || 'en';
  return weeklyReportTranslations[supportedLanguage] || weeklyReportTranslations.en;
}

// Utility function to get wishlist translations for a specific language
export function getWishlistTranslations(language: string): WishlistTranslations {
  const supportedLanguage = (language as SupportedLanguage) || 'en';
  return wishlistTranslations[supportedLanguage] || wishlistTranslations.en;
}

// Utility function to format strings with placeholders (e.g., "Sold in: {} days")
export function formatString(template: string, ...values: (string | number)[]): string {
  let result = template;
  values.forEach(value => {
    result = result.replace('{}', String(value));
  });
  return result;
}

// Utility function to translate VAT text values
export function translateVatText(vatText: string | undefined, translations: WishlistTranslations): string {
  if (!vatText) return '';
  
  // Normalize the input text to handle various formats
  const normalizedVatText = vatText.toLowerCase().trim();
  
  // Check for "excl" or "excluding" VAT patterns
  if (normalizedVatText.includes('excl') || normalizedVatText.includes('excluding') || normalizedVatText.includes('ex.')) {
    return translations.exclVat;
  }
  
  // Check for "incl" or "including" VAT patterns
  if (normalizedVatText.includes('incl') || normalizedVatText.includes('including') || normalizedVatText.includes('inc.')) {
    return translations.inclVat;
  }
  
  // If no match found, return original text
  return vatText;
}
