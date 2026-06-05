import { useState, useEffect } from 'react';
import { registerDealer, getCountries } from '../utils/api';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

const AddDealer = () => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  // Form state for dealer registration
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company_name: '',
    phone_number: '',
    vat_number: '',
    password: '',
    language: 'en', // Default to English
    country: '',
  });

  // Fetch countries on component mount
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

  // Update form field
  const updateFormField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formState.name || !formState.email || !formState.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formState.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const dealerData = {
        name: formState.name,
        email: formState.email,
        company_name: formState.company_name,
        phone_number: formState.phone_number,
        vat_number: formState.vat_number,
        password: formState.password,
        language: formState.language,
        country: formState.country,
      };

      const response = await registerDealer(dealerData);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Show success message
      toast.success('Dealer registered successfully!');

      // Reset the form
      setFormState({
        name: '',
        email: '',
        company_name: '',
        phone_number: '',
        vat_number: '',
        password: '',
        language: 'en',
        country: '',
      });
    } catch (error) {
      console.error('Error registering dealer:', error);
      toast.error(`Error registering dealer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-white mb-5 text-2xl font-bold">Add Dealer</h2>

        {loading && (
          <div className="text-white mb-5 w-full flex justify-center">
            Loading... <span className="loader ml-2"></span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-white mb-1">
              Dealer Name *
            </label>
            <input
              id="name"
              type="text"
              value={formState.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="Enter dealer name"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-white mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => updateFormField('email', e.target.value)}
              placeholder="Enter email address"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="company_name" className="text-white mb-1">
              Company Name
            </label>
            <input
              id="company_name"
              type="text"
              value={formState.company_name}
              onChange={(e) => updateFormField('company_name', e.target.value)}
              placeholder="Enter company name"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone_number" className="text-white mb-1">
              Phone Number
            </label>
            <input
              id="phone_number"
              type="text"
              value={formState.phone_number}
              onChange={(e) => updateFormField('phone_number', e.target.value)}
              placeholder="Enter phone number"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="vat_number" className="text-white mb-1">
              VAT Number
            </label>
            <input
              id="vat_number"
              type="text"
              value={formState.vat_number}
              onChange={(e) => updateFormField('vat_number', e.target.value)}
              placeholder="Enter VAT number"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-white mb-1">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formState.password}
              onChange={(e) => updateFormField('password', e.target.value)}
              placeholder="Enter password (min 6 characters)"
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="language" className="text-white mb-1">
              Language
            </label>
            <select
              id="language"
              value={formState.language}
              onChange={(e) => updateFormField('language', e.target.value)}
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="country" className="text-white mb-1">
              Country
            </label>
            <select
              id="country"
              value={formState.country}
              onChange={(e) => updateFormField('country', e.target.value)}
              className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
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
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="p-2 px-6 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Dealer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDealer;
