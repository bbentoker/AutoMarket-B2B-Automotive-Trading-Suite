// SECURITY-SANITIZED: CDN and asset URLs below are placeholders for public showcase.
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
  detailsArrow:
    'https://cdn.automarket.example.com/image/upload/v1753175483/details-arrow_umcgj1.png',
  calenderIcon:
    'https://cdn.automarket.example.com/image/upload/v1753194740/calendar-icon_fijhts.png',
  headerLogo:
    'https://cdn.automarket.example.com/favicon-dark.png',
  headerRedLine:
    'https://cdn.automarket.example.com/image/upload/v1752927154/b2-arrow_emlqtu.png',
  greenTransportIcon:
    'https://cdn.automarket.example.com/image/upload/v1753111149/green-car_hoyf2b.png',
  upsIcon:
    'https://cdn.automarket.example.com/image/upload/v1753119253/ups-icon_rgmawh.png',
  offerConfirmationIcon:
    'https://cdn.automarket.example.com/image/upload/v1753179907/offer-confirmation_zuegyl.png',
};

const deliveryStatusTranslations = {
  en: {
    'Car Picked Up': {
      title: 'Transport Update',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Your <span style="font-weight: 600">${carTitle}</span> with the following VIN: <span style="font-weight: 600">${VIN}</span> has been picked up and is now on the way to you.`,
    },
    documentsSent: {
      title: 'Documents Dispatched',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `The documents for your <span style="font-weight: 600">${carTitle}</span> with the following VIN: <span style="font-weight: 600">${VIN}</span> have been dispatched via UPS Express and are on their way to you.`,
    },
    ups: {
      message: () =>
        'Use this tracking code to monitor your registration document shipment on UPS Express.',
    },
    offerConfirmation: {
      title: 'Offer Confirmation',
      message: (carTitle) =>
        `Thank you for submitting your offer for the <span style="font-weight: 600">${carTitle}</span>.`,
    },
    transportBooked: {
      title: 'Transport Scheduled',
      message: (carTitle, VIN) =>
        `We're pleased to inform you that transport for your <span style="font-weight: 600">${carTitle}</span> with <span style="font-weight: 600">(VIN: ${VIN})</span> has been successfully scheduled.`,
    },
  },
  nl: {
    'Car Picked Up': {
      title: 'Transport Update',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Uw <span style="font-weight: 600">${carTitle}</span> met het volgende VIN-nummer: <span style="font-weight: 600">${VIN}</span> is opgehaald en is nu onderweg naar u.`,
    },
    documentsSent: {
      title: 'Documenten Verzonden',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `De documenten voor uw <span style="font-weight: 600">${carTitle}</span> met het volgende VIN-nummer: <span style="font-weight: 600">${VIN}</span> zijn verzonden via UPS Express en zijn onderweg naar u.`,
    },
    ups: {
      message: () =>
        'Gebruik deze tracking code om uw registratiedocument zending via UPS Express te volgen.',
    },
    offerConfirmation: {
      title: 'Aanbod Bevestiging',
      message: (carTitle) =>
        `Bedankt voor het indienen van uw aanbod voor de <span style="font-weight: 600">${carTitle}</span>.`,
    },
    transportBooked: {
      title: 'Transport Gepland',
      message: (carTitle, VIN) =>
        `We zijn verheugd u te kunnen melden dat het transport voor uw <span style="font-weight: 600">${carTitle}</span> met <span style="font-weight: 600">(VIN: ${VIN})</span> succesvol is gepland.`,
    },
  },
  fr: {
    'Car Picked Up': {
      title: 'Mise à jour du Transport',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Votre <span style="font-weight: 600">${carTitle}</span> avec le VIN suivant : <span style="font-weight: 600">${VIN}</span> a été récupéré et est maintenant en route vers vous.`,
    },
    documentsSent: {
      title: 'Documents Envoyés',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Les documents pour votre <span style="font-weight: 600">${carTitle}</span> avec le VIN suivant : <span style="font-weight: 600">${VIN}</span> ont été envoyés via UPS Express et sont en route vers vous.`,
    },
    ups: {
      message: () =>
        "Utilisez ce code de suivi pour surveiller l'envoi de votre document d'immatriculation sur UPS Express.",
    },
    offerConfirmation: {
      title: "Confirmation de l'Offre",
      message: (carTitle) =>
        `Merci d'avoir soumis votre offre pour la <span style="font-weight: 600">${carTitle}</span>.`,
    },
    transportBooked: {
      title: 'Transport Programmé',
      message: (carTitle, VIN) =>
        `Nous sommes heureux de vous informer que le transport de votre <span style="font-weight: 600">${carTitle}</span> avec <span style="font-weight: 600">(VIN: ${VIN})</span> a été programmé avec succès.`,
    },
  },
  it: {
    'Car Picked Up': {
      title: 'Aggiornamento Trasporto',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `La vostra <span style="font-weight: 600">${carTitle}</span> con il seguente VIN: <span style="font-weight: 600">${VIN}</span> è stata ritirata ed è ora in viaggio verso di voi.`,
    },
    documentsSent: {
      title: 'Documenti Inviati',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `I documenti per la vostra <span style="font-weight: 600">${carTitle}</span> con il seguente VIN: <span style="font-weight: 600">${VIN}</span> sono stati inviati tramite UPS Express e sono in viaggio verso di voi.`,
    },
    ups: {
      message: () =>
        'Utilizzate questo codice di tracciamento per monitorare la spedizione del vostro documento di registrazione su UPS Express.',
    },
    offerConfirmation: {
      title: 'Conferma Offerta',
      message: (carTitle) =>
        `Grazie per aver inviato la vostra offerta per la <span style="font-weight: 600">${carTitle}</span>.`,
    },
    transportBooked: {
      title: 'Trasporto Programmato',
      message: (carTitle, VIN) =>
        `Siamo lieti di informarvi che il trasporto della vostra <span style="font-weight: 600">${carTitle}</span> con <span style="font-weight: 600">(VIN: ${VIN})</span> è stato programmato con successo.`,
    },
  },
  de: {
    'Car Picked Up': {
      title: 'Transport Update',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Ihr <span style="font-weight: 600">${carTitle}</span> mit der folgenden VIN: <span style="font-weight: 600">${VIN}</span> wurde abgeholt und ist jetzt auf dem Weg zu Ihnen.`,
    },
    documentsSent: {
      title: 'Dokumente Versendet',
      message: (carTitle, VIN = '[VIN NUMBER]') =>
        `Die Dokumente für Ihren <span style="font-weight: 600">${carTitle}</span> mit der folgenden VIN: <span style="font-weight: 600">${VIN}</span> wurden per UPS Express versandt und sind auf dem Weg zu Ihnen.`,
    },
    ups: {
      message: () =>
        'Verwenden Sie diesen Tracking-Code, um Ihre Registrierungsdokument-Sendung bei UPS Express zu verfolgen.',
    },
    offerConfirmation: {
      title: 'Angebotsbestätigung',
      message: (carTitle) =>
        `Vielen Dank für die Übermittlung Ihres Angebots für den <span style="font-weight: 600">${carTitle}</span>.`,
    },
    transportBooked: {
      title: 'Transport Geplant',
      message: (carTitle, VIN) =>
        `Wir freuen uns, Ihnen mitteilen zu können, dass der Transport für Ihren <span style="font-weight: 600">${carTitle}</span> mit <span style="font-weight: 600">(VIN: ${VIN})</span> erfolgreich geplant wurde.`,
    },
  },
};

const deliveryStatusNotificationMap = {
  'Car Picked Up': {
    iconUrl: IMAGES.greenTransportIcon,
    iconSize: {
      width: 56,
      height: 56,
    },
  },
  documentsSent: {},
  ups: {
    iconUrl: IMAGES.upsIcon,
    iconSize: {
      width: 56,
      height: 56,
    },
  },
  offerConfirmation: {
    iconSize: {
      width: 32,
      height: 32,
    },
    iconUrl: IMAGES.offerConfirmationIcon,
  },
  transportBooked: {
    iconUrl: IMAGES.greenTransportIcon,
    iconSize: {
      width: 56,
      height: 56,
    },
  },
};

const notificationStyles = {
  red: {
    color: '#FB0000',
    backgroundColor: '#FEE2E2',
  },
  purple: {
    color: '#0004FB',
    backgroundColor: '#0004FB1A',
  },
  green: {
    color: '#60C961',
    backgroundColor: '#60C9611A',
  },
};

const notificationTranslations = {
  en: {
    declined: {
      title: 'Offer Rejected:',
      message: (price) =>
        `Thank you for your interest. Unfortunately, the seller did not accept this offer. The minimum sale price for the car is ${price}.`,
    },
    reserved: {
      title: 'Reservation Confirmed!',
    },
    delivered: {},
    'Car Picked Up': {},
    invoiceSent: {
      title: 'Important:',
      message:
        'We kindly ask that you review the invoice and complete the payment within 24 hours to ensure a smooth continuation of the process.',
    },
    purchased: {
      title: 'Important:',
      message:
        'We kindly ask that you review the invoice and complete the payment within 24 hours to ensure a smooth continuation of the process.',
    },
    confirmed: {
      title: 'Offer Confirmed!',
    },
  },
  nl: {
    declined: {
      title: 'Aanbod Afgewezen:',
      message: (price) =>
        `Bedankt voor uw interesse. Helaas heeft de verkoper dit aanbod niet geaccepteerd. De minimale verkoopprijs voor de auto is ${price}.`,
    },
    reserved: {
      title: 'Reservering Bevestigd!',
    },
    delivered: {},
    'Car Picked Up': {},
    invoiceSent: {
      title: 'Belangrijk:',
      message:
        'Wij verzoeken u vriendelijk de factuur te bekijken en de betaling binnen 24 uur te voltooien om een soepele voortzetting van het proces te garanderen.',
    },
    purchased: {
      title: 'Belangrijk:',
      message:
        'Wij verzoeken u vriendelijk de factuur te bekijken en de betaling binnen 24 uur te voltooien om een soepele voortzetting van het proces te garanderen.',
    },
    confirmed: {
      title: 'Aanbod Bevestigd!',
    },
  },
  fr: {
    declined: {
      title: 'Offre Refusée :',
      message: (price) =>
        `Merci de votre intérêt. Malheureusement, le vendeur n'a pas accepté cette offre. Le prix de vente minimum pour la voiture est de ${price}.`,
    },
    reserved: {
      title: 'Réservation Confirmée !',
    },
    delivered: {},
    'Car Picked Up': {},
    invoiceSent: {
      title: 'Important :',
      message:
        'Nous vous demandons de bien vouloir examiner la facture et effectuer le paiement dans les 24 heures pour assurer une continuation fluide du processus.',
    },
    purchased: {
      title: 'Important :',
      message:
        'Nous vous demandons de bien vouloir examiner la facture et effectuer le paiement dans les 24 heures pour assurer une continuation fluide du processus.',
    },
    confirmed: {
      title: 'Offre Confirmée !',
    },
  },
  it: {
    declined: {
      title: 'Offerta Rifiutata:',
      message: (price) =>
        `Grazie per il vostro interesse. Purtroppo, il venditore non ha accettato questa offerta. Il prezzo minimo di vendita per l'auto è ${price}.`,
    },
    reserved: {
      title: 'Prenotazione Confermata!',
    },
    delivered: {},
    'Car Picked Up': {},
    invoiceSent: {
      title: 'Importante:',
      message:
        'Vi chiediamo gentilmente di esaminare la fattura e completare il pagamento entro 24 ore per garantire una continuazione fluida del processo.',
    },
    purchased: {
      title: 'Importante:',
      message:
        'Vi chiediamo gentilmente di esaminare la fattura e completare il pagamento entro 24 ore per garantire una continuazione fluida del processo.',
    },
    confirmed: {
      title: 'Offerta Confermata!',
    },
  },
  de: {
    declined: {
      title: 'Angebot Abgelehnt:',
      message: (price) =>
        `Vielen Dank für Ihr Interesse. Leider hat der Verkäufer dieses Angebot nicht akzeptiert. Der Mindestverkaufspreis für das Auto beträgt ${price}.`,
    },
    reserved: {
      title: 'Reservierung Bestätigt!',
    },
    delivered: {},
    'Car Picked Up': {},
    invoiceSent: {
      title: 'Wichtig:',
      message:
        'Wir bitten Sie freundlich, die Rechnung zu prüfen und die Zahlung innerhalb von 24 Stunden abzuschließen, um einen reibungslosen Fortgang des Prozesses zu gewährleisten.',
    },
    purchased: {
      title: 'Wichtig:',
      message:
        'Wir bitten Sie freundlich, die Rechnung zu prüfen und die Zahlung innerhalb von 24 Stunden abzuschließen, um einen reibungslosen Fortgang des Prozesses zu gewährleisten.',
    },
    confirmed: {
      title: 'Angebot Bestätigt!',
    },
  },
};

const notificationVariations = {
  declined: {
    ...notificationStyles.red,
  },
  reserved: {
    ...notificationStyles.purple,
  },
  delivered: {
    ...notificationStyles.purple,
  },
  'Car Picked Up': {
    ...notificationStyles.green,
  },
  invoiceSent: {
    ...notificationStyles.purple,
  },
  purchased: {
    ...notificationStyles.purple,
  },
  confirmed: {
    ...notificationStyles.purple,
  },
};

module.exports = {
  IMAGES,
  notificationVariations,
  notificationTranslations,
  deliveryStatusNotificationMap,
  deliveryStatusTranslations,
};
