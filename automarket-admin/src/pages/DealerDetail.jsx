import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserStatuses, updateDealerStatus, getDealerById, updateDealer } from '../utils/api';
import toast from 'react-hot-toast';

const DealerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originalDealer, setOriginalDealer] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dealer details and statuses in parallel
        const [dealerData, statusData] = await Promise.all([getDealerById(id), getUserStatuses()]);

        setDealer(dealerData);
        setOriginalDealer(dealerData);
        setStatuses(Array.isArray(statusData) ? statusData : []); // Ensure statuses is always an array
      } catch (err) {
        console.error('Error fetching dealer details:', err);
        setError('Failed to load dealer details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Check for changes whenever dealer data changes
  useEffect(() => {
    if (originalDealer && dealer) {
      const changes = Object.keys(dealer).some((key) => {
        // Skip comparing certain fields that shouldn't trigger changes
        if (['id', 'created_at', 'updated_at'].includes(key)) return false;
        return dealer[key] !== originalDealer[key];
      });
      setHasChanges(changes);
    }
  }, [dealer, originalDealer]);

  const handleInputChange = (field, value) => {
    setDealer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatusChange = async (newStatusId) => {
    setUpdating(true);
    const loadingToastId = toast.loading('Updating dealer status...');

    try {
      await updateDealerStatus(dealer.id, parseInt(newStatusId));

      setDealer((prev) => ({
        ...prev,
        status_id: parseInt(newStatusId),
      }));
      setOriginalDealer((prev) => ({
        ...prev,
        status_id: parseInt(newStatusId),
      }));

      toast.success('Successfully updated dealer status', { id: loadingToastId });
      setHasChanges(false);
    } catch (err) {
      console.error('Error updating dealer status:', err);
      toast.error('Failed to update dealer status', { id: loadingToastId });
      setError('Failed to update dealer status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setUpdating(true);
    const loadingToastId = toast.loading('Updating dealer information...');

    try {
      const updatedDealer = await updateDealer(id, {
        name: dealer.name,
        email: dealer.email,
        company_name: dealer.company_name,
        phone_number: dealer.phone_number,
        vat_number: dealer.vat_number,
        website: dealer.website,
        listingsitea_url: dealer.listingsitea_url,
        billing_street: dealer.billing_street,
        billing_city: dealer.billing_city,
        billing_state: dealer.billing_state,
        billing_country: dealer.billing_country,
        billing_code: dealer.billing_code,
        language: dealer.language,
      });

      setDealer(updatedDealer.dealer);
      setOriginalDealer(updatedDealer.dealer);
      setHasChanges(false);
      toast.success(updatedDealer.message || 'Dealer information updated successfully', {
        id: loadingToastId,
      });

      // Reload the page after successful update
      window.location.reload();
    } catch (err) {
      console.error('Error updating dealer:', err);
      toast.error('Failed to update dealer information', { id: loadingToastId });
      setError('Failed to update dealer');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setDealer(originalDealer);
    setHasChanges(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-blue-400">Loading dealer details...</div>
        </div>
      </div>
    );
  }

  if (error && !dealer) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-400">{error || 'Dealer not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dealer: {dealer?.name}</h1>
          <div className="flex items-center space-x-4">
            {hasChanges && <span className="text-yellow-400 font-medium">⚠️ Changes made</span>}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-600 text-white rounded">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name:</label>
                <input
                  type="text"
                  value={dealer?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email:</label>
                <input
                  type="email"
                  value={dealer?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Company Name:</label>
                <input
                  type="text"
                  value={dealer?.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Phone Number:</label>
                <input
                  type="text"
                  value={dealer?.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">VAT Number:</label>
                <input
                  type="text"
                  value={dealer?.vat_number || ''}
                  onChange={(e) => handleInputChange('vat_number', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Website:</label>
                <input
                  type="url"
                  value={dealer?.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">ListingSiteA URL:</label>
                <input
                  type="url"
                  value={dealer?.listingsitea_url || ''}
                  onChange={(e) => handleInputChange('listingsitea_url', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Status:</label>
                <select
                  value={dealer?.status_id || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Language:</label>
                <select
                  value={dealer?.language || ''}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                >
                  <option value="">Select Language</option>
                  <option value="en">English</option>
                  <option value="nl">Nederlands</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Billing Information Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Billing Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Street:</label>
                <input
                  type="text"
                  value={dealer?.billing_street || ''}
                  onChange={(e) => handleInputChange('billing_street', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">City:</label>
                <input
                  type="text"
                  value={dealer?.billing_city || ''}
                  onChange={(e) => handleInputChange('billing_city', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">State:</label>
                <input
                  type="text"
                  value={dealer?.billing_state || ''}
                  onChange={(e) => handleInputChange('billing_state', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Country:</label>
                <input
                  type="text"
                  value={dealer?.billing_country || ''}
                  onChange={(e) => handleInputChange('billing_country', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Postal Code:</label>
                <input
                  type="text"
                  value={dealer?.billing_code || ''}
                  onChange={(e) => handleInputChange('billing_code', e.target.value)}
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Last Updated:</label>
                <div className="text-white">{formatDate(dealer?.updated_at)}</div>
              </div>
              {/* Actions Field */}
              <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || updating}
                  className={`w-full px-4 py-2 rounded ${
                    !hasChanges || updating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!hasChanges || updating}
                  className={`w-full px-4 py-2 rounded ${
                    !hasChanges || updating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Cancel Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDetail;
