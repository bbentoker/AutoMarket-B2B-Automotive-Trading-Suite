const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const paymentSentTemplate = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'Payment Sent - Transaction Complete',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    nl: {
      subject: 'Betaling verzonden - Transactie voltooid',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    fr: {
      subject: 'Paiement envoyé - Transaction terminée',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    it: {
      subject: 'Pagamento inviato - Transazione completata',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    de: {
      subject: 'Zahlung gesendet - Transaktion abgeschlossen',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { paymentSentTemplate, languages };
