const emailService = require('./src/services/emailService');
const Newsletter = require('./src/models/Newsletter');
const NewsletterContact = require('./src/models/NewsletterContact');

// Load environment variables
require('dotenv').config();

async function testEmailTracking() {
  try {
    console.log('🧪 Testing Email Tracking Setup...\n');

    // Test 1: Send a welcome email with tracking
    console.log('📧 Test 1: Sending welcome email with tracking...');
    const welcomeResult = await emailService.sendEmail('welcome', 'test@example.com', {
      userName: 'Test User',
      companyName: 'Test Company',
      email: 'test@example.com'
    });
    console.log('✅ Welcome email sent:', welcomeResult.data?.id);

    // Test 2: Send a password reset email with tracking
    console.log('\n📧 Test 2: Sending password reset email with tracking...');
    const resetResult = await emailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      '123456',
      'en'
    );
    console.log('✅ Password reset email sent:', resetResult.data?.id);

    // Test 3: Send a stage email with tracking
    console.log('\n📧 Test 3: Sending stage email with tracking...');
    const stageResult = await emailService.sendStageEmail(
      'Reserved',
      'test@example.com',
      {
        userName: 'Test User',
        listingId: 1,
        stageName: 'Reserved'
      },
      'en',
      { id: 1, brand_name: 'Test Car', model: 'Test Model' }
    );
    console.log('✅ Stage email sent:', stageResult.data?.id);

    // Test 4: Check database records
    console.log('\n📊 Test 4: Checking database records...');
    const newsletters = await Newsletter.findAll({
      where: { recipient_email: 'test@example.com' },
      order: [['created_at', 'DESC']],
      include: [{ model: NewsletterContact, as: 'contact' }]
    });

    console.log(`✅ Found ${newsletters.length} newsletter records:`);
    newsletters.forEach((newsletter, index) => {
      console.log(`  ${index + 1}. ID: ${newsletter.id}, Type: ${newsletter.email_type}, Opened: ${newsletter.is_opened}`);
    });

    // Test 5: Check newsletter contacts
    console.log('\n📊 Test 5: Checking newsletter contacts...');
    const contacts = await NewsletterContact.findAll({
      where: { email: 'test@example.com' }
    });

    console.log(`✅ Found ${contacts.length} contact records:`);
    contacts.forEach((contact, index) => {
      console.log(`  ${index + 1}. ID: ${contact.id}, Name: ${contact.name}, Company: ${contact.company}`);
    });

    // Test 6: Email performance summary
    console.log('\n📊 Test 6: Email performance summary...');
    const emailStats = await Newsletter.findAll({
      attributes: [
        'email_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_sent'],
        [require('sequelize').fn('COUNT', require('sequelize').col('is_opened')), 'total_opened']
      ],
      group: ['email_type']
    });

    console.log('✅ Email statistics:');
    emailStats.forEach(stat => {
      const totalSent = parseInt(stat.dataValues.total_sent);
      const totalOpened = parseInt(stat.dataValues.total_opened);
      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : '0.00';
      
      console.log(`  ${stat.email_type}: ${totalSent} sent, ${totalOpened} opened (${openRate}% open rate)`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Configure Mailgun webhooks to point to your /api/mailgun endpoint');
    console.log('2. Send test emails and check webhook events');
    console.log('3. Monitor the database for tracking updates');
    console.log('4. Set up monitoring and analytics dashboards');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEmailTracking();
