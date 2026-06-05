import React, { useState, useEffect, useRef } from 'react';
import {
  getCountries,
  getNewsletterListings,
  sendNewslettersByCountry,
  getNewsletterContactsByCountry,
  removeNewsletterContact,
} from '../utils/api';
import toast from 'react-hot-toast';
import Select from 'react-select';

const SendMailsByCountry = () => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsletterContacts, setNewsletterContacts] = useState([]);
  const countrySelectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch countries
        const countriesData = await getCountries();
        setCountries(countriesData.data);

        // Fetch newsletter listings
        const newsletterData = await getNewsletterListings();
        console.log('Newsletter listings:', newsletterData);
        setListings(newsletterData.listings || []);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch newsletter contacts when countries are selected
  useEffect(() => {
    const fetchNewsletterContacts = async () => {
      if (selectedCountries && selectedCountries.length > 0) {
        try {
          // Extract country IDs and create a mapping for country names
          const countryIds = selectedCountries.map((country) => country.value);
          const countryMap = selectedCountries.reduce((map, country) => {
            map[country.value] = country.label;
            return map;
          }, {});

          // Make a single API call with all country IDs
          const response = await getNewsletterContactsByCountry(countryIds);
          console.log('Newsletter contacts for selected countries:', response);

          if (response.contacts) {
            // Add country name to each contact based on their country_id
            const contactsWithCountryNames = response.contacts.map((contact) => ({
              ...contact,
              countryName: countryMap[contact.country_id] || 'Unknown',
              countryId: contact.country_id,
            }));
            setNewsletterContacts(contactsWithCountryNames);
          } else {
            setNewsletterContacts([]);
          }
        } catch (error) {
          console.error('Error fetching newsletter contacts:', error);
          toast.error(error.message || 'Failed to fetch newsletter contacts');
          setNewsletterContacts([]);
        }
      } else {
        setNewsletterContacts([]);
      }
    };

    fetchNewsletterContacts();
  }, [selectedCountries]);

  // Scroll to country selection when contacts are loaded
  useEffect(() => {
    if (newsletterContacts.length > 0 && countrySelectionRef.current) {
      countrySelectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [newsletterContacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountries || selectedCountries.length === 0) {
      toast.error('Please select at least one country');
      return;
    }

    setLoading(true);
    try {
      const listingIDs = selectedListings.map((listing) => listing.value);
      const countryIds = selectedCountries.map((country) => country.value);

      // Send newsletters to all selected countries in a single request
      await sendNewslettersByCountry(countryIds, listingIDs);

      toast.success('Newsletters sent successfully to all selected countries!');
      setSelectedCountries([]);
      setSelectedListings([]);
    } catch (error) {
      toast.error(error.message || 'Failed to send newsletters');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await removeNewsletterContact(contactId);

      // Remove the contact from the local state
      setNewsletterContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactId)
      );

      toast.success('Newsletter contact removed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to remove newsletter contact');
    }
  };

  return (
    <div className=" mx-auto rounded-xl shadow-md overflow-hidden  bg-gray-900">
      <div className="w-full">
        <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold mb-4">
          Send Newsletters by Country
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={countrySelectionRef}>
            <label className="block text-sm font-medium text-gray-200 mb-2">Select Countries</label>
            <div className="mb-2">
              <button
                type="button"
                onClick={() => {
                  const allCountryOptions = countries.map((country) => ({
                    value: country.id,
                    label: country.name,
                  }));
                  setSelectedCountries(
                    selectedCountries.length === countries.length ? [] : allCountryOptions
                  );
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                {selectedCountries.length === countries.length
                  ? 'Deselect All'
                  : 'Select All Countries'}
              </button>
            </div>
            <Select
              isMulti
              value={selectedCountries}
              onChange={setSelectedCountries}
              options={countries.map((country) => ({
                value: country.id,
                label: country.name,
              }))}
              placeholder="Type to search and select countries..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  borderColor: '#4b5563',
                  color: 'white',
                  minHeight: '48px',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: 'white',
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: '#4f46e5',
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: 'white',
                  ':hover': {
                    backgroundColor: '#6366f1',
                    color: 'white',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                input: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  backgroundColor: '#4b5563',
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                }),
                clearIndicator: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Listings (Optional)
            </label>
            <Select
              isMulti
              value={selectedListings}
              onChange={setSelectedListings}
              options={listings.map((listing) => ({
                value: listing.id,
                label: `${listing.brand_name} ${listing.model} (${listing.registration_number}) - ${listing.listing_price} ${listing.currency}`,
              }))}
              placeholder="Select listings to include..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  borderColor: '#4b5563',
                  color: 'white',
                  minHeight: '48px',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: 'white',
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: '#4f46e5',
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: 'white',
                  ':hover': {
                    backgroundColor: '#6366f1',
                    color: 'white',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9ca3af',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
              }}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Send Newsletters'}
            </button>
          </div>
        </form>

        {/* Newsletter Contacts Display */}
        {selectedCountries.length > 0 && newsletterContacts.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-200 mb-4">
              Newsletter Contacts in Selected Countries ({newsletterContacts.length} total)
            </h3>
            <div className="mb-4 text-sm text-gray-400">
              Countries: {selectedCountries.map((country) => country.label).join(', ')}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {newsletterContacts.map((contact) => (
                    <tr
                      key={`${contact.id}-${contact.countryId}`}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {contact.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {contact.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {contact.countryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          title="Delete contact"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No contacts message */}
        {selectedCountries.length > 0 && newsletterContacts.length === 0 && (
          <div className="mt-6 border-t border-gray-700 pt-6">
            <div className="text-center text-gray-400">
              No newsletter contacts found for the selected countries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMailsByCountry;
