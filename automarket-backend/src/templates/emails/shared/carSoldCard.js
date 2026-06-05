const carSoldCardHeader = require('./carSoldCardHeader');
const carListingTranslations = require('./carListingTranslations');

const info = ({ icon, text }) => {
  return `
    <table border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-collapse: collapse; display: inline-block; border-radius: 0.625rem; background-color: #fff">
      <tr>
        <td style="padding: 7px 10px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr valign="middle">
              <td valign="middle" style="padding-right: 8px;">
                <img
                  src="${icon}"
                  alt="Info Icon"
                  width="12"
                  height="12"
                  style="display: block; border: 0;"
                />
              </td>
              <td valign="middle">
                <span style="font-size: 14px; line-height: 12px; white-space: nowrap;">
                  ${text}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

function formatEuro(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '€ 0';
  return `€ ${Math.round(num).toLocaleString()}`;
}

const carSoldCard = ({
  car,
  viewOfferLink = '#',
  icon,
  index,
  iconContainerBGColor,
  vatText,
  headerTitle,
  headerSubTitle,
  showOfferButton = false,
  language = 'en',
}) => {
  const { model, year, mileage, horsePower, gear, image, price } = car;
  const t = carListingTranslations[language] || carListingTranslations.en;

  return `
    ${carSoldCardHeader({
      icon,
      iconWidth: 10,
      iconHeight: 10,
      title: headerTitle,
      subTitle: headerSubTitle,
      subTitleColor: 'pink',
      index,
      iconContainerBGColor,
      headerSubTitle,
      hasNotification: !!car.demand,
      demand: car.demand,
    })}

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 21px;">
      <tr>
        <td align="left" width="30%" style="vertical-align: top;">
          <img
            src="${image || 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop'}"
            alt="Car Image"
            width="180"
            height="135"
            style="width: 180px; height: 135px; display: block; border-radius: 0.625rem; object-fit: cover;"
          />
        </td>

        <td width="24" style="font-size: 1px; line-height: 1px;">&nbsp;</td>

        <td width="70%" align="left" valign="top">
          <table border="0" cellpadding="8" cellspacing="0" width="100%">
            <tr>
              <td colspan="4" style="padding-bottom: 14px;">
                <p style="margin: 0; line-height: 1.2;">${model}</p>
              </td>
            </tr>
            <tr>
              <td>
                ${info({ icon: 'https://cdn.automarket.example.com/image/upload/v1754820293/calendar_rbm8g9.png', text: year })}
              </td>
              <td>
                ${info({ icon: 'https://cdn.automarket.example.com/image/upload/v1754826412/gauge_awtt1p.png', text: mileage || '0 km' })}
              </td>
              <td>
                ${info({ icon: 'https://cdn.automarket.example.com/image/upload/v1754826656/zap_1_lwukij.png', text: horsePower })}
              </td>
              <td>
                ${info({ icon: 'https://cdn.automarket.example.com/image/upload/v1754826833/settings_p126uy.png', text: gear })}
              </td>
            </tr>
            <tr>
              <td align="left" colspan="2" style="padding-top: 10px;">
                ${
                  showOfferButton
                    ? `<table border="0" cellpadding="7" cellspacing="0" style="border: 1px solid #d62b5a; background-color: #f83068; border-radius: 0.625rem; ">
                  <tr>
                    <td>
                      <img
                        src="https://cdn.automarket.example.com/image/upload/v1754827638/eye_cpb700.png"
                        alt="Eye Icon"
                        width="12"
                        height="12"
                        style="vertical-align: middle; display: block;"
                      />
                    </td>
                    <td>
                      <a href="${viewOfferLink}" style="color: #FFFFFF; font-weight: 500; font-size: 14px; text-decoration: none;">
                        ${t.viewOurOffer}
                      </a>
                    </td>
                    <td>
                      <img
                        src="https://cdn.automarket.example.com/image/upload/v1754827728/arrow-up-right_jedsx0.png"
                        alt="Arrow Up Right Icon"
                        width="18"
                        height="18"
                        style="vertical-align: middle; display: block;"
                      />
                    </td>
                  </tr>
                </table>`
                    : ''
                }
              </td>
              <td align="right" colspan="2">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: min-content;">
                  <tr>
                    <td
                      align="right"
                      bgcolor="#f9fafb"
                      style="
                        background-color: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 14px;
                      "
                    >
                      <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td
                            align="right"
                            style="
                              color: #6a7282;
                              font-size: 14px;
                              line-height: 1.2;
                              margin: 0;
                            "
                          >
                            <span style="white-space: nowrap;">${vatText}</span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            height="1"
                            style="font-size: 1px; line-height: 1px;"
                          >
                            &nbsp;
                          </td>
                        </tr>
                        <tr>
                          <td
                            align="right"
                            style="
                              color: #101828;
                              font-size: 14px;
                              line-height: 1.2;
                              margin: 0;
                            "
                          >
                            <span style="white-space: nowrap;">${formatEuro(price)}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

module.exports = carSoldCard;
