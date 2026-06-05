const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const carsForSaleTemplate = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'Cars for Sale - Notification',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    nl: {
      subject: "Auto's te koop - Melding",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    fr: {
      subject: 'Voitures à vendre - Notification',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    it: {
      subject: 'Auto in vendita - Notifica',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    de: {
      subject: 'Autos zum Verkauf - Benachrichtigung',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { carsForSaleTemplate, languages };
