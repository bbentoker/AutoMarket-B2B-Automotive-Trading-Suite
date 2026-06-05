const emailService = require('../services/emailService');
const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const User = require('../models/User');
const ListingPhotos = require('../models/ListingPhotos');

const emailTesterController = {
  /**
   * Test all email templates by sending them to a test email address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testAllEmails(req, res) {
    // const TEST_EMAIL = 'jetnor@automarket.example.com';
    const TEST_EMAIL = 'test@example.com';
    // const TEST_EMAIL = 'test@example.com';
    // const TEST_EMAILS = [
    //   'ykagantemplatetest@outlook.com',
    //   'test@example.com',
    // ];

    try {
      console.log('🧪 Starting email template tests...');

      // Sample data for different email types
      const sampleData = {
        reservation: {
          userName: 'John Doe',
          listingDetails: {
            id: 1,
            title: '2020 BMW X5 M50i',
            brand: 'BMW',
            model: 'X5',
            year: 2020,
            price: 45000,
            mileage: 25000,
            fuelType: 'Petrol',
            transmission: 'Automatic',
            bodyType: 'SUV',
            location: 'Amsterdam, Netherlands',
          },
        },
        counterOffer: {
          dealerName: 'Mike Smith',
          listingDetails: {
            id: 2,
            title: '2019 Mercedes-Benz C-Class',
            brand: 'Mercedes-Benz',
            model: 'C-Class',
            year: 2019,
            price: 35000,
            mileage: 30000,
            fuelType: 'Diesel',
            transmission: 'Automatic',
          },
          counterOffer: {
            amount: 32000,
            message:
              "I can offer €32,000 for this vehicle. It's in excellent condition and fits my requirements perfectly.",
          },
          offerId: 'OFFER-123456',
        },
        welcome: {
          dealerName: 'Sarah Johnson',
          companyName: 'Premium Auto Sales',
          email: TEST_EMAIL,
        },
        welcomeComplete: {
          dealerName: 'Sarah Johnson',
          companyName: 'Premium Auto Sales',
          email: TEST_EMAIL,
        },
        newsletter: {
          recipientName: 'John Doe',
          featuredCars: [
            {
              id: 1,
              title: '2021 Audi A4',
              price: 38000,
              image: 'https://example.com/audi-a4.jpg',
              mileage: 15000,
              year: 2021,
            },
            {
              id: 2,
              title: '2020 Tesla Model 3',
              price: 42000,
              image: 'https://example.com/tesla-model3.jpg',
              mileage: 20000,
              year: 2020,
            },
          ],
          totalListings: 150,
          newListings: 12,
        },
        counterOfferRejected: {
          buyerName: 'Alex Thompson',
          vehicleBrand: 'BMW',
          vehicleModel: 'X3',
          vehicleYear: 2019,
          offerAmount: 35000,
          rejectionReason: 'The offer was below our minimum acceptable price.',
          listingId: 'CAR-789',
          dealerName: 'Premium Motors',
          dealerContact: 'contact@premiummotors.com',
        },
      };

      // Sample data for stage emails
      const stageEmailData = {
        buyerName: 'John Doe',
        dealerName: 'Premium Auto Sales',
        vendorAccountName: 'Premium Auto Sales', // For offers template
        vehicleDetails: {
          brand: 'BMW',
          model: 'X5',
          year: 2020,
          licensePlate: 'ABC-123',
          vin: 'WBAXX1234567890',
        },
        dealDetails: {
          totalAmount: 45000,
          dealId: 'DEAL-001',
          agreementDate: '2024-01-15',
        },
        transportDetails: {
          pickupDate: '2024-01-20',
          deliveryDate: '2024-01-25',
          transportCompany: 'Euro Transport',
        },
        paymentDetails: {
          bankAccount: 'NL91 ABNA 0417 1643 00',
          referenceNumber: 'PAY-001',
        },
        // Additional fields for offers template
        brand: 'BMW',
        model: 'X5',
        vinNumber: 'WBAXX1234567890',
        registrationNumber: 'ABC-123',
        offerAmount: 45000,
        offer_amount: 45000,
        listingPrice: 50000,
        // Additional fields for purchased template
        amount_sold_for: 48000,
        amountSoldFor: 48000,
        // Additional fields for reserved template
        brand_name: 'BMW',
        km_stand: 25000,
        fuel_type: 'Petrol',
        transmission_type: 'Automatic',
        first_registration: '2020-01-15',
        listing_price: 50000,
        // Additional fields for purchased template
        amount_sold_for: 48000,
        amountSoldFor: 48000,
      };

      const results = [];

      // Test basic email templates
      // const basicEmails = [
      //   'counterOffer', //complete
      //   'welcome', //complete
      //   'welcomeComplete', //complete
      //   'newsletter', //complete
      //   'counterOfferRejected', //complete
      // ];

      const basicEmails = [];

      const offer = await Offer.findOne({
        where: { id: 27 },
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: [
              'id',
              'status_id',
              'listing_price',
              'registration_number',
              'brand_name',
              'model',
            ],
            include: [
              {
                model: ListingPhotos,
                as: 'photos',
                attributes: ['id', 'url'],
              },
            ],
          },
          {
            model: User,
            as: 'dealer',
            attributes: ['id', 'name', 'email', 'company_name'],
          },
        ],
      });
      for (const emailType of basicEmails) {
        try {
          let response;

          switch (emailType) {
            case 'reservation':
              response = await emailService.sendReservationEmail(
                TEST_EMAIL,
                sampleData.reservation.userName,
                sampleData.reservation.listingDetails
              );
              break;
            case 'counterOffer':
              response = await emailService.sendCounterOfferEmail(
                TEST_EMAIL,
                offer.dealer.name,
                offer.listing,
                222222,
                1
              );
              break;
            case 'counterTest':
              response = await emailService.sendCounterTestEmail(
                TEST_EMAIL,
                offer.dealer.name,
                offer.listing
              );
              break;
            case 'welcome':
              response = await emailService.sendWelcomeEmail(
                TEST_EMAIL,
                sampleData.welcome.dealerName,
                sampleData.welcome.companyName
              );
              break;
            case 'welcomeComplete':
              response = await emailService.sendWelcomeCompleteEmail(
                TEST_EMAIL,
                sampleData.welcomeComplete.dealerName,
                sampleData.welcomeComplete.companyName
              );
              break;
            case 'newsletter':
              response = await emailService.sendNewsletterEmail(
                TEST_EMAIL,
                sampleData.newsletter
              );
              break;
            case 'counterOfferRejected':
              response = await emailService.sendCounterOfferRejectedEmail(
                TEST_EMAIL,
                sampleData.counterOfferRejected
              );
              break;
          }

          results.push({
            emailType,
            status: 'success',
            response: response,
          });

          console.log(`✅ ${emailType} email sent successfully`);

          // Wait 1 second between emails to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({
            emailType,
            status: 'error',
            error: error.message,
          });
          console.error(`❌ Failed to send ${emailType} email:`, error.message);
        }
      }

      // Test all available stage emails
      // const testStages = [
      //   'Cars for Sale', //not using
      //   'Reserved', //
      //   'Offers', //
      //   'Purchased', //
      //   'Proforma Invoice Sent', //
      //   'Payment Received', //
      //   'Deal Done', //not using
      //   'No Deal', //
      //   'Car Delivered', //
      //   'Documents Sent', //
      //   'Transport Booked', //
      //   'Car Picked Up',
      // ];

      const testStages = ['Weekly Dealer Report'];
      for (const stage of testStages) {
        try {
          const response = await emailService.sendStageEmail(
            stage,
            TEST_EMAIL,
            stageEmailData,
            'en'
          );

          // const responses = TEST_EMAILS.map((email) =>
          //   emailService.sendStageEmail(stage, email, stageEmailData, 'en')
          // );

          results.push({
            emailType: `stage-${stage}`,
            status: 'success',
            response: response,
          });

          console.log(`✅ Stage email '${stage}' sent successfully`);

          // Wait 1 second between emails
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({
            emailType: `stage-${stage}`,
            status: 'error',
            error: error.message,
          });
          console.error(
            `❌ Failed to send stage email '${stage}':`,
            error.message
          );
        }
      }

      console.log('🎉 Email testing completed!');

      res.json({
        success: true,
        message: `Email tests completed. Sent to ${TEST_EMAIL}`,
        results: results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.status === 'success').length,
          failed: results.filter((r) => r.status === 'error').length,
        },
      });
    } catch (error) {
      console.error('💥 Fatal error in email testing:', error);
      res.status(500).json({
        success: false,
        message: 'Email testing failed',
        error: error.message,
      });
    }
  },

  /**
   * Test a specific email template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testSpecificEmail(req, res) {
    const { emailType, stage } = req.body;
    const TEST_EMAIL = 'test@example.com';

    try {
      console.log(`🧪 Testing ${emailType} email...`);

      let response;
      let result;

      if (emailType === 'stage' && stage) {
        // Handle stage emails
        const stageEmailData = {
          buyerName: 'John Doe',
          dealerName: 'Premium Auto Sales',
          vendorAccountName: 'Premium Auto Sales', // For offers template
          vehicleDetails: {
            brand: 'BMW',
            model: 'X5',
            year: 2020,
            licensePlate: 'ABC-123',
            vin: 'WBAXX1234567890',
          },
          dealDetails: {
            totalAmount: 45000,
            dealId: 'DEAL-001',
            agreementDate: '2024-01-15',
          },
          // Additional fields for offers template
          brand: 'BMW',
          model: 'X5',
          vinNumber: 'WBAXX1234567890',
          registrationNumber: 'ABC-123',
          offerAmount: 45000,
          offer_amount: 45000,
          listingPrice: 50000,
        };

        response = await emailService.sendStageEmail(
          stage,
          TEST_EMAIL,
          stageEmailData,
          'en'
        );
        result = { emailType: `stage-${stage}`, status: 'success', response };
      } else {
        // Handle basic email types
        const sampleData = {
          reservation: {
            userName: 'John Doe',
            listingDetails: {
              id: 1,
              title: '2020 BMW X5 M50i',
              brand: 'BMW',
              model: 'X5',
              year: 2020,
              price: 45000,
            },
          },
          // Add other sample data as needed
        };

        switch (emailType) {
          case 'reservation':
            response = await emailService.sendReservationEmail(
              TEST_EMAIL,
              sampleData.reservation.userName,
              sampleData.reservation.listingDetails
            );
            break;
          // Add other cases as needed
          default:
            throw new Error(`Unknown email type: ${emailType}`);
        }

        result = { emailType, status: 'success', response };
      }

      console.log(`✅ ${emailType} email sent successfully`);

      res.json({
        success: true,
        message: `${emailType} email sent successfully to ${TEST_EMAIL}`,
        result: result,
      });
    } catch (error) {
      console.error(`❌ Failed to send ${emailType} email:`, error.message);
      res.status(500).json({
        success: false,
        message: `Failed to send ${emailType} email`,
        error: error.message,
      });
    }
  },
};

module.exports = emailTesterController;
