#!/bin/bash

echo "🚀 Setting up Email Tracking with Mailgun..."
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your configuration."
    exit 1
fi

echo "📋 Step 1: Running database migration..."
node run-migration.js

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed. Please check your database configuration."
    exit 1
fi

echo ""
echo "📋 Step 2: Testing email tracking setup..."
node test-email-tracking.js

if [ $? -eq 0 ]; then
    echo "✅ Email tracking tests completed"
else
    echo "❌ Email tracking tests failed. Please check your configuration."
    exit 1
fi

echo ""
echo "🎉 Email Tracking Setup Complete!"
echo "================================="
echo ""
echo "📝 Next Steps:"
echo "1. Configure Mailgun webhooks in your Mailgun dashboard:"
echo "   - Webhook URL: https://your-domain.com/api/mailgun"
echo "   - Events: opened, delivered, clicked, bounced, dropped, complained"
echo ""
echo "2. Test webhook functionality:"
echo "   - Send a test email"
echo "   - Check webhook events in Mailgun dashboard"
echo "   - Verify database records are updated"
echo ""
echo "3. Monitor email performance:"
echo "   - Check the newsletters table for tracking data"
echo "   - Set up analytics dashboards"
echo "   - Monitor user activity from email engagement"
echo ""
echo "📚 Documentation: docs/EMAIL_TRACKING_SETUP.md"
echo ""
