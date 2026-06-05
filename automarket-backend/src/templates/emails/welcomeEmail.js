const logoFooter = require('./shared/logoFooter');
const AccountDetails = require('./shared/accountDetails');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Translations for welcome email
const translations = {
  en: {
    subject: 'Welcome to Car Sales Platform!',
    title: 'Welcome to Car Click',
    greetingPrefix: 'Dear',
    welcomeMessage: 'Welcome to Car Click! We are excited to have you on board.',
    accountCreated: 'Your account has been successfully created.',
    accountDetails: 'Account Details',
    nextSteps: 'Next Steps',
    loginInstructions:
      'You can now log in to your dashboard to start managing your vehicle listings.',
    supportMessage:
      'If you have any questions, please do not hesitate to contact our support team.',
    bestRegards: 'Best regards',
    teamSignature: 'Team Car Click',
    scrapedDealerPassword:
      'Your temporary password is your first name followed by "123" (e.g., if your name is John, your password is John123). Please change this password after your first login for security purposes.',
  },
  nl: {
    subject: 'Welkom bij Car Sales Platform!',
    title: 'Welkom bij Car Click',
    greetingPrefix: 'Beste',
    welcomeMessage: 'Welkom bij Car Click! We zijn blij u aan boord te hebben.',
    accountCreated: 'Uw account is succesvol aangemaakt.',
    accountDetails: 'Account Details',
    nextSteps: 'Volgende Stappen',
    loginInstructions:
      'U kunt nu inloggen op uw dashboard om uw voertuigadvertenties te beheren.',
    supportMessage:
      'Heeft u vragen, neem dan gerust contact op met ons supportteam.',
    bestRegards: 'Met vriendelijke groet',
    teamSignature: 'Team Car Click',
    scrapedDealerPassword:
      'Uw tijdelijke wachtwoord is uw voornaam gevolgd door "123" (bijv. als uw naam John is, is uw wachtwoord John123). Wijzig dit wachtwoord na uw eerste inloggen voor de veiligheid.',
  },
  fr: {
    subject: 'Bienvenue sur Car Sales Platform!',
    title: 'Bienvenue chez Car Click',
    greetingPrefix: 'Cher',
    welcomeMessage:
      'Bienvenue chez Car Click ! Nous sommes ravis de vous avoir à bord.',
    accountCreated: 'Votre compte a été créé avec succès.',
    accountDetails: 'Détails du Compte',
    nextSteps: 'Prochaines Étapes',
    loginInstructions:
      'Vous pouvez maintenant vous connecter à votre tableau de bord pour commencer à gérer vos annonces de véhicules.',
    supportMessage:
      "Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.",
    bestRegards: 'Cordialement',
    teamSignature: 'Équipe Car Click',
    scrapedDealerPassword:
      'Votre mot de passe temporaire est votre prénom suivi de "123" (ex. si votre nom est John, votre mot de passe est John123). Veuillez changer ce mot de passe après votre première connexion pour des raisons de sécurité.',
  },
  it: {
    subject: 'Benvenuto su Car Sales Platform!',
    title: 'Benvenuto in Car Click',
    greetingPrefix: 'Caro',
    welcomeMessage:
      'Benvenuto in Car Click! Siamo entusiasti di averti a bordo.',
    accountCreated: 'Il tuo account è stato creato con successo.',
    accountDetails: 'Dettagli Account',
    nextSteps: 'Prossimi Passi',
    loginInstructions:
      'Ora puoi accedere al tuo cruscotto per iniziare a gestire i tuoi annunci di veicoli.',
    supportMessage:
      'Se hai domande, non esitare a contattare il nostro team di supporto.',
    bestRegards: 'Cordiali saluti',
    teamSignature: 'Team Car Click',
    scrapedDealerPassword:
      'La tua password temporanea è il tuo nome seguito da "123" (ad es. se il tuo nome è John, la tua password è John123). Si prega di cambiare questa password dopo il primo accesso per motivi di sicurezza.',
  },
  de: {
    subject: 'Willkommen bei Car Sales Platform!',
    title: 'Willkommen bei Car Click',
    greetingPrefix: 'Lieber',
    welcomeMessage:
      'Willkommen bei Car Click! Wir freuen uns, Sie an Bord zu haben.',
    accountCreated: 'Ihr Konto wurde erfolgreich erstellt.',
    accountDetails: 'Konto Details',
    nextSteps: 'Nächste Schritte',
    loginInstructions:
      'Sie können sich jetzt in Ihr Dashboard einloggen, um Ihre Fahrzeuganzeigen zu verwalten.',
    supportMessage:
      'Bei Fragen zögern Sie nicht, unser Support-Team zu kontaktieren.',
    bestRegards: 'Mit freundlichen Grüßen',
    teamSignature: 'Team Car Click',
    scrapedDealerPassword:
      'Ihr temporäres Passwort ist Ihr Vorname gefolgt von "123" (z.B. wenn Ihr Name John ist, ist Ihr Passwort John123). Bitte ändern Sie dieses Passwort nach Ihrer ersten Anmeldung aus Sicherheitsgründen.',
  },
};

const welcomeEmailTemplate = ({
  dealerName,
  companyName,
  email,
  language = 'en',
  isScrapedDealer = false,
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
    <title>${t.subject}</title>
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
              >${t.title}</strong
            >
            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              ${t.greetingPrefix} ${dealerName},
            </p>
            <p
              style="
                margin: 10px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              ${t.welcomeMessage}
            </p>

            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
              "
            >
              Your dealer account has been created successfully.
            </p>

            ${isScrapedDealer
          ? `
            <p
              style="
                margin: 20px 0 0 0;
                font-size: 16px;
                line-height: 24px;
                color: #4f5a6899;
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
              "
            >
              <strong>Login Information:</strong><br/>
              ${t.scrapedDealerPassword}
            </p>
            `
          : ''
        }

             <!-- Account Details Section -->
            ${AccountDetails({
          dealerName,
          companyName,
          email,
          variation: 'pending',
        })}

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #050B20;
              "
            >
              What's Next?
            </p>

            <ul style="padding: 0;">
              <li style="color: #050B20">Wait for account approval (usually within 24-48 hours)</li>
              <li style="color: #050B20">Start browsing and bidding on available cars</li>
            </ul>

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
              "
            >
              Need Help?
            </p>

            <p
              style="
                font-size: 16px;
                line-height: 24px;
                margin-top: 24px;
                color: #4F5A6899;
              "
            >
              Our support team is here to help you get started. Contact us if you have any questions.
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
                margin-top: 20px;
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

module.exports = { welcomeEmailTemplate, languages };
