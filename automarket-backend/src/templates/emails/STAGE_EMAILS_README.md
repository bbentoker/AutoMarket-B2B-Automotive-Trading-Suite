# Stage Email Template System

This system provides a structured approach to managing email templates for different stages in the car sales process with multi-language support.

## Features

- ✅ 14 stage templates covering the entire car sales process
- ✅ Multi-language support (English, Dutch, French, Italian, German)
- ✅ Single method call interface
- ✅ Error handling and fallback mechanisms
- ✅ Flexible naming (camelCase or full stage names)

## Available Stages

1. **Cars for Sale** - New cars available notification
2. **Reserved** - Car reservation confirmation
3. **Offers** - New offer notifications
4. **Purchased** - Purchase confirmation
5. **Proforma Invoice Sent** - Invoice sent notification
6. **Payment Received** - Payment confirmation
7. **Payment Sent** - Payment sent notification
8. **Car De-registered** - De-registration process update
9. **Deal Done** - Deal completion celebration
10. **No Deal** - Deal cancellation notification
11. **Car Delivered** - Delivery confirmation
12. **Documents Sent** - Document transmission notification
13. **Transport Booked** - Shipping arrangement update
14. **Car Picked Up** - Collection confirmation

## Supported Languages

- `en` - English
- `nl` - Nederlands (Dutch)
- `fr` - Français (French)
- `it` - Italiano (Italian)
- `de` - Deutsch (German)

## Basic Usage

### Import the Service

```javascript
const {
  getStageEmailTemplate,
} = require('./templates/emails/stageEmailService');
```

### Simple Template Call

```javascript
// Method signature: getStageEmailTemplate(templateName, data, language)

const emailContent = getStageEmailTemplate(
  'reserved',
  {
    userName: 'John Doe',
    carBrand: 'BMW',
    carModel: '320i',
  },
  'en'
);

console.log(emailContent.subject); // "Car Reserved - Confirmation"
console.log(emailContent.body); // HTML email body
```

## Advanced Usage

### Using Full Stage Names

```javascript
// Both work the same way
const email1 = getStageEmailTemplate('Reserved', data, 'en');
const email2 = getStageEmailTemplate('reserved', data, 'en');
```

### Multi-language Support

```javascript
const data = { userName: 'Maria', carModel: 'Mercedes C-Class' };

const englishEmail = getStageEmailTemplate('dealDone', data, 'en');
const dutchEmail = getStageEmailTemplate('dealDone', data, 'nl');
const germanEmail = getStageEmailTemplate('dealDone', data, 'de');
```

### Integration with Email Service

```javascript
const sendStageEmail = async (
  templateName,
  recipientEmail,
  data,
  language = 'en'
) => {
  try {
    const emailContent = getStageEmailTemplate(templateName, data, language);

    // Use with your email service (nodemailer, SendGrid, etc.)
    await emailService.send({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.body,
    });

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
};

// Usage
await sendStageEmail(
  'Payment Received',
  'user@example.com',
  {
    amount: '€15,000',
    transactionId: 'TXN-123',
  },
  'nl'
);
```

## Utility Functions

### Get Available Templates

```javascript
const {
  getAvailableTemplates,
} = require('./templates/emails/stageEmailService');

console.log(getAvailableTemplates());
// Output: ['Cars for Sale', 'Reserved', 'Offers', ...]
```

### Get Supported Languages

```javascript
const {
  getSupportedLanguages,
} = require('./templates/emails/stageEmailService');

console.log(getSupportedLanguages());
// Output: [
//   { code: 'en', name: 'English' },
//   { code: 'nl', name: 'Nederlands' },
//   ...
// ]
```

## File Structure

```
src/templates/emails/
├── stages/
│   ├── carsForSale.js
│   ├── reserved.js
│   ├── offers.js
│   ├── purchased.js
│   ├── proformaInvoiceSent.js
│   ├── paymentReceived.js
│   ├── paymentSent.js
│   ├── carDeregistered.js
│   ├── dealDone.js
│   ├── noDeal.js
│   ├── carDelivered.js
│   ├── documentsSent.js
│   ├── transportBooked.js
│   └── carPickedUp.js
├── stageEmailService.js          # Main service
├── stageEmailUsageExample.js     # Usage examples
└── STAGE_EMAILS_README.md        # This documentation
```

## Template Structure

Each template file follows this structure:

```javascript
const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const templateName = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'English subject',
      body: `<div>English HTML content</div>`,
    },
    nl: {
      subject: 'Dutch subject',
      body: `<div>Dutch HTML content</div>`,
    },
    // ... other languages
  };

  return templates[language] || templates.en;
};

module.exports = { templateName, languages };
```

## Customizing Templates

1. **Edit Subject Lines**: Modify the `subject` field in each language object
2. **Edit Email Body**: Modify the `body` field with your HTML content
3. **Add Dynamic Content**: Use template literals and data parameters:

```javascript
body: `
  <div style="font-family: Arial, sans-serif;">
    <h2>Hello ${data.userName}!</h2>
    <p>Your ${data.carBrand} ${data.carModel} is ready.</p>
    <p>Price: ${data.price}</p>
  </div>
`;
```

## Error Handling

The system includes built-in error handling:

- **Invalid template name**: Throws descriptive error with available templates
- **Invalid language**: Warns and falls back to English
- **Missing data**: Templates should handle undefined data gracefully

## Best Practices

1. **Always provide fallback data** in your templates
2. **Test with all supported languages** before deployment
3. **Use consistent data structure** across similar templates
4. **Include unsubscribe links** and company information in email bodies
5. **Test HTML rendering** across different email clients

## Next Steps

1. Fill in the template content for each stage and language
2. Test the templates with your email service
3. Integrate with your existing notification system
4. Add any additional data fields needed for your use case

## Example Implementation

See `stageEmailUsageExample.js` for comprehensive usage examples and integration patterns.
