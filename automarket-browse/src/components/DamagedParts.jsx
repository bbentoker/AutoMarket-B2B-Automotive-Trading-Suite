import React, { useState, useEffect } from 'react';
import { getCarListingDamagedParts } from '../services/api';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
// {
//   "damagedParts": [
//       {
//           "id": 34,
//           "listing_id": 182,
//           "part_id": 17,
//           "photo": base64 
//           "description": null,
//           "created_at": "2025-06-20T13:58:53.993Z",
//           "updated_at": "2025-06-20T13:58:53.993Z"
//       }
//   ]
// }
const DamagedParts = ({
  damagedPartsData = [],
  selectedPart = null,
  onPartSelect = null,
  isSelectionMode = false,
}) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [fetchedDamagedParts, setFetchedDamagedParts] = useState([]);

  // Use fetched data if available, otherwise use prop data
  const activeDamagedPartsData = fetchedDamagedParts.length > 0 ? fetchedDamagedParts : damagedPartsData;

  useEffect(() => {
    const fetchDamagedParts = async () => {
      try {
        const response = await getCarListingDamagedParts(id);
        console.log('Damaged parts response:', response);
        
        // Check if response has damagedParts and set the data
        if (response && response.damagedParts && Array.isArray(response.damagedParts)) {
          setFetchedDamagedParts(response.damagedParts);
        } else if (response && Array.isArray(response)) {
          // In case the response is directly an array
          setFetchedDamagedParts(response);
        } else {
          setFetchedDamagedParts([]);
        }
      } catch (error) {
        console.error('Error fetching damaged parts:', error);
        setFetchedDamagedParts([]);
      }
    };
    
    if (id) {
      fetchDamagedParts();
    }
  }, [id]);

  // Helper function to format image data
  const formatImageSrc = (imageData) => {
    if (!imageData) return '';
    
    // If it's already a data URL, return as is
    if (imageData.startsWith('data:image/')) {
      return imageData;
    }
    
    // If it's an HTTP/HTTPS URL, return as is
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData;
    }
    
    // If it's just the base64 string, add the proper data URL prefix
    // Try to detect the image format or default to jpeg
    const imagePrefix = imageData.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
    return `${imagePrefix}${imageData}`;
  };

  // Offset values for all coordinates
  const offsetX = -42; // Adjust this value to move all parts horizontally
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




  // Helper functions for damaged parts
  const getPartName = (partId) => {
    const part = partCoordinates.find((p) => p.id === partId);
    return part ? t(`condition.part${partId}`) : t('condition.part', { id: partId });
  };

  const isDamagedPart = (partId) => {
    return activeDamagedPartsData.some(item => item.part_id === partId);
  };

  const getDamagedPartData = (partId) => {
    return activeDamagedPartsData.filter(item => item.part_id === partId);
  };

  const getDamagedPartsWithDetails = () => {
    const damagedParts = [];
    activeDamagedPartsData.forEach(item => {
      const partName = getPartName(item.part_id);
      const existingPart = damagedParts.find(p => p.part_id === item.part_id);
      
      if (existingPart) {
        // Only add image if it exists
        if (item.photo) {
          existingPart.images.push(item.photo);
        }
        if (item.description && !existingPart.descriptions.includes(item.description)) {
          existingPart.descriptions.push(item.description);
        }
      } else {
        damagedParts.push({
          part_id: item.part_id,
          partName,
          descriptions: item.description ? [item.description] : [],
          images: item.photo ? [item.photo] : []
        });
      }
    });
    return damagedParts;
  };

  const handlePartClick = (partId) => {
    if (isSelectionMode && onPartSelect) {
      onPartSelect(partId);
    }
  };

  const handlePartHover = (partId) => {
    const damagedData = getDamagedPartData(partId);
    if (damagedData.length > 0) {
      const images = damagedData.map(item => item.photo).filter(photo => photo);
      const descriptions = damagedData.filter(item => item.description).map(item => item.description);
      
      // Only show modal if there are images or descriptions
      if (images.length > 0 || descriptions.length > 0) {
        setSelectedImageModal({
          partId,
          partName: getPartName(partId),
          images,
          descriptions
        });
      }
    }
  };

  const handleDescriptionClick = (partId) => {
    const damagedData = getDamagedPartData(partId);
    if (damagedData.length > 0) {
      const images = damagedData.map(item => item.photo).filter(photo => photo);
      const descriptions = damagedData.filter(item => item.description).map(item => item.description);
      
      // Only show modal if there are images or descriptions
      if (images.length > 0 || descriptions.length > 0) {
        setSelectedImageModal({
          partId,
          partName: getPartName(partId),
          images,
          descriptions
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-white">
    

      <div className="w-full flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
        <div className="flex gap-8 items-start justify-center w-full md:w-3/5">
          {/* Car Layout Container with absolute positioning */}
          <div className="relative w-full max-w-[500px] h-[300px] md:h-[450px] mx-auto">
            {/* Render each part using coordinates, scale, zIndex, width, and height */}
            {partCoordinates.map((part) => {
              const isSelected = selectedPart === part.id;
              const isDamaged = isDamagedPart(part.id);
              
              // Scale down for mobile
              const mobileScale = 0.6;
              const isMobile = window.innerWidth < 768;
              const adjustedScale = isMobile ? part.scale * mobileScale : part.scale;
              const adjustedX = isMobile ? (part.x + offsetX) * mobileScale + 50 : part.x + offsetX;
              const adjustedY = isMobile ? (part.y + offsetY) * mobileScale + 30 : part.y + offsetY;

              return (
                <div
                  key={part.id}
                  className="absolute"
                  style={{
                    left: `${adjustedX}px`,
                    top: `${adjustedY}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: part.zIndex,
                  }}
                  onMouseEnter={() => {
                    if (isDamaged) {
                      handlePartHover(part.id);
                    }
                  }}
                  onMouseLeave={() => {
                    // Clear any hover effects if needed
                  }}
                  onClick={() => handlePartClick(part.id)}
                >
                  <img
                    src={isDamaged ? `/d${part.id}-yellow.svg` : `/d${part.id}.svg`}
                    alt={`Part ${part.id}`}
                    className={`transition-all duration-200 ${
                      (isSelectionMode || isDamaged) ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'scale-110 drop-shadow-2xl'
                        : 'hover:scale-125 hover:drop-shadow-lg'
                    }`}
                    style={{
                      width: `${part.width}px`,
                      height: `${part.height}px`,
                      transform: `scale(${adjustedScale})`, // Apply individual scale with mobile adjustment
                      filter: isSelected
                        ? 'sepia(1) saturate(3) hue-rotate(35deg) brightness(1.2)' // Convert white to yellow inside SVG
                      : 'none',
                    }}
                    title={`${t(`condition.part${part.id}`)} ${isDamaged ? t('condition.damaged') : ''}`}
                  />

               
                </div>
              );
            })}

            {/* Car outline guide (optional visual aid) */}
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-xl opacity-30 pointer-events-none">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                {t('condition.rear')}
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                {t('condition.front')}
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-gray-400">
                {t('condition.left')}
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-400">
                {t('condition.right')}
              </div>
            </div>
          </div>

        </div>

        {/* Description Section */}
        <div className="w-2/5 rounded-xl p-6 text-black">
          <div className="text-xl font-bold mb-4 whitespace-nowrap md:whitespace-normal">{t('condition.damagedParts')}</div>
          {getDamagedPartsWithDetails().length === 0 ? (
            <p className="text-gray-400 whitespace-nowrap md:whitespace-normal">{t('condition.inspectionAfterReservation')}</p>
          ) : (
            <div className="space-y-4">
              {getDamagedPartsWithDetails().map((damagedPart) => (
                <div
                  key={damagedPart.part_id}
                  className="rounded-xl p-2 cursor-pointer  transition-colors"
                  onClick={() => handleDescriptionClick(damagedPart.part_id)}
                >
                  <h4 className="font-semibold  mb-2">
                    {damagedPart.partName}
                  </h4>
                  {damagedPart.descriptions.length > 0 ? (
                    <div className="space-y-2">
                      {damagedPart.descriptions.map((desc, index) => (
                        <p key={index} className=" text-sm">
                          {desc}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">{t('condition.noDescriptionProvided')}</p>
                  )}
                  {damagedPart.images.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('condition.imagesAvailable', { count: damagedPart.images.length })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl max-w-[95vw] w-fit max-h-[90vh] overflow-auto"
            onMouseLeave={() => {
              // Close modal when cursor leaves the modal content
              setSelectedImageModal(null);
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedImageModal.partName}
                </h2>
                <button
                  onClick={() => setSelectedImageModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {selectedImageModal.descriptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('condition.descriptions')}</h3>
                  <div className="space-y-2">
                    {selectedImageModal.descriptions.map((desc, index) => (
                      <p key={index} className="text-gray-600 bg-gray-100 p-3 rounded">
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedImageModal.images.length > 0 ? (
                <div className={`grid gap-4 ${selectedImageModal.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {selectedImageModal.images.map((imageBase64, index) => {
                    const imageSrc = formatImageSrc(imageBase64);
                    console.log(`Image ${index + 1} src:`, imageSrc ? 'Available' : 'Missing', imageSrc?.substring(0, 50) + '...');
                    
                    return (
                      <div key={index} className="border rounded-xl overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={`${selectedImageModal.partName} damage ${index + 1}`}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: '400px' }}
                          onError={(e) => {
                            console.error('Image load error:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                          }}
                        />
                        {!imageSrc && (
                          <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-500">
                            {t('condition.noImageDataAvailable')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-600 text-center p-4">
                  {t('condition.noImagesForPart')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamagedParts;
