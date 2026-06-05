# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# 📧 Email Preview System

This system allows you to design, test, and preview email templates easily before integrating them into your backend.

## 🚀 Quick Start

### Option 1: Using npm script

```bash
npm run email-preview
```

### Option 2: Using the batch file (Windows)

```bash
start-email-preview.bat
```

### Option 3: Direct command

```bash
node email-preview-server.js
```

The preview server will start at: **http://localhost:3001**

## 🎯 Features

- **Live Preview**: See your email templates in real-time as you edit them
- **Multi-language Support**: Test templates in English, Dutch, French, Italian, and German
- **Sample Data**: Automatically load sample data for testing
- **Template Discovery**: Automatically finds all your email templates
- **JSON Editor**: Edit template data with syntax highlighting
- **New Tab Preview**: Open emails in a new tab for better testing

## 📁 Template Structure

Your email templates are organized in:

- `src/templates/emails/` - Regular email templates
- `src/templates/emails/stages/` - Stage-based email templates
- `src/templates/emails/shared/` - Shared components

## 🛠 Creating New Templates

### 1. Create a New Template File

For regular templates, create a file like `src/templates/emails/myNewEmail.js`:

```javascript
const logoFooter = require('./shared/logoFooter');

const myNewEmailTemplate = ({ userName, message }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Hello ${userName}!</h1>
      <p>${message}</p>
      
    </div>
  `;
};

module.exports = myNewEmailTemplate;
```

### 2. For Stage Templates

Create a file like `src/templates/emails/stages/myStage.js`:

```javascript
const logoFooter = require('../shared/logoFooter');

const myStageTemplate = (data, language = 'en') => {
  const templates = {
    en: {
      subject: 'English Subject',
      body: '<div>English email content</div>',
    },
    nl: {
      subject: 'Dutch Subject',
      body: '<div>Dutch email content</div>',
    },
    // Add more languages...
  };

  return templates[language] || templates.en;
};

module.exports = { myStageTemplate };
```

### 3. Test Your Template

1. Start the preview server
2. Select your new template from the dropdown
3. Load sample data or provide custom JSON data
4. Preview and refine your design

## 🔧 Integration with Backend

Once you're happy with your template design:

### For Regular Templates

Add to `src/services/emailService.js`:

```javascript
const myNewEmailTemplate = require('../templates/emails/myNewEmail');

// Add to emailTemplates object
const emailTemplates = {
  // ... existing templates
  myNewEmail: {
    template: myNewEmailTemplate,
    getSubject: () => 'My Email Subject',
  },
};

// Add convenience method
async sendMyNewEmail(userEmail, userName, message) {
  return this.sendEmail('myNewEmail', userEmail, {
    userName,
    message,
  });
}
```

### For Stage Templates

Stage templates are automatically available through `sendStageEmail()`:

```javascript
await emailService.sendStageEmail(
  'myStage',
  'user@example.com',
  { userName: 'John', message: 'Hello' },
  'en'
);
```

## 📊 Sample Data Format

The preview system expects JSON data. Here's the format for different template types:

### Basic Template Data

```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "message": "Your custom message"
}
```

### Car Listing Data

```json
{
  "userName": "Jane Doe",
  "dealerName": "Auto Dealer Inc",
  "listingDetails": {
    "make": "BMW",
    "model": "X5",
    "year": 2020,
    "price": 45000,
    "mileage": 25000
  },
  "customMessage": "Special offer available!",
  "actionUrl": "https://yoursite.com/listing/123"
}
```

### Offer Data

```json
{
  "dealerName": "John Smith",
  "listingDetails": {
    "make": "Mercedes",
    "model": "C-Class",
    "year": 2021,
    "price": 35000
  },
  "counterOffer": {
    "amount": 32000,
    "comment": "Best price we can offer"
  },
  "offerId": "OFF-12345"
}
```

## 🎨 Design Best Practices

1. **Use inline CSS**: Email clients have limited CSS support
2. **Test across languages**: Use the language selector to test all supported languages
3. **Mobile-friendly**: Use responsive design patterns
4. **Consistent branding**: Use the shared footer component
5. **Clear call-to-actions**: Make buttons prominent and accessible

## 🔧 Troubleshooting

### Template not showing up?

- Make sure the file ends with `.js`
- Check that it exports the template function properly
- Restart the preview server to refresh template discovery

### Error in preview?

- Check the browser console for JavaScript errors
- Verify your JSON data is valid
- Check that all required template data is provided

### Changes not reflecting?

- The preview server clears the Node.js require cache automatically
- If issues persist, restart the preview server

## 🚀 Advanced Usage

### Custom Sample Data

You can modify the `sampleData` object in `email-preview-server.js` to include data specific to your templates:

```javascript
const sampleData = {
  myNewTemplate: {
    userName: 'Custom Name',
    specialField: 'Custom Value',
  },
};
```

### Testing with Real Data

Use the JSON editor to paste real data from your application for testing:

1. Copy data from your backend logs
2. Paste into the "Template Data" textarea
3. Click "Update Preview"

This system makes email development much faster and ensures your emails look perfect before going live! 🎉
