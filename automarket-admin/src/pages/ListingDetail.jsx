import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getListingById,
  getListingStatuses,
  updateListing,
  deleteListing,
  deleteListingPhoto,
} from '../utils/api';
import ListingFeatures from '../components/ListingFeatures';
import DamagedParts from '../components/DamagedParts';

// Part coordinates and names from DamagedParts component
const partCoordinates = [
  { id: 1, name: 'Rear Bumper' },
  { id: 2, name: 'Rear Right Fender' },
  { id: 3, name: 'Trunk/Boot' },
  { id: 4, name: 'Rear Left Fender' },
  { id: 5, name: 'Rear Right Wheel' },
  { id: 6, name: 'Rear Left Wheel' },
  { id: 7, name: 'Rear Right Wheel Well' },
  { id: 8, name: 'Rear Left Wheel Well' },
  { id: 9, name: 'Right Side Sill' },
  { id: 10, name: 'Rear Right Door' },
  { id: 11, name: 'Roof' },
  { id: 12, name: 'Rear Left Door' },
  { id: 13, name: 'Left Side Sill' },
  { id: 14, name: 'Front Right Door' },
  { id: 15, name: 'Front Left Door' },
  { id: 16, name: 'Front Right Fender' },
  { id: 17, name: 'Hood/Bonnet' },
  { id: 18, name: 'Front Left Fender' },
  { id: 19, name: 'Front Right Wheel' },
  { id: 20, name: 'Front Left Wheel' },
  { id: 21, name: 'Right Headlight' },
  { id: 22, name: 'Left Headlight' },
  { id: 23, name: 'Front Bumper' },
  { id: 24, name: 'Windshield' },
  { id: 25, name: 'Rear Window' },
];

// Transform API damaged parts structure to component expected structure
const transformApiDamagedParts = (apiDamagedParts) => {
  // Group by part_id
  const groupedParts = {};

  apiDamagedParts.forEach((item) => {
    const partId = item.part_id;
    if (!groupedParts[partId]) {
      groupedParts[partId] = {
        withPhotos: [],
        withoutPhotos: [],
      };
    }

    if (item.photo) {
      // Has photo - add to images and descriptions arrays
      groupedParts[partId].withPhotos.push({
        photo: item.photo,
        description: item.description || '',
      });
    } else {
      // No photo - add to general descriptions
      groupedParts[partId].withoutPhotos.push(item.description || '');
    }
  });

  // Convert to expected format
  return Object.keys(groupedParts).map((partId) => {
    const partData = groupedParts[partId];
    const partInfo = partCoordinates.find((p) => p.id === parseInt(partId));

    return {
      part: parseInt(partId),
      partName: partInfo ? partInfo.name : `Part ${partId}`,
      images: partData.withPhotos.map((item) => item.photo), // URLs from API
      descriptions: partData.withPhotos.map((item) => item.description), // Descriptions for images
      partDescriptions: partData.withoutPhotos.filter((desc) => desc), // General descriptions (filter out empty)
    };
  });
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originalListing, setOriginalListing] = useState(null);
  const [listing, setListing] = useState(null);
  const [assignedUser, setAssignedUser] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [showDamagedPartsPopup, setShowDamagedPartsPopup] = useState(false);
  const [selectedDamagedPart, setSelectedDamagedPart] = useState(null);
  const [damagedPartsData, setDamagedPartsData] = useState([]); // Store damaged parts data

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch listing details and statuses in parallel
        const [listingResponse, statusData] = await Promise.all([
          getListingById(id, 'en'),
          getListingStatuses(),
        ]);

        // Handle both the new structure with assignedUser and the old structure
        let listingData;
        let assignedUserData = null;

        if (listingResponse && listingResponse.listing) {
          // New structure with listing and assignedUser
          listingData = listingResponse.listing;
          assignedUserData = listingResponse.assignedUser || null;
        } else {
          // Old structure where the response is the listing directly
          listingData = listingResponse;
        }
        console.log(listingData);
        setListing(listingData);
        setOriginalListing(listingData);
        setAssignedUser(assignedUserData);
        setStatuses(statusData || []);

        // Initialize damaged parts data if it exists - transform API structure to component structure
        if (listingData.damagedParts && Array.isArray(listingData.damagedParts)) {
          const transformedDamagedParts = transformApiDamagedParts(listingData.damagedParts);
          setDamagedPartsData(transformedDamagedParts);
        }
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Check for changes whenever listing data or damaged parts change
  useEffect(() => {
    if (originalListing && listing) {
      const listingChanges = Object.keys(listing).some((key) => {
        // Skip comparing certain fields that shouldn't trigger changes
        if (['id', 'created_at', 'updated_at'].includes(key)) return false;
        return listing[key] !== originalListing[key];
      });

      // Check for damaged parts changes - compare transformed data
      const originalApiDamagedParts = originalListing.damagedParts || [];
      const originalTransformedDamagedParts = transformApiDamagedParts(originalApiDamagedParts);
      const damagedPartsChanges =
        JSON.stringify(damagedPartsData) !== JSON.stringify(originalTransformedDamagedParts);

      setHasChanges(listingChanges || damagedPartsChanges);
    }
  }, [listing, originalListing, damagedPartsData]);

  const handleInputChange = (field, value) => {
    setListing((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeaturesChange = (newFeatures) => {
    handleInputChange('features', newFeatures);
  };

  // Handle damaged parts data from DamagedParts component
  const handleDamagedPartsData = (partsData) => {
    console.log('ListingDetail: Received damaged parts data:', partsData);
    setDamagedPartsData(partsData);
    setHasChanges(true); // Mark as having changes
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setUpdating(true);
    setError(null);

    try {
      // Create JSON data structure for updating listing
      const listingToUpdate = {
        ...listing,
        features: listing.features || '',
      };

      // Add damaged parts data in JSON format if exists
      if (damagedPartsData.length > 0) {
        console.log('Damaged parts data before JSON conversion:', damagedPartsData);

        // Convert damaged parts to the API format
        const damagedPartsForAPI = [];

        damagedPartsData.forEach((partData) => {
          // Add general descriptions (without images)
          if (partData.partDescriptions && partData.partDescriptions.length > 0) {
            partData.partDescriptions.forEach((description) => {
              if (description.trim()) {
                damagedPartsForAPI.push({
                  part_id: partData.part,
                  description: description.trim(),
                  photo: null, // No photo for general descriptions
                });
              }
            });
          }

          // Add image descriptions (with photos)
          if (partData.images && partData.images.length > 0) {
            partData.images.forEach((image, imageIndex) => {
              // For existing images (URLs), keep the URL
              // For new images (File objects), we'll need to handle differently
              if (typeof image === 'string') {
                // Existing image URL
                const description =
                  partData.descriptions && partData.descriptions[imageIndex]
                    ? partData.descriptions[imageIndex]
                    : '';

                damagedPartsForAPI.push({
                  part_id: partData.part,
                  description: description,
                  photo: image,
                });
              } else {
                // New image file - for now, skip as we can't upload via JSON
                // TODO: Handle new image uploads separately
                console.warn(
                  'New image files cannot be uploaded via JSON update. Use FormData endpoint.'
                );
              }
            });
          }
        });

        listingToUpdate.damagedParts = damagedPartsForAPI;
        console.log('Converted damaged parts for API:', damagedPartsForAPI);
      }

      console.log('Final listing data to update:', listingToUpdate);

      const updatedListing = await updateListing(id, listingToUpdate);

      setListing(updatedListing);
      setOriginalListing(updatedListing);
      setHasChanges(false);
      // Show success message (you could add a toast notification here)
      console.log('Listing updated successfully');
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to update listing');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setListing(originalListing);
    // Reset damaged parts data to original state (transformed)
    if (originalListing.damagedParts && Array.isArray(originalListing.damagedParts)) {
      const transformedDamagedParts = transformApiDamagedParts(originalListing.damagedParts);
      setDamagedPartsData(transformedDamagedParts);
    } else {
      setDamagedPartsData([]);
    }
    setHasChanges(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this listing: ${listing.brand_name} ${listing.model}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setUpdating(true);
    setError(null);

    try {
      await deleteListing(id);
      console.log('Listing deleted successfully');
      // Navigate back to the previous page or listings page
      navigate(-1);
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoDelete = async (photoId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this photo? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setDeletingPhoto(photoId);
    setError(null);

    try {
      await deleteListingPhoto(id, photoId);
      console.log('Photo deleted successfully');

      // Remove the photo from the local state
      setListing((prev) => ({
        ...prev,
        photos: prev.photos.filter((photo) => photo.id !== photoId),
      }));

      // Update original listing as well to prevent triggering hasChanges
      setOriginalListing((prev) => ({
        ...prev,
        photos: prev.photos.filter((photo) => photo.id !== photoId),
      }));
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-blue-400">Loading listing details...</div>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-400">{error || 'Listing not found'}</div>
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
    <div className="min-h-screen bg-gray-900 p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            {listing.brand_name} {listing.model}
          </h1>
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

        {/* Assigned User Card - Only show if user is assigned */}
        {assignedUser && (
          <div className="mb-6 bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">👤 Assigned to</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name:</label>
                <div className="text-white font-medium text-lg">{assignedUser.name}</div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email:</label>
                <div className="text-white text-lg">{assignedUser.email}</div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Company:</label>
                <div className="text-white text-lg">
                  {assignedUser.company_name || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First Row - Vehicle Details and Additional Information */}
        <div className="flex gap-6 mb-6">
          {/* Main Details - Left Column */}
          <div className="w-1/2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-4">Vehicle Details</h2>

              {/* Mandatory Fields First - Grid Layout */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Horsepower *</label>
                  <input
                    type="text"
                    value={listing.horsepower || ''}
                    onChange={(e) => handleInputChange('horsepower', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Registration Number *</label>
                  <input
                    type="text"
                    value={listing.registration_number || ''}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Listing Price € *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={listing.listing_price || ''}
                    onChange={(e) =>
                      handleInputChange('listing_price', parseFloat(e.target.value) || '')
                    }
                    onWheel={(e) => e.target.blur()}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={listing.brand_name || ''}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Model *</label>
                  <input
                    type="text"
                    value={listing.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">KM Stand *</label>
                  <input
                    type="number"
                    value={listing.km_stand || ''}
                    onChange={(e) => handleInputChange('km_stand', parseInt(e.target.value) || '')}
                    onWheel={(e) => e.target.blur()}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">VIN Number *</label>
                  <input
                    type="text"
                    value={listing.vin_number || ''}
                    onChange={(e) => handleInputChange('vin_number', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Transmission Type *</label>
                  <select
                    value={listing.transmission_type || ''}
                    onChange={(e) => handleInputChange('transmission_type', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  >
                    <option value="">Select Transmission Type</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Seats *</label>
                  <input
                    type="number"
                    value={listing.seat || ''}
                    onChange={(e) => handleInputChange('seat', parseInt(e.target.value) || '')}
                    onWheel={(e) => e.target.blur()}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">VAT *</label>
                  <select
                    value={listing.vat_or_margin || ''}
                    onChange={(e) => handleInputChange('vat_or_margin', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  >
                    <option value="Excl. VAT">Excl. VAT</option>
                    <option value="Incl. VAT">Incl. VAT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="w-1/2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-xl font-bold text-white mb-4">Additional Information</h2>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-6">
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">First Registration</label>
                  <input
                    type="date"
                    value={
                      listing.first_registration ? listing.first_registration.split('T')[0] : ''
                    }
                    onChange={(e) => handleInputChange('first_registration', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Exterior Color</label>
                  <input
                    type="text"
                    value={listing.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Exterior Color"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Interior Color</label>
                  <input
                    type="text"
                    value={listing.interior_color || ''}
                    onChange={(e) => handleInputChange('interior_color', e.target.value)}
                    placeholder="Interior Color"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Fuel Type</label>
                  <input
                    type="text"
                    value={listing.fuel_type || ''}
                    onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Engine</label>
                  <input
                    type="text"
                    value={listing.engine || ''}
                    onChange={(e) => handleInputChange('engine', e.target.value)}
                    placeholder="Engine"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Location</label>
                  <input
                    type="text"
                    value={listing.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Location"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Vehicle Category</label>
                  <input
                    type="text"
                    value={listing.vehicle_category || ''}
                    onChange={(e) => handleInputChange('vehicle_category', e.target.value)}
                    placeholder="Vehicle Category"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Trim Package</label>
                  <input
                    type="text"
                    value={listing.trim_package || ''}
                    onChange={(e) => handleInputChange('trim_package', e.target.value)}
                    placeholder="Trim Package"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Service History</label>
                  <input
                    type="text"
                    value={listing.service_history || ''}
                    onChange={(e) => handleInputChange('service_history', e.target.value)}
                    placeholder="Service History"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Number of Owners</label>
                  <input
                    type="number"
                    min="0"
                    value={listing.number_of_owners || ''}
                    onChange={(e) => handleInputChange('number_of_owners', e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="Number of Owners"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={listing.status_id || ''}
                    onChange={(e) => handleInputChange('status_id', parseInt(e.target.value))}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Expiration (hours)</label>
                  <select
                    value={listing.expires_in || '48'}
                    onChange={(e) => handleInputChange('expires_in', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  >
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="120">120 hours</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Currency</label>
                  <input
                    type="text"
                    value={listing.currency || ''}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="EUR, USD, etc."
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">CO2 Emissions</label>
                  <input
                    type="text"
                    value={listing.co2 || ''}
                    onChange={(e) => handleInputChange('co2', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Belgium Price</label>
                  <input
                    type="text"
                    value={listing.belgium_price || ''}
                    onChange={(e) => handleInputChange('belgium_price', e.target.value)}
                    placeholder="Belgium Price"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Avg Selling Time</label>
                  <input
                    type="number"
                    value={listing.avg_selling_time || ''}
                    onChange={(e) => handleInputChange('avg_selling_time', e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 18"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Transport Cost €</label>
                  <input
                    type="text"
                    value={listing.transport_cost || ''}
                    onChange={(e) => handleInputChange('transport_cost', e.target.value)}
                    placeholder="Transport Cost €"
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Link to ListingSiteA</label>
                  <input
                    type="url"
                    value={listing.listingsitea_link || ''}
                    onChange={(e) => handleInputChange('listingsitea_link', e.target.value)}
                    placeholder="https://www.listingsitea.example.com/..."
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Internal URL</label>
                  <input
                    type="text"
                    value={listing.internal_url || ''}
                    onChange={(e) => handleInputChange('internal_url', e.target.value)}
                    className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-400 text-sm mb-1">Previous Accidents</label>
                  <div className="flex items-center p-2">
                    <input
                      type="checkbox"
                      checked={listing.previous_accidents || false}
                      onChange={(e) => handleInputChange('previous_accidents', e.target.checked)}
                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white text-sm">Previous accidents</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-3">System Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Listing ID:</span>
                    <span className="text-white">{listing.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{formatDate(listing.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{formatDate(listing.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Information Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-500">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            🏢 Seller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Seller Company</label>
              <input
                type="text"
                value={listing.seller_company || ''}
                onChange={(e) => handleInputChange('seller_company', e.target.value)}
                placeholder="Seller Company"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Seller Email</label>
              <input
                type="email"
                value={listing.seller_email || ''}
                onChange={(e) => handleInputChange('seller_email', e.target.value)}
                placeholder="Seller Email"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Telephone</label>
              <input
                type="tel"
                value={listing.telephone || ''}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="Telephone"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Amount Purchased €</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={listing.amount_purchased || ''}
                onChange={(e) =>
                  handleInputChange('amount_purchased', parseFloat(e.target.value) || '')
                }
                onWheel={(e) => e.target.blur()}
                placeholder="Amount Purchased €"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-gray-400 text-sm mb-1">Seller Address</label>
              <textarea
                value={listing.seller_address || ''}
                onChange={(e) => handleInputChange('seller_address', e.target.value)}
                placeholder="Seller Address"
                rows="3"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white resize-vertical"
              />
            </div>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            📸 Photo Gallery ({listing.photos?.length || 0} photos)
          </h2>
          {listing.photos && listing.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listing.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group bg-gray-700 rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={photo.url}
                    alt={`Car photo ${photo.id}`}
                    className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-32 bg-gray-600 items-center justify-center text-gray-400 text-sm">
                    Image not available
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handlePhotoDelete(photo.id)}
                      disabled={deletingPhoto === photo.id}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        deletingPhoto === photo.id
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {deletingPhoto === photo.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{photo.id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No photos available for this listing.</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Features</h2>
          <ListingFeatures
            features={listing.features || ''}
            onFeaturesChange={handleFeaturesChange}
          />
        </div>

        {/* Damaged Parts Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">🔧 Damaged Parts</h2>

          <div className="mb-4">
            <button
              onClick={() => setShowDamagedPartsPopup(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Manage Damaged Parts
            </button>
          </div>

          {/* Damaged Parts Preview */}
          {damagedPartsData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white text-sm font-semibold mb-3">Current Damaged Parts:</h4>
              <div className="flex flex-wrap gap-4">
                {damagedPartsData.map((partData, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 p-3 rounded-lg w-fit min-w-48 max-w-96 flex-shrink-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">
                        {partData.partName || `Part ${partData.part}`}
                      </h5>
                      <button
                        onClick={() => {
                          const updatedDamagedParts = damagedPartsData.filter(
                            (_, i) => i !== index
                          );
                          setDamagedPartsData(updatedDamagedParts);
                          setHasChanges(true);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Display general descriptions if available */}
                    {partData.partDescriptions && partData.partDescriptions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-300 text-xs mb-2 font-medium">
                          General Descriptions:
                        </p>
                        <div className="space-y-1">
                          {partData.partDescriptions.map(
                            (desc, descIndex) =>
                              desc && (
                                <div
                                  key={descIndex}
                                  className="text-gray-300 text-xs bg-gray-600 p-2 rounded"
                                >
                                  {descIndex + 1}. {desc}
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Display images if available */}
                    {partData.images && partData.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-300 text-xs mb-2 font-medium">
                          Images: {partData.images.length} image
                          {partData.images.length !== 1 ? 's' : ''}
                        </p>
                        <div className="max-h-40 overflow-y-auto">
                          <div className="grid grid-cols-4 gap-2">
                            {partData.images.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group flex-shrink-0">
                                <img
                                  src={
                                    typeof image === 'string' ? image : URL.createObjectURL(image)
                                  }
                                  alt={`${partData.partName || partData.part} damage ${imageIndex + 1}`}
                                  className="w-full h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                {/* Display description below each image if available */}
                                {partData.descriptions && partData.descriptions[imageIndex] && (
                                  <div className="mt-1">
                                    <p className="text-gray-300 text-xs bg-gray-600 p-1 rounded break-words">
                                      {partData.descriptions[imageIndex]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Damaged Parts Popup */}
        {showDamagedPartsPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-8xl max-h-[90vh] overflow-y-auto p-5">
              <h3 className="text-white text-lg font-semibold mb-4">Manage Damaged Parts</h3>
              <DamagedParts
                selectedPart={selectedDamagedPart}
                onPartSelect={(partId) => {
                  setSelectedDamagedPart(selectedDamagedPart === partId ? null : partId);
                }}
                isSelectionMode={true}
                onDamagedPartsData={handleDamagedPartsData}
                initialDamagedParts={damagedPartsData}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-300 text-sm">
                  {selectedDamagedPart
                    ? `Selected Part: ${selectedDamagedPart}`
                    : 'No part selected'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDamagedPartsPopup(false);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDamagedPartsPopup(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || updating}
            className={`px-6 py-2 rounded font-medium ${
              hasChanges && !updating
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={!hasChanges || updating}
            className={`px-6 py-2 rounded font-medium ${
              hasChanges && !updating
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Cancel Changes
          </button>
          <button
            onClick={handleDelete}
            disabled={updating}
            className={`px-6 py-2 rounded ${
              updating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {updating ? 'Processing...' : 'Delete Listing'}
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Print Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
