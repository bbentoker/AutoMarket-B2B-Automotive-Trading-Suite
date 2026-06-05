const logoFooter = require('../shared/logoFooter');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const newTemplateTemplate = (data, language = 'en') => {
  // Extract data with defaults
  const {
    userName = 'User',
    dealerName = 'Dealer',
    listingDetails = {},
    customMessage = '',
    actionUrl = '#',
  } = data;

  const {
    make = 'Car',
    model = 'Model',
    year = '2023',
    price = '0',
    mileage = '0',
  } = listingDetails;

  const templates = {
    en: {
      subject: `Important Update - ${make} ${model}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🚗 Car Sales Platform</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049); margin: 15px auto;"></div>
            </div>

            <!-- Main Content -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">Hello ${userName}!</h2>
              <p style="margin: 0 0 20px 0; color: #555; font-size: 16px; line-height: 1.6;">
                We have an important update regarding your ${make} ${model} listing.
              </p>
              
              ${
                customMessage
                  ? `
                <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196F3; margin: 20px 0;">
                  <p style="margin: 0; color: #1565C0; font-size: 16px;">${customMessage}</p>
                </div>
              `
                  : ''
              }
            </div>

            <!-- Car Details Card -->
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin: 25px 0;">
              <div style="background: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                <h3 style="margin: 0; color: #2c3e50; font-size: 18px;">Vehicle Details</h3>
              </div>
              <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555; width: 30%;">Make & Model:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${make} ${model}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Year:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${year}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Price:</td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">€${price.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Mileage:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${mileage.toLocaleString()} km</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                View Details
              </a>
            </div>

            <!-- Contact Info -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Need Help?</h3>
              <p style="margin: 0; color: #555; line-height: 1.6;">
                Contact our support team or your dealer <strong>${dealerName}</strong> for any questions.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Best regards,<br>
                <strong style="color: #2c3e50;">Car Sales Platform Team</strong>
              </p>
            </div>
          </div>
          
          <!-- Legal Footer -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              This email was sent regarding your vehicle listing. 
              If you have any questions, please contact support.
            </p>
          </div>
          
          
        </div>
      `,
    },

    nl: {
      subject: `Belangrijke Update - ${make} ${model}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🚗 Car Sales Platform</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049); margin: 15px auto;"></div>
            </div>

            <!-- Main Content -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">Hallo ${userName}!</h2>
              <p style="margin: 0 0 20px 0; color: #555; font-size: 16px; line-height: 1.6;">
                We hebben een belangrijke update betreffende uw ${make} ${model} advertentie.
              </p>
              
              ${
                customMessage
                  ? `
                <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196F3; margin: 20px 0;">
                  <p style="margin: 0; color: #1565C0; font-size: 16px;">${customMessage}</p>
                </div>
              `
                  : ''
              }
            </div>

            <!-- Car Details Card -->
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin: 25px 0;">
              <div style="background: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                <h3 style="margin: 0; color: #2c3e50; font-size: 18px;">Voertuig Details</h3>
              </div>
              <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555; width: 30%;">Merk & Model:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${make} ${model}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Jaar:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${year}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Prijs:</td>
                    <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">€${price.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Kilometerstand:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">${mileage.toLocaleString()} km</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Bekijk Details
              </a>
            </div>

            <!-- Contact Info -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px;">Hulp Nodig?</h3>
              <p style="margin: 0; color: #555; line-height: 1.6;">
                Neem contact op met ons support team of uw dealer <strong>${dealerName}</strong> voor vragen.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Met vriendelijke groet,<br>
                <strong style="color: #2c3e50;">Car Sales Platform Team</strong>
              </p>
            </div>
          </div>
          
          
        </div>
      `,
    },

    // Add other languages...
    fr: {
      subject: `Mise à jour importante - ${make} ${model}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <!-- French version similar structure -->
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🚗 Car Sales Platform</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049); margin: 15px auto;"></div>
            </div>
            <h2 style="color: #2c3e50;">Bonjour ${userName}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Nous avons une mise à jour importante concernant votre annonce ${make} ${model}.
            </p>
            ${customMessage ? `<p style="background: #e3f2fd; padding: 15px; border-radius: 6px;">${customMessage}</p>` : ''}
            
          </div>
        </div>
      `,
    },

    it: {
      subject: `Aggiornamento importante - ${make} ${model}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <!-- Italian version similar structure -->
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🚗 Car Sales Platform</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049); margin: 15px auto;"></div>
            </div>
            <h2 style="color: #2c3e50;">Ciao ${userName}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Abbiamo un importante aggiornamento riguardo il tuo annuncio ${make} ${model}.
            </p>
            ${customMessage ? `<p style="background: #e3f2fd; padding: 15px; border-radius: 6px;">${customMessage}</p>` : ''}
            
          </div>
        </div>
      `,
    },

    de: {
      subject: `Wichtiges Update - ${make} ${model}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <!-- German version similar structure -->
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🚗 Car Sales Platform</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049); margin: 15px auto;"></div>
            </div>
            <h2 style="color: #2c3e50;">Hallo ${userName}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Wir haben ein wichtiges Update zu Ihrer ${make} ${model} Anzeige.
            </p>
            ${customMessage ? `<p style="background: #e3f2fd; padding: 15px; border-radius: 6px;">${customMessage}</p>` : ''}
            
          </div>
        </div>
      `,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { newTemplateTemplate, languages };
