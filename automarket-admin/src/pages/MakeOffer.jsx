import React, { useEffect, useState } from 'react';
import { getListings, createOffer } from '../utils/api';

const MakeOffer = () => {
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await getListings({ statusId: 1 });
        setListings(data.listings || []);
      } catch {
        setError('Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleListingChange = (e) => {
    setSelectedListingId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedListingId || !form.name || !form.email || !form.amount) {
      setError('Please fill all fields and select a listing.');
      return;
    }
    const payload = {
      dealer: { name: form.name, email: form.email },
      offer: { amount: form.amount },
      listing_id: selectedListingId,
    };
    setLoading(true);
    try {
      await createOffer(payload);
      setSuccess('Offer submitted successfully!');
      setForm({ name: '', email: '', amount: '' });
      setSelectedListingId('');
    } catch {
      setError('Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Make an Offer</h2>
      {loading && <div className="text-blue-400 mb-4">Loading...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {success && <div className="text-green-400 mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Select Listing</label>
          <select
            value={selectedListingId}
            onChange={handleListingChange}
            className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
          >
            <option value="">-- Select a listing --</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.brand_name} {listing.model} (ID: {listing.id})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Offer Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          Submit Offer
        </button>
      </form>
    </div>
  );
};

export default MakeOffer;
