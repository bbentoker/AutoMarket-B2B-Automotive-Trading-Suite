const {
  deliveryStatusNotificationMap,
  deliveryStatusTranslations,
} = require('./constants');

const deliveryStatusNotification = ({
  carTitle,
  VIN,
  variation,
  trackingNumber,
  language = 'en',
}) => {
  const translations =
    deliveryStatusTranslations[language] || deliveryStatusTranslations.en;
  const notificationContent = translations[variation] || {};
  const { iconUrl, iconSize: { width = 32, height = 32 } = {} } =
    deliveryStatusNotificationMap[variation] || {};

  const isUps = variation === 'ups';

  const doesIconUrlExist = Boolean(iconUrl);

  console.log(
    '>>>doesIconUrlExist',
    doesIconUrlExist,
    '  variation:',
    variation
  );

  return `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #FFFFFF; border-radius: 16px; margin-top: 30px;"
    >
      <tr>
        ${
          doesIconUrlExist
            ? `<td align="center" style="width: ${width + 32}px; padding: 16px 0;">
           <img
              src=${iconUrl}
              alt="Arrow Icon"
              width="${width}"
              height="${height}"
              style="display: block; border: 0"
            />
        </td>`
            : ''
        }
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="left" style="padding: ${!doesIconUrlExist ? '0 12px' : '0 0'}">
              <p style="color: #050B20; font-size: 14px; font-weight: 500;line-height: 24px; margin: ${!isUps ? '12px' : '0'} 0 0 0">${notificationContent.title || trackingNumber}</p>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding: ${!doesIconUrlExist ? '12px' : '0'}">
              <p style="color: #050B2088; font-size: 12px; margin: 0 0 16px 0; font-weight: 500">
                ${notificationContent.message ? (typeof notificationContent.message === 'function' ? notificationContent.message(carTitle, VIN) : notificationContent.message) : ''}
              </p>
            </td>
          </tr>
        </table>
      </tr>
    </table>
  `;
};

module.exports = deliveryStatusNotification;
