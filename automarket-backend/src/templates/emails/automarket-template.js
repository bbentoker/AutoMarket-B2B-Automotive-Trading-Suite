// Image URLs configuration
const IMAGES = {
  logo: 'https://cdn.automarket.example.com/favicon-dark.png',
  redLine:
    'https://assets.automarket.example.com/red-line2x.png',
  defaultCarImage:
    'https://assets.automarket.example.com/listings/259/e5cf3d38-5b83-4bdd-aec0-75694723f61c.jpg',
  purchaseProcess:
    'https://assets.automarket.example.com/purchase-process-content.png',
  carsFooter: 'https://assets.automarket.example.com/cars.png',
  footerLogo:
    'https://cdn.automarket.example.com/favicon-dark.png',
  transmissionIcon:
    'https://cdn.automarket.example.com/transmission-icon.png',
  mileageIcon:
    'https://cdn.automarket.example.com/mileage-icon.png',
  fuelIcon:
    'https://cdn.automarket.example.com/fuel-icon.png',
  viewDetailsButton:
    'https://assets.automarket.example.com/details-icon.png',
  topIcon:
    'https://assets.automarket.example.com/right-top-vector.png',
  bottomIcon:
    'https://assets.automarket.example.com/left-bottom-vector.png',
  redBg: 'https://assets.automarket.example.com/red-bg.png',
};
const imageConfig = {
  footerLogo: {
    width: '200px',
    height: 'auto',
  },
};
const contactInfo = {
  address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
  phone: '+46 40 12 92 20',
};
const autoMarketTemplate = ({ htmlContent }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
        <title>Car Click Vehicle Inventory Update</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
        
        <!-- Main Container Table -->
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width: 100%; background-color: #f5f5f5;">
          <tr>
            <td style="padding: 20px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="width: 600px; margin: 0 auto; background-color: #ffffff;">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 40px 20px; position: relative;">
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="width: 70%;">
                          <img src="${IMAGES.logo}" alt="Car Click" style="max-width: 180px; height: auto; width: auto; display: block;">
                        </td>
                        <td style="width: 30%; text-align: right; vertical-align: top;">
                          <img src="${IMAGES.redLine}" alt="" style="height: 120px; width: auto;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Goes Here -->
                ${htmlContent}
                <!-- Red Footer Section -->
                <tr>
                  <td style="background-color: #20BFB6; padding: 0;">

                    <!-- Footer Content -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; position: relative; z-index: 100;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          
                          <!-- Footer Message -->
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 10px 0;">
                            <tr>
                              <td style="color: #ffffff; line-height: 1.6; font-size: 16px; font-family: Arial, sans-serif; text-align: center;">
                                Have any questions?<br>
                                Just reply to this email or reach out to us at info@automarket.example.com.
                              </td>
                            </tr>
                          </table>
                          
                          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 10px 0;">
                            <tr>
                              <td style="color: #ffffff; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif; text-align: center;">
                                Produktiv bilhandel i Sverige AB<br>
                                Norrlandsgatan 16<br>
                                111 43<br>
                                Stockholm
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>

                    <!-- Footer Logo - Full Width -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="padding: 0;">
                          <img src="${IMAGES.footerLogo}" alt="Car Click" style="width: ${imageConfig.footerLogo.width}; height: ${imageConfig.footerLogo.height}; display: block;">
                        </td>
                      </tr>
                    </table>
                    </td>
                  </tr>

                <!-- Updated Footer Section -->
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 0px; background-color: #f8f8f8; border-top: 1px solid #eeeeee;">
                  <tr>
                    <td style="padding: 20px; text-align: center; font-size: 12px; color: #666666; font-family: Arial, sans-serif;">
                      <p style="margin: 0; border-top: 1px solid #eeeeee; padding-top: 20px;">
                        Car Click<br>
                        ${contactInfo.address}<br>
                        ${contactInfo.phone}<br>
                        <a href="mailto:info@automarket.example.com" style="color: #666666; text-decoration: none;">info@automarket.example.com</a>
                      </p>
                    </td>
                  </tr>
                </table>

              </table>
            </td>
          </tr>
        </table>
    </body>
    </html>
  `;
};

module.exports = autoMarketTemplate;
