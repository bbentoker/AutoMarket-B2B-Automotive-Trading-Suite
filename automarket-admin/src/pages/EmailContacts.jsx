import React from 'react';
import NewsletterSubscription from '../components/NewsletterSubscription';
import SendMailsByCountry from '../components/SendMailsByCountry';

const EmailContacts = () => {
  return (
    <div className="flex gap-2 items-start p-6">
      <div className="w-1/2">
        <NewsletterSubscription />
      </div>
      <div className="w-1/2">
        <SendMailsByCountry />
      </div>
    </div>
  );
};

export default EmailContacts;
