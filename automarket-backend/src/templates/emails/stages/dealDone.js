const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const dealDoneTemplate = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'Deal Completed - Congratulations!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    nl: {
      subject: 'Deal afgerond - Gefeliciteerd!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    fr: {
      subject: 'Affaire conclue - Félicitations!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    it: {
      subject: 'Affare concluso - Congratulazioni!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
    de: {
      subject: 'Deal abgeschlossen - Herzlichen Glückwunsch!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Template content will be filled here -->
        </div>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { dealDoneTemplate, languages };
