import React, { useState, useEffect } from 'react';
import { getCountries, addNewsletterContact } from '../utils/api';
import toast from 'react-hot-toast';

const NewsletterSubscription = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    country: '',
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data.data);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch countries');
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await addNewsletterContact(formData);
      console.log(response);

      if (response.success === false) {
        toast.error(response.message || 'Failed to subscribe');
      } else {
        setFormData({ name: '', company: '', email: '', country: '' });
        toast.success('Successfully subscribed to newsletter!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl bg-gray-900">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold mb-4">
          Newsletter Subscription
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 px-4"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-200">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 px-4"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 px-4"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-200">
              Country
            </label>
            <select
              id="country"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 px-4"
            >
              <option value="" className="text-gray-400">
                Select a country
              </option>
              {countries.map((country) => (
                <option key={country.id} value={country.id} className="text-white">
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscription;
