const AccountDetails = require('./shared/accountDetails');
const logoFooter = require('./shared/logoFooter');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Translations for welcome complete email
const translations = {
  en: {
    subject: 'Welcome to Car Sales Platform - Account Activated!',
    title: 'Account Activated - Welcome to Car Click',
    greetingPrefix: 'Dear',
    welcomeMessage:
      'Congratulations! Your account has been successfully activated.',
    accountActivated:
      'Your Car Click account is now fully active and ready to use.',
    accountDetails: 'Account Details',
    nextSteps: "What's Next?",
    loginInstructions:
      'You can now access your full dashboard and start listing your vehicles for sale.',
    supportMessage:
      'Our team is here to help you get the most out of your Car Click experience.',
    bestRegards: 'Best regards',
    teamSignature: 'Team Car Click',
  },
  nl: {
    subject: 'Welkom bij Car Sales Platform - Account Geactiveerd!',
    title: 'Account Geactiveerd - Welkom bij Car Click',
    greetingPrefix: 'Beste',
    welcomeMessage: 'Gefeliciteerd! Uw account is succesvol geactiveerd.',
    accountActivated:
      'Uw Car Click account is nu volledig actief en klaar voor gebruik.',
    accountDetails: 'Account Details',
    nextSteps: 'Wat is de volgende stap?',
    loginInstructions:
      'U kunt nu toegang krijgen tot uw volledige dashboard en uw voertuigen te koop aanbieden.',
    supportMessage:
      'Ons team staat klaar om u te helpen het meeste uit uw Car Click ervaring te halen.',
    bestRegards: 'Met vriendelijke groet',
    teamSignature: 'Team Car Click',
  },
  fr: {
    subject: 'Bienvenue sur Car Sales Platform - Compte Activé!',
    title: 'Compte Activé - Bienvenue chez Car Click',
    greetingPrefix: 'Cher',
    welcomeMessage: 'Félicitations ! Votre compte a été activé avec succès.',
    accountActivated:
      'Votre compte Car Click est maintenant entièrement actif et prêt à être utilisé.',
    accountDetails: 'Détails du Compte',
    nextSteps: 'Quelle est la suite ?',
    loginInstructions:
      'Vous pouvez maintenant accéder à votre tableau de bord complet et commencer à mettre vos véhicules en vente.',
    supportMessage:
      'Notre équipe est là pour vous aider à tirer le meilleur parti de votre expérience Car Click.',
    bestRegards: 'Cordialement',
    teamSignature: 'Équipe Car Click',
  },
  it: {
    subject: 'Benvenuto su Car Sales Platform - Account Attivato!',
    title: 'Account Attivato - Benvenuto in Car Click',
    greetingPrefix: 'Caro',
    welcomeMessage:
      'Congratulazioni! Il tuo account è stato attivato con successo.',
    accountActivated:
      "Il tuo account Car Click è ora completamente attivo e pronto per l'uso.",
    accountDetails: 'Dettagli Account',
    nextSteps: 'Quali sono i prossimi passi?',
    loginInstructions:
      'Ora puoi accedere al tuo cruscotto completo e iniziare a mettere in vendita i tuoi veicoli.',
    supportMessage:
      'Il nostro team è qui per aiutarti a ottenere il massimo dalla tua esperienza Car Click.',
    bestRegards: 'Cordiali saluti',
    teamSignature: 'Team Car Click',
  },
  de: {
    subject: 'Willkommen bei Car Sales Platform - Konto Aktiviert!',
    title: 'Konto Aktiviert - Willkommen bei Car Click',
    greetingPrefix: 'Lieber',
    welcomeMessage:
      'Herzlichen Glückwunsch! Ihr Konto wurde erfolgreich aktiviert.',
    accountActivated:
      'Ihr Car Click Konto ist nun vollständig aktiv und einsatzbereit.',
    accountDetails: 'Konto Details',
    nextSteps: 'Wie geht es weiter?',
    loginInstructions:
      'Sie können jetzt auf Ihr vollständiges Dashboard zugreifen und Ihre Fahrzeuge zum Verkauf anbieten.',
    supportMessage:
      'Unser Team steht bereit, Ihnen zu helfen, das Beste aus Ihrer Car Click Erfahrung zu machen.',
    bestRegards: 'Mit freundlichen Grüßen',
    teamSignature: 'Team Car Click',
  },
};

const welcomeCompleteEmailTemplate = ({
  dealerName,
  companyName,
  email,
  language = 'en',
}) => {
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
    <title>Counter Offer Received</title>
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

      /* Responsive Styles (limited, but helpful) */
      @media screen and (max-width: 600px) {
        .full-width-image {
          width: 100% !important;
        }

        .stack-column {
          display: block !important;
          width: 100% !important;
        }

        .stack-column-center {
          text-align: center !important;
        }

        .button-wrapper {
          width: 100% !important;
          text-align: center !important;
        }

        .button-wrapper a {
          width: 80% !important;
          display: block !important;
          margin: 10px auto !important;
        }
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
            <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C"
              >Welcome to Car Click!</strong
            >
            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              Registration Complete!
            </p>

            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              Your dealer account has been successfully activated.
            </p>

             <!-- Account Details Section -->
            ${AccountDetails({
        dealerName,
        companyName,
        email,
        variation: 'complete',
      })}

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #050B20;
              "
            >
              Get Started Now:
            </p>

            <ul style="padding: 0;">
              <li style="color: #050B20">Log in to your account with your registered email and password</li>
              <li style="color: #050B20">Browse available car listings and start bidding</li>
            </ul>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; margin-top: 30px;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" style="background-color: #20BFB6; border-radius: 128px;">
                    <tr>
                      <td style="padding: 15px 30px;">
                        <a href="https://automarket.example.com/login" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px; display: block;">
                          Login to Your Account
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>


            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
              "
            >
              Need Help Getting Started?
            </p>

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
              "
            >
              Our support team is here to help you make the most of our platform. Contact us if you have any questions.
            </p>

            <p
              style="
                font-size: 1rem;
                line-height: 1.5rem;
                color: #4F5A6899;
                margin: 0;
              "
            >
              Thank you for choosing Car Click!
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

module.exports = { welcomeCompleteEmailTemplate, languages };
