const axios = require('axios');
require('dotenv').config();

async function sendTestEmail() {
  try {
    const MAILGUN_KEY = process.env.MAILGUN_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

    console.log('MAILGUN_KEY:', MAILGUN_KEY);
    console.log('MAILGUN_DOMAIN:', MAILGUN_DOMAIN);

    if (!MAILGUN_KEY || !MAILGUN_DOMAIN) {
      throw new Error('Missing Mailgun credentials in .env');
    }

    // Use EU region since your domain is configured there
    const url = `https://api.eu.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

    const params = new URLSearchParams();
    params.append('from', `Test Sender <noreply@${MAILGUN_DOMAIN}>`);
    params.append('to', 'test@example.com');
    params.append('subject', 'Test Email from Mailgun API');
    params.append('text', 'This is a test email sent using the Mailgun API.');
    params.append(
      'html',
      `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email sent using the Mailgun API.</p>
            <p>Sent at: ${new Date().toISOString()}</p>
          </body>
        </html>
      `
    );

    const response = await axios.post(url, params.toString(), {
      auth: {
        username: 'api',
        password: MAILGUN_KEY,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('✅ Email sent successfully!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
sendTestEmail()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });
