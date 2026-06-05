import React, { useState, useEffect } from 'react';

const ListingFeatures = ({ features, onFeaturesChange }) => {
  const [featureList, setFeatureList] = useState(features.split(',').map((f) => f.trim()));
  const [showPopup, setShowPopup] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    setFeatureList(features.split(',').map((f) => f.trim()));
  }, [features]);

  const removeFeature = (index) => {
    const updatedFeatures = featureList.filter((_, i) => i !== index);
    setFeatureList(updatedFeatures);
    onFeaturesChange(updatedFeatures.join(', '));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...featureList, newFeature.trim()];
      setFeatureList(updatedFeatures);
      onFeaturesChange(updatedFeatures.join(', '));
      setNewFeature('');
      setShowPopup(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {featureList.map((feature, index) => (
        <div key={index} className="flex items-center bg-gray-700 text-white p-1 rounded text-xs">
          <span>{feature}</span>
          <button
            onClick={() => removeFeature(index)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => setShowPopup(true)}
        className="flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-full"
      >
        +
      </button>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded">
            <h3 className="mb-3">Add Feature</h3>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-3"
              placeholder="Enter feature"
            />
            <button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded">
              Add
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="p-2 ml-2 bg-red-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingFeatures;
