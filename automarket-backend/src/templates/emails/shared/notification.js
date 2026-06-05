const {
  notificationVariations,
  notificationTranslations,
} = require('./constants');

const notification = ({ variation, offerPrice, language = 'en' }) => {
  const { color, backgroundColor } = notificationVariations[variation] || {};
  const translations =
    notificationTranslations[language] || notificationTranslations.en;
  const notificationContent = translations[variation] || {};

  const title = notificationContent.title || '';
  const message = notificationContent.message
    ? typeof notificationContent.message === 'function'
      ? notificationContent.message(offerPrice)
      : notificationContent.message
    : '';

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 30px; border-radius: 6px; width: 100%; max-width: 680px; background-color: ${backgroundColor}; color: ${color};">
      ${
        title &&
        `<tr>
        <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${color}; padding: 16px 16px ${message ? '4px' : '16px'}; font-weight: 600;">
          ${title}
        </td>
      </tr>`
      }
      ${
        message &&
        `
          <tr>
          <td style="font-family: Arial, sans-serif; font-size: 12px; color: ${color};  padding: 0px 16px 16px ; font-weight: 500">
            <p style="margin: 0;">
              ${message}
            </p>
          </td>
        </tr>
        `
      }
    </table>
  `;
};

module.exports = notification;
