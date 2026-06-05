const labelMap = {
  pending: 'Account Pending Approval',
  complete: 'Account Activated',
};

const imageMap = {
  pending:
    'https://cdn.automarket.example.com/image/upload/v1753111179/time-sand_pk0oav.png',
  complete:
    'https://cdn.automarket.example.com/image/upload/v1753012012/verified-user_wp4sdg.png',
};

const AccountDetails = ({ dealerName, companyName, email, variation }) => {
  const label = labelMap[variation] || '';

  const svg = imageMap[variation] || `${variation} svg`;

  return `
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="border-collapse: collapse; margin-top: 20px"
            >
              <tr>
                <td style="border-radius: 16px; overflow: hidden">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="border-collapse: collapse; background-color: #fff"
                  >
                    <tr>
                      <td
                        valign="top"
                        style="
                          padding: 15px 15px 15px 20px; /* Adjust padding for visual consistency with car details if needed */
                          font-family: Arial, sans-serif;
                          font-size: 14px;
                          line-height: 20px;
                          color: #333333;
                        "
                      >
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            border-collapse: collapse;
                            background-color: #fff;
                          "
                        >
                          <tr>
                            <td
                              align="center"
                              style="
                                border-bottom: 1px solid #90a3bf33;
                                padding: 16px 8px; /* Keep padding, but without fixed height it will adapt */
                              "
                            >
                              <p
                                style="
                                  margin: 0;
                                  font-weight: 500;
                                  line-height: 16px;
                                  font-size: 1rem;
                                  color: #050b20;
                                "
                              >
                                Account Details
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="
                                padding: 16px 8px;
                                border-bottom: 1px solid #90a3bf33;
                              "
                              align="center"
                            >
                              <ul
                                style="
                                  margin: 0;
                                  padding: 0;
                                  width: 100%;
                                  line-height: 24px;
                                  font-size: 12px;
                                  color: #050b20;
                                "
                              >
                                <li style="margin: auto; width: max-content">
                                  Name: ${dealerName}
                                </li>
                                <li style="margin: auto; width: max-content">
                                  Company: ${companyName}
                                </li>
                                <li style="margin: auto; width: max-content">
                                  Email: ${email}
                                </li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <img
                                src=${svg}
                                alt="Verified User Icon"
                                width="32px"
                                height="32px"
                                style="
                                  display: block;
                                  border: 0;
                                  margin-top: 10px;
                                "
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: center; color: #050b20">
                              <p
                                style="
                                  font-size: 16px;
                                  font-weight: 500;
                                  line-height: 16px;
                                "
                              >
                                ${label}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 12px; line-height: 16px">
                              <p style="text-align: center; color: #050b20; width: 100%">
                                Great News! Your account is now fully activated
                                and ready to use. You can immediately start
                                accessing the platform and begin buying cars.
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
  `;
};

module.exports = AccountDetails;
