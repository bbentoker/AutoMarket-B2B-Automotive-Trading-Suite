const translations = {
  en: {
    questions: 'Have questions?',
    contact: 'Either respond to this email or contact the sender on',
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  },
  nl: {
    questions: 'Heeft u vragen?',
    contact: 'Beantwoord deze e-mail of neem contact op met de afzender via',
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  },
  fr: {
    questions: 'Vous avez des questions ?',
    contact: "Répondez à cet e-mail ou contactez l'expéditeur sur",
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  },
  it: {
    questions: 'Avete domande?',
    contact: 'Rispondete a questa email o contattate il mittente su',
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  },
  de: {
    questions: 'Haben Sie Fragen?',
    contact:
      'Antworten Sie auf diese E-Mail oder kontaktieren Sie den Absender unter',
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  },
};

const logoFooter = (language = 'en') => {
  // URL for the new combined footer background image
  const combinedFooterBgImageUrl =
    'https://cdn.automarket.example.com/image/upload/v1752950003/footer_hnee8a.jpg';

  // URL for the main footer logo to be placed above the background
  const mainFooterLogoUrl =
    'https://cdn.automarket.example.com/favicon-dark.png';

  return `
    <!-- Footer Section -->
    <tr>
      <td align="center" style="padding: 0;">
        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px;height:250px;">
          <v:fill type="frame" src="${combinedFooterBgImageUrl}" color="#e91e63" />
          <v:textbox inset="0,0,0,0">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="
          border-collapse: collapse;
          background-color: #e91e63; /* Fallback background color */
          background-image: url('${combinedFooterBgImageUrl}');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          height: 250px;
          max-width: 680px;
        ">
          <tr>
            <td style="
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 20px;
              color: #ffffff;
              text-align: left;
              padding: 30px 60px 0px 140px; /* Padding for the text content */
              vertical-align: top;
            ">
              <p style="margin: 0;">
                ${translations[language]?.questions || translations.en.questions}
              </p>
              <p style="margin: 5px 0 0 0;">
                ${translations[language]?.contact || translations.en.contact}
                <a
                  href="mailto:info@automarket.example.com"
                  style="color: #ffffff; text-decoration: underline;"
                >info@automarket.example.com</a>
              </p>
              <p style="margin: 20px 0 0 0;">
                ${translations[language]?.address || translations.en.address}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" valign="bottom">
              <img src="${mainFooterLogoUrl}" alt="Car Click Logo" style="display: block; border: 0; max-width: 200px; height: auto; width: auto;" />
            </td>
          </tr>
        </table>
        <!--[if gte mso 9]>
          </v:textbox>
        </v:rect>
        <![endif]-->
      </td>
    </tr>
  `;
};

module.exports = logoFooter;
