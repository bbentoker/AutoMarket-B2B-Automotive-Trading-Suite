const logoFooter = require('./shared/logoFooter');
const { IMAGES } = require('./shared/constants');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

/**
 * Clean Car Click email template based on the reserved template structure
 * @param {Object} data - Template data
 * @param {string} language - Language code (en, nl, fr, it, de)
 * @param {string} subject - Email subject
 * @param {string} greeting - Greeting text (e.g., "Hi John,")
 * @param {string} mainContent - Main email content (HTML)
 * @param {string} ctaButton - Call-to-action button HTML (optional)
 * @param {string} closingText - Closing text before signature
 * @returns {Object} Template with subject and body
 */
const autoMarketCleanTemplate = (
  data,
  language = 'en',
  subject,
  greeting,
  mainContent,
  ctaButton = '',
  closingText = ''
) => {
  const templates = {
    en: {
      subject: subject,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
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
                      src="${IMAGES.headerLogo}"
                      alt="Car Click Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td
                    align="right"
                    valign="middle"
                  >
                    <img
                      src="${IMAGES.headerRedLine}"
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
          
          <!-- Main Content Section -->
          <tr>
            <td
              style="
                padding: 40px 60px;
                font-family: Arial, sans-serif;
                color: #1A202C;
                background-color: #f2f2f7;
              "
            >
              <!-- Greeting -->
              <div style="text-align: center; margin-bottom: 20px;">
                <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C; display: block;">
                  ${greeting}
                </strong>
              </div>

              <!-- Main Content -->
              <div style="margin-top: 24px;">
                ${mainContent}
              </div>

              <!-- Call-to-Action Button (if provided) -->
              ${ctaButton}

              <!-- Closing Text -->
              ${
                closingText
                  ? `
              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              ">
                ${closingText}
              </p>
              `
                  : ''
              }

              <!-- Signature -->
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Best Regards,
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Team Car Click
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center">
              ${logoFooter(language)}
            </td>
          </tr>
        </table>
      </center>
    </body>`,
    },
    nl: {
      subject: subject,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td align="left" valign="middle">
                    <img
                      src="${IMAGES.headerLogo}"
                      alt="Car Click Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td align="right" valign="middle">
                    <img
                      src="${IMAGES.headerRedLine}"
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
                padding: 40px 60px;
                font-family: Arial, sans-serif;
                color: #1A202C;
                background-color: #f2f2f7;
              "
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C; display: block;">
                  ${greeting}
                </strong>
              </div>

              <div style="margin-top: 24px;">
                ${mainContent}
              </div>

              ${ctaButton}

              ${
                closingText
                  ? `
              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              ">
                ${closingText}
              </p>
              `
                  : ''
              }

              <div style="margin-top: 32px;">
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Met vriendelijke groet,
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Team Car Click
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              ${logoFooter(language)}
            </td>
          </tr>
        </table>
      </center>
    </body>`,
    },
    fr: {
      subject: subject,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td align="left" valign="middle">
                    <img
                      src="${IMAGES.headerLogo}"
                      alt="Car Click Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td align="right" valign="middle">
                    <img
                      src="${IMAGES.headerRedLine}"
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
                padding: 40px 60px;
                font-family: Arial, sans-serif;
                color: #1A202C;
                background-color: #f2f2f7;
              "
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C; display: block;">
                  ${greeting}
                </strong>
              </div>

              <div style="margin-top: 24px;">
                ${mainContent}
              </div>

              ${ctaButton}

              ${
                closingText
                  ? `
              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              ">
                ${closingText}
              </p>
              `
                  : ''
              }

              <div style="margin-top: 32px;">
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Meilleures salutations,
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Team Car Click
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              ${logoFooter(language)}
            </td>
          </tr>
        </table>
      </center>
    </body>`,
    },
    it: {
      subject: subject,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td align="left" valign="middle">
                    <img
                      src="${IMAGES.headerLogo}"
                      alt="Car Click Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td align="right" valign="middle">
                    <img
                      src="${IMAGES.headerRedLine}"
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
                padding: 40px 60px;
                font-family: Arial, sans-serif;
                color: #1A202C;
                background-color: #f2f2f7;
              "
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C; display: block;">
                  ${greeting}
                </strong>
              </div>

              <div style="margin-top: 24px;">
                ${mainContent}
              </div>

              ${ctaButton}

              ${
                closingText
                  ? `
              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              ">
                ${closingText}
              </p>
              `
                  : ''
              }

              <div style="margin-top: 32px;">
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Cordiali Saluti,
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Team Car Click
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              ${logoFooter(language)}
            </td>
          </tr>
        </table>
      </center>
    </body>`,
    },
    de: {
      subject: subject,
      body: `<body style="margin: 0; padding: 0; background-color: #f4f4f4">
      <center style="width: 100%; background-color: #f4f4f4">
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tr>
                  <td align="left" valign="middle">
                    <img
                      src="${IMAGES.headerLogo}"
                      alt="Car Click Logo"
                      width="180"
                      style="display: block; border: 0; height: auto;"
                    />
                  </td>
                  <td align="right" valign="middle">
                    <img
                      src="${IMAGES.headerRedLine}"
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
                padding: 40px 60px;
                font-family: Arial, sans-serif;
                color: #1A202C;
                background-color: #f2f2f7;
              "
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <strong style="margin: 0; font-size: 24px; line-height: 36px; color: #1A202C; display: block;">
                  ${greeting}
                </strong>
              </div>

              <div style="margin-top: 24px;">
                ${mainContent}
              </div>

              ${ctaButton}

              ${
                closingText
                  ? `
              <p style="
                font-size: 16px;
                line-height: 24px;
                color: #4F5A6899;
                margin-top: 24px;
              ">
                ${closingText}
              </p>
              `
                  : ''
              }

              <div style="margin-top: 32px;">
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Mit freundlichen Grüßen,
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4F5A6899;">
                  Team Car Click
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              ${logoFooter(language)}
            </td>
          </tr>
        </table>
      </center>
    </body>`,
    },
  };

  return templates[language] || templates.en;
};

module.exports = { autoMarketCleanTemplate, languages };
