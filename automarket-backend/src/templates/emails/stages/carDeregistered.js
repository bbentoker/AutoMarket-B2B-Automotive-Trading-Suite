const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const carDeregisteredTemplate = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'Car De-registered - Process Update',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    nl: {
      subject: 'Auto uitgeschreven - Proces update',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    fr: {
      subject: 'Voiture désenregistrée - Mise à jour du processus',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    it: {
      subject: 'Auto cancellata - Aggiornamento processo',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    de: {
      subject: 'Auto abgemeldet - Prozess-Update',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { carDeregisteredTemplate, languages };
