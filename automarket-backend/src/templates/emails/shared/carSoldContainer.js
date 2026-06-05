const carSoldCard = require('./carSoldCard');
const carListingTranslations = require('./carListingTranslations');

const demandTitleMapping = {
  high: 'highDemand',
  veryHigh: 'veryHighDemand',
};

const carSoldContainer = ({
  car,
  index,
  language = 'en',
  loginCode = null,
  weeklyReportEmailId = null,
}) => {
  const t = carListingTranslations[language] || carListingTranslations.en;
  const demandKey = demandTitleMapping[car.demand] || 'highDemand';
  const soldCarHeaderSubTitle = `${t[demandKey]} ${t.soldQuickly}`;

  return `
    <tr>
      <td>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 10px; border: 1px solid #e5e7eb7c;">
          <tr>
            <td style="border-radius: 10px; padding: 21px;">
              ${carSoldCard({
                car,
                index,
                vatText:
                  car?.vatStatus === 'Excl. VAT'
                    ? t.advertisedPriceExclVat
                    : t.advertisedPriceInclVat,
                headerTitle: `${t.soldIn} ${car.soldIn} ${car.soldIn === 1 ? t.day : t.days}`,
                headerSubTitle: soldCarHeaderSubTitle,
                doesHeaderHaveNotification: true,
                language,
              })}
            </td>
          </tr>


          <tr>
            <td align="center" style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
              <table border="0" cellpadding="0" cellspacing="8" width="100%">
                <tr>
                  <td align="left" width="50%" style="padding-right: 8px;">
                    <p style="margin: 0; color: #e60076; font-size: 14px; border: 1px solid #fccee8; border-radius: 999px; padding: 4px 12px; width: fit-content;">${t.basedOnSuccessfulSale}</p>
                  </td>
                  <td align="center" width="30">
                    <table border="0" cellpadding="0" cellspacing="0" width="24" height="24" style="background-color: #fff;border-collapse: separate; border: 1px solid #e60076; border-radius: 50%;">
                      <tr>
                        <td align="center" valign="middle">
                          <img src="https://cdn.automarket.example.com/image/upload/v1754835636/arrow-down_pzbfi7.png" width="12" height="12" style="display: block; border: 0;">
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" width="50%" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 21px; background-color: #ffe4e6;">
              ${carSoldCard({
                car: car.offerCar,
                icon: 'https://cdn.automarket.example.com/image/upload/v1754843574/target_l6xnbq.png',
                iconContainerBGColor: 'red',
                vatText:
                  car.offerCar?.vatStatus === 'Excl. VAT'
                    ? t.priceExclVat
                    : t.priceInclVat,
                headerTitle: t.yourCarSoldQuickly,
                headerSubTitle: t.similarCarSourced,
                showOfferButton: true,
                viewOfferLink:
                  car.offerCar && car.offerCar.id
                    ? `https://browse.automarket.example.com/listings/${car.offerCar.id}${loginCode || weeklyReportEmailId ? '?' : ''}${loginCode ? `login-code=${loginCode}` : ''}${loginCode && weeklyReportEmailId ? '&' : ''}${weeklyReportEmailId ? `weekly-report-email-id=${weeklyReportEmailId}` : ''}`
                    : '#',
                language,
              })}
            </td>
          </tr>

          <tr>
            <td height="21" style="font-size: 1px; line-height: 1px; background-color: #ffffff; border-bottom-left-radius: 10px; bottom-right-radius: 10px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

module.exports = carSoldContainer;
