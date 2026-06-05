import React, { useState, useEffect } from 'react';
import { getUserWishlistSendingOptions, addOrUpdateWishlistSendingOptions } from '../utils/api';

const WishlistSendingOptionsPopup = ({ user, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    is_sending: false,
    when_to_send: {
      day: 'monday',
      time: '09:00',
    },
  });

  // Load existing options when popup opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserOptions();
    }
  }, [isOpen, user?.id]);

  const loadUserOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserWishlistSendingOptions(user.id);
      if (response.success && response.data) {
        const existingData = response.data.when_to_send || {};
        setFormData({
          is_sending: response.data.is_sending || false,
          when_to_send: {
            day: existingData.days?.[0] || existingData.day || 'monday',
            time: existingData.time || '09:00',
          },
        });
      }
    } catch (error) {
      console.error('Error loading user options:', error);
      // If user doesn't have options yet, keep default values
      if (error.message?.includes('not found')) {
        // Keep default values
      } else {
        setError('Failed to load user settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        user_id: user.id,
        is_sending: formData.is_sending,
        when_to_send: {
          frequency: 'weekly',
          days: [formData.when_to_send.day],
          time: formData.when_to_send.time,
          timezone: 'Europe/Stockholm',
        },
      };

      const response = await addOrUpdateWishlistSendingOptions(payload);
      if (response.success) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDayChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      when_to_send: {
        ...prev.when_to_send,
        day: day,
      },
    }));
  };

  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Wishlist Sending Options</h3>
              <p className="text-sm text-gray-300 mt-1">
                {user?.name || 'Unknown User'} ({user?.email})
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white ml-3">Loading settings...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Form */}
          {!loading && (
            <div className="space-y-6">
              {/* Enable/Disable Sending */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_sending}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_sending: e.target.checked,
                      }))
                    }
                    className="rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-white font-medium">Enable Wishlist Notifications</span>
                    <p className="text-sm text-gray-400">
                      Receive email notifications about wishlist items
                    </p>
                  </div>
                </label>
              </div>

              {/* Day and Time Selection */}
              {formData.is_sending && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Select Day of Week
                    </label>
                    <select
                      value={formData.when_to_send.day}
                      onChange={(e) => handleDayChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {weekDays.map((day) => (
                        <option key={day.key} value={day.key}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notification Time
                    </label>
                    <input
                      type="time"
                      value={formData.when_to_send.time || '09:00'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          when_to_send: {
                            ...prev.when_to_send,
                            time: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-600">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistSendingOptionsPopup;
