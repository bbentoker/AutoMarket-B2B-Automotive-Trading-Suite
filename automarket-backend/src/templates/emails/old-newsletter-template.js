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

const defaultListings = [
  {
    id: 1,
    make: 'Koenigsegg',
    model: 'Gemera',
    year: 2021,
    price: 625000,
    image: IMAGES.defaultCarImage,
    mileage: '5,000 km',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    vat_or_margin: 'Excl. VAT',
    brand_name: 'Koenigsegg',
    remainingTime: '2 days left',
  },
  {
    id: 2,
    make: 'Koenigsegg',
    model: 'Gemera',
    year: 2021,
    price: 645000,
    image: IMAGES.defaultCarImage,
    mileage: '3,200 km',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    vat_or_margin: 'Incl. VAT',
    brand_name: 'Koenigsegg',
    remainingTime: '5 days left',
  },
  {
    id: 3,
    make: 'Koenigsegg',
    model: 'Gemera',
    year: 2021,
    price: 639000,
    image: IMAGES.defaultCarImage,
    mileage: '7,800 km',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    vat_or_margin: 'Excl. VAT',
    brand_name: 'Koenigsegg',
    remainingTime: '1 day left',
  },
  {
    id: 4,
    make: 'Koenigsegg',
    model: 'Gemera',
    year: 2021,
    price: 649000,
    image: IMAGES.defaultCarImage,
    mileage: '2,100 km',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    vat_or_margin: 'Incl. VAT',
    brand_name: 'Koenigsegg',
    remainingTime: '3 days left',
  },
];

const generatePlainTextVersion = ({
  userName = 'there',
  carListings = [],
  contactInfo = {
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
    phone: '+46 40 12 92 20',
  },
  contactId = null,
}) => {
  const listings = carListings.length > 0 ? carListings : defaultListings;

  let plainText = `Dear ${userName},

We're pleased to share your personalized vehicle inventory update from Car Click.

Available Vehicles:
`;

  listings.forEach((car) => {
    plainText += `
* ${car.brand_name || car.make} ${car.model} (${car.year})
  - Price: €${car.price.toLocaleString()} ${car.vat_or_margin}
  - Mileage: ${car.mileage}
  - Fuel Type: ${car.fuelType}
  - Transmission: ${car.transmission}
  - View vehicle details: https://browse.automarket.example.com/listings/${car.id}

`;
  });

  plainText += `
Our Purchase Process:
1. Browse our curated vehicle selection
2. Review detailed inspection reports
3. Select your preferred vehicles
4. Complete the purchase process

Contact our team:
Email: info@automarket.example.com
Phone: ${contactInfo.phone}

Company Information:
Car Click
${contactInfo.address}

---
You received this email because you subscribed to vehicle updates from Car Click.
To manage your preferences or unsubscribe: https://browse.automarket.example.com/unsubscribe/${contactId || ''}
`;

  return plainText;
};

const autoMarketNewsletterTemplate = ({
  userName = 'there',
  carListings = [],
  newsletter_id = null,
  footerText = 'Thank you for choosing Car Click!',
  contactInfo = {
    address: 'Produktiv bilhandel i Sverige AB<br>Norrlandsgatan 16<br>111 43<br>Stockholm',
    phone: '+46 40 12 92 20',
  },
  contactId = null,
}) => {
  // Image size configuration
  const imageConfig = {
    footerLogo: {
      width: '200px',
      height: 'auto',
    },
  };

  const listings = carListings.length > 0 ? carListings : defaultListings;

  // Helper function to create car listing HTML using tables
  const createCarListing = (car) => {
    return `
      <a href="https://browse.automarket.example.com/listings/${car.id}?newsletter_id=${newsletter_id}" style="text-decoration: none; color: inherit; display: block;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f2f2f7; border: 1px solid #ececec;">
          <tr>
            <td style="padding: 0;">
              <!-- Car Image -->
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                <tr>
                  <td style="position: relative; padding: 0;">
                    <img src="${car.image}" alt="${car.make} ${car.model}" style="width: 100%; height: 180px; object-fit: cover; display: block; border: 0;">
                    ${car.remainingTime
        ? `
                      <table cellpadding="0" cellspacing="0" border="0" style="position: absolute; top: 10px; right: 0; background-color: #20BFB6;">
                        <tr>
                          <td style="color: white; padding: 4px 12px; font-size: 11px; font-family: Arial, sans-serif;">
                            ${car.remainingTime}
                          </td>
                        </tr>
                      </table>
                    `
        : ''
      }
                  </td>
                </tr>
              </table>
            
            <!-- Car Details -->
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="padding: 16px;">
                  
                  <!-- Car Name -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 8px;">
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; color: #111827; font-family: Arial, sans-serif; line-height: 18px;">
                        ${car.brand_name || car.make} ${car.model.split(' ').length > 1 ? car.model.split(' ')[0] : car.model} - ${car.year}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Model Description -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif; line-height: 16px; height: 32px;">
                        ${car.model}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Separator Line -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="height: 1px; background-color: #e5e7eb; font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                  </table>
                  
                  <!-- Icons Row -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 8px;">
                    <tr>
                      <td style="width: 33%; text-align: center; padding: 4px;">
                        <img src="${IMAGES.mileageIcon}" alt="Mileage" style="width: 16px; height: 16px;">
                         <div style="font-size: 10px; color: #9095bf; font-family: Arial, sans-serif; text-align: center;">
                           ${car.mileage}
                         </div>
                       </td>
                       <td style="width: 33%; text-align: center; padding: 4px;">
                        <img src="${IMAGES.fuelIcon}" alt="Fuel" style="width: 16px; height: 16px;">
                         <div style="font-size: 10px; color: #90a3bf; font-family: Arial, sans-serif; text-align: center;">
                           ${car.fuelType}
                         </div>
                       </td>
                       <td style="width: 33%; text-align: center; padding: 4px;">

                         <img src="${IMAGES.transmissionIcon}" alt="Transmission" style="width: 16px; height: 16px;">
                         <div style="font-size: 10px; color: #90a3bf; font-family: Arial, sans-serif; text-align: center;">
                           ${car.transmission}
                         </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Separator Line -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 8px 0;">
                    <tr>
                      <td style="height: 1px; background-color: #e5e7eb; font-size: 1px; line-height: 1px;">&nbsp;</td>
                    </tr>
                  </table>
                  
                  <!-- Price and Details -->
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                    <tr>
                      <td style="width: 70%; vertical-align: top;">
                        <div style="font-size: 12px; color: #6b7280; font-family: Arial, sans-serif; margin-bottom: 4px;">
                          ${car.vat_or_margin}
                        </div>
                        <div style="font-size: 14px; font-weight: bold; color: #111827; font-family: Arial, sans-serif;">
                          €${car.price.toLocaleString()}
                        </div>
                      </td>
                                             <td style="width: 30%; text-align: right; vertical-align: middle;">
                         <img src="${IMAGES.viewDetailsButton}" alt="View Details" style="width: 100%; height: auto; display: block;">
                       </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      </a>
    `;
  };

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

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    
                    <!-- Greeting -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td style="font-size: 24px; color: #333333; font-weight: bold; font-family: Arial, sans-serif;">
                          Dear ${userName},
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Intro Text -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td style="color: #555555; line-height: 1.6; font-size: 16px; font-family: Arial, sans-serif;">
                          We hope this email finds you well. Here is your personalized vehicle inventory update, featuring carefully selected vehicles that match your dealership's requirements.
                        </td>
                      </tr>
                    </table>
                    
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 20px;">
                      <tr>
                        <td style="color: #555555; line-height: 1.6; font-size: 16px; font-family: Arial, sans-serif;">
                          Each vehicle comes with:
                          <ul style="margin: 10px 0; padding-left: 20px;">
                            <li style="margin-bottom: 8px;">Comprehensive inspection reports</li>
                            <li style="margin-bottom: 8px;">Transparent pricing</li>
                            <li style="margin-bottom: 8px;">Real-time order tracking</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Separator Line -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0;">
                      <tr>
                        <td style="height: 1px; background-color: #e0e0e0; font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Car Listings Grid -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 40px 0;">
                      ${listings
      .map((car, index) => {
        if (index % 2 === 0) {
          const nextCar = listings[index + 1];
          return `
                            <tr>
                              <td style="width: 48%; padding: 10px; vertical-align: top;">
                                ${createCarListing(car)}
                              </td>
                              <td style="width: 4%;">&nbsp;</td>
                              <td style="width: 48%; padding: 10px; vertical-align: top;">
                                ${nextCar ? createCarListing(nextCar) : '&nbsp;'}
                              </td>
                            </tr>
                            <tr><td colspan="3" style="height: 20px;">&nbsp;</td></tr>
                          `;
        }
        return '';
      })
      .join('')}
                    </table>
                    
                    <!-- View All Listings Button -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 32px;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="https://browse.automarket.example.com" target="_blank" style="display: inline-block; background-color: #20BFB6; color: #fff; font-size: 20px; font-weight: bold; padding: 16px 40px; border-radius: 24px; text-decoration: none; font-family: Arial, sans-serif; margin-top: 8px; margin-bottom: 8px;">
                            Browse Available Vehicles
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Separator Line -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0;">
                      <tr>
                        <td style="height: 1px; background-color: #e0e0e0; font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Purchase Process Section -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 30px 0;">
                      <tr>
                        <td style="color: #20BFB6; font-size: 24px; font-weight: bold; margin-bottom: 20px; font-family: Arial, sans-serif; padding-left: 20px;">
                          Purchase process
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-left: 20px; padding-top: 20px;">
                          <img src="${IMAGES.purchaseProcess}" alt="Purchase process" style="max-width: 100%; height: auto; display: block; pointer-events: none; user-select: none;">
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Separator Line -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0;">
                      <tr>
                        <td style="height: 1px; background-color: #e0e0e0; font-size: 1px; line-height: 1px;">&nbsp;</td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Red Footer Section -->
                <tr>
                  <td style="background-color: #20BFB6; padding: 0;">
                    
                    <!-- Cars Image Section -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; position: relative; z-index: 100;">
                      <tr>
                        <td style="padding: 0 40px; position: relative;">
                          <img src="${IMAGES.carsFooter}" alt="Cars" style="width: 100%; height: auto; display: block;">
                        </td>
                      </tr>
                    </table>

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
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 40px; background-color: #f8f8f8; border-top: 1px solid #eeeeee;">
                  <tr>
                    <td style="padding: 20px; text-align: center; font-size: 12px; color: #666666; font-family: Arial, sans-serif;">
                      <p style="margin: 0 0 10px 0;">
                        You received this email because you subscribed to vehicle updates from Car Click.
                      </p>
                      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="https://browse.automarket.example.com/unsubscribe/${contactId || ''}" 
                               style="display: inline-block; background-color: #666666; color: #ffffff; font-size: 14px; 
                                      font-weight: normal; padding: 10px 20px; border-radius: 4px; text-decoration: none; 
                                      font-family: Arial, sans-serif;">
                              Unsubscribe from emails
                            </a>
                          </td>
                        </tr>
                      </table>
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

module.exports = autoMarketNewsletterTemplate;
