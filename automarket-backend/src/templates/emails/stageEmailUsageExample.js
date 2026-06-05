const {
  getStageEmailTemplate,
  getAvailableTemplates,
  getSupportedLanguages,
} = require('./stageEmailService');

// Example usage of the stage email template system

// Example 1: Using camelCase template name
const example1 = () => {
  console.log('=== Example 1: Using camelCase template name ===');

  const sampleData = {
    userName: 'John Doe',
    carBrand: 'BMW',
    carModel: '320i',
    price: '€15,000',
  };

  const emailContent = getStageEmailTemplate('reserved', sampleData, 'en');
  console.log('Subject:', emailContent.subject);
  console.log('Body:', emailContent.body);
};

// Example 2: Using full stage name
const example2 = () => {
  console.log('\n=== Example 2: Using full stage name ===');

  const sampleData = {
    dealId: 'DEAL-001',
    amount: '€18,500',
  };

  const emailContent = getStageEmailTemplate(
    'Payment Received',
    sampleData,
    'nl'
  );
  console.log('Subject:', emailContent.subject);
  console.log('Body:', emailContent.body);
};

// Example 3: Multiple languages
const example3 = () => {
  console.log('\n=== Example 3: Multiple languages for same template ===');

  const sampleData = {
    customerName: 'Maria Schmidt',
    trackingNumber: 'TR123456789',
  };

  const languages = ['en', 'de', 'fr'];

  languages.forEach((lang) => {
    const emailContent = getStageEmailTemplate(
      'Transport Booked',
      sampleData,
      lang
    );
    console.log(`\n${lang.toUpperCase()} - Subject:`, emailContent.subject);
  });
};

// Example 4: Error handling
const example4 = () => {
  console.log('\n=== Example 4: Error handling ===');

  try {
    // This will throw an error - template doesn't exist
    getStageEmailTemplate('nonExistentTemplate', {}, 'en');
  } catch (error) {
    console.log('Error caught:', error.message);
  }

  // This will show a warning and fallback to English
  const emailContent = getStageEmailTemplate(
    'dealDone',
    {},
    'invalid-language'
  );
  console.log('Fallback subject:', emailContent.subject);
};

// Example 5: Getting available templates and languages
const example5 = () => {
  console.log('\n=== Example 5: Available templates and languages ===');

  console.log('Available templates:');
  getAvailableTemplates().forEach((template) => {
    console.log(`- ${template}`);
  });

  console.log('\nSupported languages:');
  getSupportedLanguages().forEach((lang) => {
    console.log(`- ${lang.code}: ${lang.name}`);
  });
};

// Real-world usage example in a service
const sendStageEmail = async (
  templateName,
  recipientEmail,
  data,
  language = 'en'
) => {
  try {
    // Get the email template
    const emailContent = getStageEmailTemplate(templateName, data, language);

    // Here you would integrate with your email service (nodemailer, SendGrid, etc.)
    console.log(`\n=== Sending email to ${recipientEmail} ===`);
    console.log('Template:', templateName);
    console.log('Language:', language);
    console.log('Subject:', emailContent.subject);
    console.log('Body preview:', emailContent.body.substring(0, 100) + '...');

    // Simulate sending email
    // await emailService.send({
    //   to: recipientEmail,
    //   subject: emailContent.subject,
    //   html: emailContent.body
    // });

    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
};

// Integration example with your existing email service
const integrateWithExistingService = () => {
  console.log('\n=== Integration Example ===');

  // Example: When a car gets reserved
  const reservationData = {
    userName: 'Jane Smith',
    carDetails: {
      brand: 'Mercedes',
      model: 'C-Class',
      year: '2020',
      registrationNumber: 'AB-123-CD',
    },
    reservationId: 'RES-12345',
    price: '€22,000',
  };

  // Send email in user's preferred language
  sendStageEmail('Reserved', 'jane.smith@example.com', reservationData, 'nl');

  // Example: When deal is completed
  const dealData = {
    buyerName: 'Peter Johnson',
    dealId: 'DEAL-789',
    finalAmount: '€19,500',
  };

  sendStageEmail('Deal Done', 'peter.johnson@example.com', dealData, 'en');
};

// Uncomment the lines below to run examples
// example1();
// example2();
// example3();
// example4();
// example5();
// integrateWithExistingService();

module.exports = {
  sendStageEmail,
  example1,
  example2,
  example3,
  example4,
  example5,
  integrateWithExistingService,
};
