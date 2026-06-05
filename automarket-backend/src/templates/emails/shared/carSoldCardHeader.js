const subTitleColorMap = {
  gray: '#050B2088',
  pink: '#e60076',
};

const iconContainerBGColorMap = {
  default: '#314158',
  red: '#f83068',
};

const demandMapping = {
  veryHigh: {
    icon: 'https://cdn.automarket.example.com/image/upload/v1754812256/zap_v3eb31.png',
    iconSizes: {
      width: 10,
      height: 10,
    },
    text: 'Very High Demand',
    iconBGColor: '#fdf2f8',
    iconTextColor: '#c6005c',
  },
  high: {
    icon: 'https://cdn.automarket.example.com/image/upload/v1754847058/chart-column_1_s2b8ob.png',
    iconSizes: {
      width: 10,
      height: 10,
    },
    text: 'High Demand',
    iconBGColor: '#dbeafe',
    iconTextColor: '#193cb8',
  },
};

const carSoldCardHeader = ({
  icon,
  iconWidth = 24,
  iconHeight = 24,
  title,
  subTitle,
  hasNotification = false,
  subTitleColor = 'gray',
  index = 0,
  iconContainerBGColor,
  demand,
}) => {
  const subTitleColorValue =
    subTitleColorMap[subTitleColor] || subTitleColorMap.gray;

  const {
    icon: notificationIcon,
    text: notificationText,
    iconBGColor,
    iconTextColor,
  } = demandMapping[demand] || {};

  const iconContext = icon
    ? `<img
          src="${icon}"
          alt="Arrow Icon"
          width="${iconWidth}"
          height="${iconHeight}"
          style="display: block; border: 0;"
        />`
    : `<p style="font-size: 14px; font-weight: bold; line-height: 14px; color: #fff; margin: 0;">${index}</p>`;

  const iconContainerBGColorValue =
    iconContainerBGColorMap[iconContainerBGColor] ||
    iconContainerBGColorMap.default;

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td width="${iconWidth + 18}" style="padding-right: 16px; vertical-align: top;">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            height="${iconHeight + 18}"
            width="${iconWidth + 18}"
            style="background-color: ${iconContainerBGColorValue}; border-radius: 10px;"
          >
            <tr>
              <td align="center" valign="middle" style="font-size: 18px;">
                ${iconContext}
              </td>
            </tr>
          </table>
        </td>

        <td style="vertical-align: top;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="left" style="padding-bottom: 4px;">
                <p style="font-size: 1rem; font-weight: 600; margin: 0; color: #050B20;">
                  ${title}
                </p>
              </td>
            </tr>
            <tr>
              <td align="left">
                <p style="color: ${subTitleColorValue}; font-size: 0.875rem; margin: 0; font-weight: 500;">
                  ${subTitle}
                </p>
              </td>
            </tr>
          </table>
        </td>

        ${
          hasNotification
            ? `<td align="right" style="vertical-align: top;">
                <table
                  border="0"
                  cellpadding="4"
                  cellspacing="0"
                  style="background-color: ${iconBGColor}; border-radius: 0.5rem;"
                >
                  <tr>
                    <td align="center" style="padding-left: 10px;">
                      <img
                        src="${notificationIcon}"
                        alt="Sparkles Icon"
                        width="10"
                        height="10"
                        style="display: block; border: 0;"
                      />
                    </td>
                    <td style="color: ${iconTextColor}; padding-right: 10px;">
                      <span style="font-size: 0.875rem; font-weight: 500;">${notificationText}</span>
                    </td>
                  </tr>
                </table>
              </td>`
            : `<td style="vertical-align: top;"></td>`
        }
      </tr>
    </table>
  `;
};

module.exports = carSoldCardHeader;
