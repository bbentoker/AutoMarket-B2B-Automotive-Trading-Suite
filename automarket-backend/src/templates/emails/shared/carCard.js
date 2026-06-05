// import IMAGES from './constants';
const { IMAGES, notificationVariations } = require('./constants');

const { kmIcon, fuelIcon, transmissionIcon } = IMAGES;

const carCard = ({
  title,
  subTitle,
  imageUrl,
  mileage,
  fuelType,
  transmission,
  offerPrice,
  hasNotification = false,
  variation,
  hasDetailsButton = false,
  hideYourOfferText = false,
  loginCode = null,
}) => {
  const { color, backgroundColor } = notificationVariations[variation] || {};

  return `
          <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="
                border-collapse: collapse;
                margin-top: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 16px;
                overflow: hidden;
              "
            >
              <tr>
                <td style="padding: 0; max-width: 560px">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="border-collapse: collapse; background-color: #fff"
                  >
                    <tr>
                      <!-- Vehicle Image -->
                      <td
                        valign="top"
                        width="40%"
                        style="
                          padding: 0;
                          font-size: 0;
                          line-height: 0;
                          height: 180px;
                          overflow: hidden;
                        "
                      >
                        <img
                          src=${imageUrl || IMAGES.defaultCarImage}
                          alt="${title || 'Car image'}"
                          width="100%"
                          style="
                            display: block;
                            width: 100%;
                            height: 180px;
                            object-fit: cover;
                            font-family: sans-serif;
                            font-size: 15px;
                            line-height: 1.3;
                            color: #555555;
                            border: 0;
                            max-width: 100%;
                          "
                        />
                      </td>
                      <!-- Vehicle Details -->
                      <td
                        class="stack-column"
                        width="60%"
                        valign="top"
                        style="
                          padding: 15px 15px 15px 20px;
                          font-family: Arial, sans-serif;
                          font-size: 14px;
                          line-height: 20px;
                          color: #333333;
                        "
                      >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                          <tr>
                            <td valign="top" style="padding: 0; width: auto; ">
                              <p
                                style="
                                  margin: 0;
                                  font-size: 16px;
                                  line-height: 16px;
                                  color: #050b20;
                                  display: inline-block;
                                  max-width: 320px;
                                "
                              >
                                ${title || 'Car Details'}
                              </p>
                            </td>
                            ${
                              hasNotification
                                ? `<td
                                    class="notification-column"
                              align="right"
                                    valign="top"
                                    style="padding: 0; white-space: nowrap;"
                            >
                              <p
                                style="
                                  margin: 0;
                                  font-size: 9px;
                                  line-height: 16px;
                                  color: ${color};
                                  background-color: ${backgroundColor};
                                  border-radius: 999px;
                                        padding: 2px 12px;
                                  text-align: center;
                                        display: inline-block;
                                        vertical-align: top;
                                "
                              >
                                ${variation.charAt(0).toUpperCase() + variation.slice(1)}
                              </p>
                            </td>`
                                : ''
                            }
                          </tr>
                        </table>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0;">
                              <p
                                style="
                                  margin: 5px 0 15px 0;
                                  font-size: 12px;
                                  line-height: 16px;
                                  opacity: 50%;
                                  color: #050b20;
                                "
                              >
                                ${subTitle}
                              </p>
                            </td>
                          </tr>
                        </table>
                      <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            border-collapse: collapse;
                            border-top: 1px solid #e0e0e0; /* Apply border here */
                            border-bottom: 1px solid #e0e0e0; /* Apply border here */
                          "
                        >
                          <tr>
                            <td align="center">
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                align="center"
                                style="border-collapse: collapse"
                              >
                                <tr>
                                  <td>
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      style="
                                        border-collapse: collapse;
                                        width: 100%;
                                      "
                                      id="svg-list"
                                    >
                                      <tr>
                                        <td
                                          width="33.33%"
                                          align="left"
                                          style="
                                            padding: 10px 20px 5px 0;
                                            text-align: center;
                                          "
                                        >
                                          <img
                                            src="${kmIcon}"
                                            alt="Mileage"
                                            style="
                                              width: 16px;
                                              height: 16px;
                                              display: block;
                                              margin: 0 auto;
                                            "
                                          />
                                          <p
                                            style="
                                              font-size: 9px;
                                              line-height: 16px;
                                              color: #90a3bf;
                                              margin: 0;
                                              text-align: center;
                                            "
                                          >
                                            ${mileage}
                                          </p>
                                        </td>
                                        <td
                                          width="33.33%"
                                          align="center"
                                          style="
                                            padding-bottom: 5px;
                                            padding-top: 10px;
                                            text-align: center;
                                          "
                                        >
                                          <img
                                            src="${fuelIcon}"
                                            alt="Fuel Type"
                                            style="
                                              width: 16px;
                                              height: 16px;
                                              display: block;
                                              margin: 0 auto;
                                            "
                                          />
                                          <p
                                            style="
                                              font-size: 9px;
                                              line-height: 16px;
                                              color: #90a3bf;
                                              margin: 0;
                                              text-align: center;
                                            "
                                          >
                                            ${fuelType}
                                          </p>
                                        </td>
                                        <td
                                          width="33.33%"
                                          align="right"
                                          style="
                                            padding: 10px 0 5px 20px;
                                            text-align: center;
                                          "
                                        >
                                          <img
                                            src="${transmissionIcon}"
                                            alt="Transmission"
                                            style="
                                              width: 16px;
                                              height: 16px;
                                              display: block;
                                              margin: 0 auto;
                                            "
                                          />
                                          <p
                                            style="
                                              font-size: 9px;
                                              line-height: 16px;
                                              color: #90a3bf;
                                              margin: 0;
                                              text-align: center;
                                            "
                                          >
                                            ${transmission}
                                          </p>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                    </table>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 15px;">
                          <tr>
                            <td align="left" valign="middle">
                              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666; padding-top: 1px">
                                ${
                                  hideYourOfferText
                                    ? ''
                                    : '<span style="font-size: 9px; line-height: 16px; color: #90a3bf; vertical-align: middle;">Your Offer:</span>'
                                }
                                <strong style="color: #333333; font-size: 12px; line-height: 16px; vertical-align: middle">${offerPrice}</strong>
                              </p>
                            </td>

                            ${
                              hasDetailsButton
                                ? `<td align="right" valign="middle">
                                  <a
                                    href="https://browse.automarket.example.com${loginCode ? `?code=${loginCode}` : ''}"
                                    style="text-decoration: none; font-size: 12px; line-height: 18px; display: inline-block;"
                                  >
                                    <span style="vertical-align: middle; color: #20BFB6">
                                      Details
                                    </span>
                                    <img
                                      src="${IMAGES.detailsArrow}"
                                      alt="Details Arrow"
                                      style="
                                    width: 18px;
                                    height: 18px;
                                    vertical-align: middle;
                                    margin-left: 5px;
                                  "
                                    />
                                  </a>
                                </td>`
                                : ''
                            }
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`;
};

module.exports = carCard;
