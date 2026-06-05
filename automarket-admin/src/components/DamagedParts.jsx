import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const maxImageSize = 20;

const DamagedParts = ({
  selectedPart = null,
  onPartSelect = null,
  isSelectionMode = false,
  onDamagedPartsData = null,
  initialDamagedParts = [],
}) => {
  const [hoveredPart, setHoveredPart] = useState(null);
  const [partImages, setPartImages] = useState({}); // Store images for each part { partId: [files] }
  const [partImagePreviews, setPartImagePreviews] = useState({}); // Store previews for each part { partId: [previews] }
  const [imageDescriptions, setImageDescriptions] = useState({}); // Store descriptions for each image { partId: [descriptions] }
  const [partDescriptions, setPartDescriptions] = useState({}); // Store general descriptions for each part { partId: [descriptions] }
  const isInitializedRef = useRef(false); // Track if component has been initialized

  // Offset values for all coordinates
  const offsetX = 0; // Adjust this value to move all parts horizontally
  const offsetY = -20; // Adjust this value to move all parts vertically

  // Coordinates array for each car part (x, y positions, scale, zIndex, width, height, name)
  const partCoordinates = [
    { id: 1, x: 250, y: 80, scale: 2.0, zIndex: 8, width: 48, height: 16, name: 'Rear Bumper' },

    {
      id: 2,
      x: 158,
      y: 105,
      scale: 1.8,
      zIndex: 5,
      width: 32,
      height: 24,
      name: 'Rear Right Fender',
    },

    { id: 3, x: 250, y: 125, scale: 1.8, zIndex: 12, width: 52, height: 36, name: 'Trunk/Boot' },

    {
      id: 4,
      x: 340,
      y: 105,
      scale: 1.82,
      zIndex: 5,
      width: 32,
      height: 24,
      name: 'Rear Left Fender',
    },

    { id: 5, x: 167, y: 139, scale: 2, zIndex: 1, width: 40, height: 48, name: 'Rear Right Wheel' },

    { id: 6, x: 332, y: 139, scale: 2, zIndex: 1, width: 40, height: 48, name: 'Rear Left Wheel' },

    {
      id: 7,
      x: 135,
      y: 148,
      scale: 1.5,
      zIndex: 10,
      width: 28,
      height: 28,
      name: 'Rear Right Wheel Well',
    },

    {
      id: 8,
      x: 365,
      y: 147,
      scale: 1.5,
      zIndex: 10,
      width: 28,
      height: 28,
      name: 'Rear Left Wheel Well',
    },

    {
      id: 9,
      x: 132,
      y: 241,
      scale: 2.05,
      zIndex: 5,
      width: 12,
      height: 64,
      name: 'Right Side Sill',
    },

    {
      id: 10,
      x: 180,
      y: 185,
      scale: 2.5,
      zIndex: 15,
      width: 32,
      height: 40,
      name: 'Rear Right Door',
    },

    { id: 11, x: 250, y: 230.5, scale: 2.22, zIndex: 1, width: 65, height: 78, name: 'Roof' },

    {
      id: 12,
      x: 320,
      y: 185,
      scale: 2.5,
      zIndex: 10,
      width: 32,
      height: 40,
      name: 'Rear Left Door',
    },

    {
      id: 13,
      x: 368,
      y: 241,
      scale: 2.05,
      zIndex: 5,
      width: 12,
      height: 64,
      name: 'Left Side Sill',
    },

    {
      id: 14,
      x: 180,
      y: 256,
      scale: 2.5,
      zIndex: 3,
      width: 46,
      height: 32,
      name: 'Front Right Door',
    },

    {
      id: 15,
      x: 320,
      y: 256,
      scale: 2.5,
      zIndex: 3,
      width: 46,
      height: 32,
      name: 'Front Left Door',
    },

    {
      id: 16,
      x: 164,
      y: 338,
      scale: 3.6,
      zIndex: 3,
      width: 40,
      height: 24,
      name: 'Front Right Fender',
    },

    { id: 17, x: 250, y: 335, scale: 6, zIndex: 2, width: 20, height: 28, name: 'Hood/Bonnet' },

    {
      id: 18,
      x: 336,
      y: 338,
      scale: 3.1,
      zIndex: 9,
      width: 20,
      height: 28,
      name: 'Front Left Fender',
    },

    {
      id: 19,
      x: 135,
      y: 332,
      scale: 2.2,
      zIndex: 6,
      width: 20,
      height: 60,
      name: 'Front Right Wheel',
    },

    {
      id: 20,
      x: 363,
      y: 332,
      scale: 2.2,
      zIndex: 6,
      width: 20,
      height: 60,
      name: 'Front Left Wheel',
    },

    {
      id: 21,
      x: 148,
      y: 360,
      scale: 2.1,
      zIndex: 14,
      width: 40,
      height: 24,
      name: 'Right Headlight',
    },

    {
      id: 22,
      x: 352,
      y: 360,
      scale: 2.1,
      zIndex: 14,
      width: 40,
      height: 24,
      name: 'Left Headlight',
    },

    { id: 23, x: 250, y: 410, scale: 2.0, zIndex: 11, width: 48, height: 16, name: 'Front Bumper' },
    { id: 24, x: 250, y: 272, scale: 2, zIndex: 14, width: 40, height: 24, name: 'Windshield' },
    { id: 25, x: 250, y: 165, scale: 1.8, zIndex: 14, width: 40, height: 24, name: 'Rear Window' },
  ];

  // Initialize component with existing damaged parts data - only run once
  useEffect(() => {
    if (initialDamagedParts && initialDamagedParts.length > 0 && !isInitializedRef.current) {
      console.log('DamagedParts: Initializing with existing data:', initialDamagedParts);

      const newPartImages = {};
      const newPartImagePreviews = {};
      const newImageDescriptions = {};
      const newPartDescriptions = {};

      initialDamagedParts.forEach((partData) => {
        const partId = partData.part.toString();

        // Handle images (URLs from existing data)
        if (partData.images && partData.images.length > 0) {
          newPartImages[partId] = partData.images;
          // Create previews for existing images (they're URLs)
          newPartImagePreviews[partId] = partData.images.map((imageUrl, index) => ({
            file: null, // Not a File object, it's a URL
            url: imageUrl,
            name: `existing-image-${index + 1}`,
          }));
        }

        // Handle image descriptions
        if (partData.descriptions && partData.descriptions.length > 0) {
          newImageDescriptions[partId] = partData.descriptions;
        }

        // Handle general part descriptions
        if (partData.partDescriptions && partData.partDescriptions.length > 0) {
          newPartDescriptions[partId] = partData.partDescriptions;
        }
      });

      setPartImages(newPartImages);
      setPartImagePreviews(newPartImagePreviews);
      setImageDescriptions(newImageDescriptions);
      setPartDescriptions(newPartDescriptions);
      isInitializedRef.current = true;
    } else if (!initialDamagedParts || initialDamagedParts.length === 0) {
      // No initial data, just mark as initialized
      isInitializedRef.current = true;
    }
  }, [initialDamagedParts]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(partImagePreviews).forEach((previews) => {
        previews.forEach((preview) => {
          // Only revoke URLs that were created with createObjectURL (not existing image URLs)
          if (preview.file) {
            URL.revokeObjectURL(preview.url);
          }
        });
      });
    };
  }, []);

  // Send damaged parts data to parent whenever partImages, image descriptions, or part descriptions change
  useEffect(() => {
    // Only send data after initialization to prevent overwriting existing data on mount
    if (onDamagedPartsData && isInitializedRef.current) {
      const allPartIds = new Set([
        ...Object.keys(partImages),
        ...Object.keys(imageDescriptions),
        ...Object.keys(partDescriptions),
      ]);
      const damagedPartsArray = Array.from(allPartIds).map((partId) => ({
        part: parseInt(partId),
        partName: getPartName(parseInt(partId)),
        images: partImages[partId] || [],
        descriptions: imageDescriptions[partId] || [],
        partDescriptions: partDescriptions[partId] || [],
      }));
      console.log('DamagedParts: Sending data to parent:', damagedPartsArray);
      console.log('DamagedParts: partImages state:', partImages);
      console.log('DamagedParts: imageDescriptions state:', imageDescriptions);
      console.log('DamagedParts: partDescriptions state:', partDescriptions);
      onDamagedPartsData(damagedPartsArray);
    }
  }, [partImages, imageDescriptions, partDescriptions, onDamagedPartsData]);

  const handleImageChange = (e, partId) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Please upload only image files');
      return;
    }

    // Validate file sizes (max 5MB per file)

    const MAX_SIZE = maxImageSize * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error('Some images exceed the 5MB size limit');
      return;
    }

    // Create preview URLs for new images
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    // Update images for this specific part
    setPartImages((prev) => ({
      ...prev,
      [partId]: [...(prev[partId] || []), ...validFiles],
    }));

    // Update previews for this specific part
    setPartImagePreviews((prev) => ({
      ...prev,
      [partId]: [...(prev[partId] || []), ...newPreviews],
    }));

    // Initialize empty descriptions for new images
    setImageDescriptions((prev) => {
      const currentDescriptions = prev[partId] || [];
      const newDescriptions = new Array(validFiles.length).fill('');
      return {
        ...prev,
        [partId]: [...currentDescriptions, ...newDescriptions],
      };
    });

    toast.success(`${validFiles.length} images added to part ${partId}`);
  };

  const handleRemoveImage = (partId, index) => {
    setPartImages((prev) => ({
      ...prev,
      [partId]: prev[partId].filter((_, i) => i !== index),
    }));

    setPartImagePreviews((prev) => {
      if (prev[partId] && prev[partId][index]) {
        // Only revoke URLs that were created with createObjectURL (not existing image URLs)
        if (prev[partId][index].file) {
          URL.revokeObjectURL(prev[partId][index].url);
        }
      }
      return {
        ...prev,
        [partId]: prev[partId].filter((_, i) => i !== index),
      };
    });

    // Remove the corresponding description
    setImageDescriptions((prev) => {
      const partDescriptions = prev[partId] || [];
      return {
        ...prev,
        [partId]: partDescriptions.filter((_, i) => i !== index),
      };
    });

    toast.success('Image and description removed');
  };

  const handleImageDescriptionChange = (partId, imageIndex, description) => {
    setImageDescriptions((prev) => {
      const partDescriptions = prev[partId] || [];
      const newDescriptions = [...partDescriptions];
      newDescriptions[imageIndex] = description;
      return {
        ...prev,
        [partId]: newDescriptions,
      };
    });
  };

  const handlePartDescriptionChange = (partId, index, description) => {
    setPartDescriptions((prev) => {
      const currentDescriptions = prev[partId] || [];
      const newDescriptions = [...currentDescriptions];
      newDescriptions[index] = description;
      return {
        ...prev,
        [partId]: newDescriptions,
      };
    });
  };

  const handleAddPartDescription = (partId) => {
    console.log('Adding description for part:', partId);
    setPartDescriptions((prev) => {
      const currentDescriptions = prev[partId] || [];
      const newDescriptions = [...currentDescriptions, ''];
      console.log('Updated descriptions for part', partId, ':', newDescriptions);
      return {
        ...prev,
        [partId]: newDescriptions,
      };
    });
  };

  const handleRemovePartDescription = (partId, index) => {
    setPartDescriptions((prev) => {
      const currentDescriptions = prev[partId] || [];
      return {
        ...prev,
        [partId]: currentDescriptions.filter((_, i) => i !== index),
      };
    });
    toast.success('Description removed');
  };

  const getPartName = (partId) => {
    const part = partCoordinates.find((p) => p.id === partId);
    return part ? part.name : `Part ${partId}`;
  };

  return (
    <div className="bg-gray-900 flex flex-col items-center py-6 px-4 text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />

      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Damaged Parts</h2>

        <div className="flex gap-8 items-start justify-center">
          {/* Car Layout Container with absolute positioning */}
          <div className="relative w-[500px] h-[450px] bg-white border-2 border-gray-300 rounded-lg shadow-xl">
            {/* Render each part using coordinates, scale, zIndex, width, and height */}
            {partCoordinates.map((part) => {
              const isSelected = selectedPart === part.id;
              const isHovered = hoveredPart === part.id;

              return (
                <div
                  key={part.id}
                  className="absolute"
                  style={{
                    left: `${part.x + offsetX}px`,
                    top: `${part.y + offsetY}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: part.zIndex,
                  }}
                  onMouseEnter={() => setHoveredPart(part.id)}
                  onMouseLeave={() => setHoveredPart(null)}
                  onClick={() => {
                    if (isSelectionMode && onPartSelect) {
                      onPartSelect(part.id);
                    }
                  }}
                >
                  <img
                    src={`/d${part.id}.svg`}
                    alt={`Part ${part.id}`}
                    className={`transition-all duration-200 ${
                      isSelectionMode ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'scale-110 drop-shadow-2xl'
                        : 'hover:scale-125 hover:drop-shadow-lg'
                    }`}
                    style={{
                      width: `${part.width}px`,
                      height: `${part.height}px`,
                      transform: `scale(${part.scale})`, // Apply individual scale
                      filter: isSelected
                        ? 'sepia(1) saturate(3) hue-rotate(35deg) brightness(1.2)' // Convert white to yellow inside SVG
                        : 'none',
                    }}
                    title={`Car Part ${part.id} (${part.width}x${part.height}px, Scale: ${part.scale}, Z-Index: ${part.zIndex})`}
                  />

                  {/* Number overlay on hover or selection */}
                  {(isHovered || isSelected) && (
                    <div
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none z-50 ${
                        isSelected ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}
                    >
                      {part.id}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Car outline guide (optional visual aid) */}
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg opacity-30 pointer-events-none">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                Front
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                Rear
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-gray-400">
                Left
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-400">
                Right
              </div>
            </div>
          </div>

          {/* Image Upload Section - Only show when a part is selected */}
          {selectedPart && (
            <div className="w-[500px] bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-6 text-center">
                {getPartName(selectedPart)} - Damage Details
              </h3>

              {/* General Part Descriptions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-medium">Damage Descriptions:</label>
                  <button
                    onClick={() => {
                      console.log('Add Description button clicked for part:', selectedPart);
                      console.log('Current partDescriptions state:', partDescriptions);
                      console.log(
                        'Descriptions for selected part:',
                        partDescriptions[selectedPart]
                      );
                      handleAddPartDescription(selectedPart);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
                  >
                    Add Description
                  </button>
                </div>

                {/* Render existing descriptions */}
                {partDescriptions[selectedPart] && partDescriptions[selectedPart].length > 0 ? (
                  <div className="space-y-3">
                    {partDescriptions[selectedPart].map((description, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={description}
                          onChange={(e) =>
                            handlePartDescriptionChange(selectedPart, index, e.target.value)
                          }
                          placeholder={`Description ${index + 1}...`}
                          className="flex-1 p-3 rounded border border-gray-600 bg-gray-600 text-white resize-none h-20 text-sm"
                        />
                        <button
                          onClick={() => handleRemovePartDescription(selectedPart, index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm self-start"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>No descriptions added yet.</p>
                    <p className="text-sm">Click "Add Description" to start documenting damage.</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor={`images-${selectedPart}`}
                  className="text-white mb-3 block font-medium"
                >
                  Upload Images (Max {maxImageSize}MB each) - Optional
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id={`images-${selectedPart}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, selectedPart)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`images-${selectedPart}`}
                    className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Add Images
                  </label>
                  <span className="text-sm text-gray-300">
                    {partImages[selectedPart]?.length || 0}{' '}
                    {(partImages[selectedPart]?.length || 0) === 1 ? 'image' : 'images'} selected
                  </span>
                </div>
              </div>

              {/* Image Previews */}
              {partImagePreviews[selectedPart]?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {partImagePreviews[selectedPart].map((preview, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="relative group mb-3">
                        <img
                          src={preview.url}
                          alt={`${getPartName(selectedPart)} - Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            console.error('Image failed to load:', preview.url);
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                          <button
                            onClick={() => handleRemoveImage(selectedPart, index)}
                            className="self-end text-white hover:text-red-500 text-lg font-bold transition-colors"
                          >
                            ✕
                          </button>
                          <p className="text-white text-xs truncate">{preview.name}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm font-medium block mb-2">
                          Image Description:
                        </label>
                        <textarea
                          value={imageDescriptions[selectedPart]?.[index] || ''}
                          onChange={(e) =>
                            handleImageDescriptionChange(selectedPart, index, e.target.value)
                          }
                          placeholder="Describe the damage in this image..."
                          className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white resize-none h-16 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary of all parts with images and descriptions */}
              {(Object.keys(partImages).length > 0 ||
                Object.keys(imageDescriptions).length > 0 ||
                Object.keys(partDescriptions).length > 0) && (
                <div className="pt-6 border-t border-gray-600">
                  <h4 className="text-lg font-semibold mb-4 text-center">
                    Summary of Damaged Parts:
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Array.from(
                      new Set([
                        ...Object.keys(partImages),
                        ...Object.keys(imageDescriptions),
                        ...Object.keys(partDescriptions),
                      ])
                    ).map((partId) => (
                      <div
                        key={partId}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="font-medium text-white">
                          {getPartName(parseInt(partId))}
                        </div>

                        {/* General Part Descriptions */}
                        {partDescriptions[partId] && partDescriptions[partId].length > 0 && (
                          <div className="text-sm text-gray-300 mt-2">
                            <div className="font-medium">Descriptions:</div>
                            {partDescriptions[partId].map(
                              (desc, index) =>
                                desc && (
                                  <div key={index} className="italic ml-2 mt-1">
                                    {index + 1}. "{desc}"
                                  </div>
                                )
                            )}
                          </div>
                        )}

                        {/* Image Count */}
                        {partImages[partId]?.length > 0 && (
                          <div className="text-sm text-gray-300 mt-1">
                            {partImages[partId]?.length || 0}{' '}
                            {(partImages[partId]?.length || 0) === 1 ? 'image' : 'images'}
                          </div>
                        )}

                        {/* Image Descriptions */}
                        {imageDescriptions[partId] &&
                          imageDescriptions[partId].some((desc) => desc) && (
                            <div className="text-sm text-gray-400 mt-2">
                              <div className="font-medium">Image descriptions:</div>
                              {imageDescriptions[partId].map(
                                (desc, index) =>
                                  desc && (
                                    <div key={index} className="italic ml-2">
                                      Image {index + 1}: "{desc}"
                                    </div>
                                  )
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DamagedParts;
