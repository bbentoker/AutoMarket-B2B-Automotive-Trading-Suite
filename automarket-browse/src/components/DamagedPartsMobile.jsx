import React, { useState, useEffect } from 'react';
import { getCarListingDamagedParts } from '../services/api';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';

const DamagedPartsMobile = ({
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

  // Mobile-optimized offset values for all coordinates
  const offsetX = -220;
  const offsetY = -100;

  // Coordinates array for each car part (mobile-optimized)
      const partCoordinates = [
      { id: 1, x: 250, y: 80, scale: 2, zIndex: 8, width: 48, height: 16, name: 'Rear Bumper' },
      { id: 2, x: 169, y: 101, scale: 1.6, zIndex: 5, width: 32, height: 24, name: 'Rear Right Fender' },
      { id: 3, x: 250, y: 120, scale: 1.6, zIndex: 12, width: 52, height: 36, name: 'Trunk/Boot' },
      { id: 4, x: 333, y: 100, scale: 1.7, zIndex: 5, width: 32, height: 24, name: 'Rear Left Fender' },
      { id: 5, x: 177, y: 133, scale: 1.8, zIndex: 1, width: 40, height: 48, name: 'Rear Right Wheel' },
      { id: 6, x: 325, y: 133, scale: 1.8, zIndex: 1, width: 40, height: 48, name: 'Rear Left Wheel' },
      { id: 7, x: 148, y: 142, scale: 1.4, zIndex: 10, width: 28, height: 28, name: 'Rear Right Wheel Well' },
      { id: 8, x: 353, y: 142, scale: 1.4, zIndex: 10, width: 28, height: 28, name: 'Rear Left Wheel Well' },
      { id: 9, x: 147, y: 225, scale: 1.8, zIndex: 5, width: 12, height: 64, name: 'Right Side Sill' },
      { id: 10, x: 190, y: 176, scale: 2.2, zIndex: 15, width: 32, height: 40, name: 'Rear Right Door' },
      { id: 11, x: 250, y: 215, scale: 2, zIndex: 1, width: 65, height: 78, name: 'Roof' },
      { id: 12, x: 313, y: 176, scale: 2.2, zIndex: 10, width: 32, height: 40, name: 'Rear Left Door' },
      { id: 13, x: 355, y: 225, scale: 1.8, zIndex: 5, width: 12, height: 64, name: 'Left Side Sill' },
      { id: 14, x: 190, y: 242, scale: 2.2, zIndex: 3, width: 46, height: 32, name: 'Front Right Door' },
      { id: 15, x: 313, y: 242, scale: 2.2, zIndex: 3, width: 46, height: 32, name: 'Front Left Door' },
      { id: 16, x: 176, y: 314, scale: 3.2, zIndex: 3, width: 40, height: 24, name: 'Front Right Fender' },
      { id: 17, x: 250, y: 305, scale: 4.9, zIndex: 2, width: 20, height: 28, name: 'Hood/Bonnet' },
      { id: 18, x: 328, y: 313, scale: 2.6, zIndex: 9, width: 20, height: 28, name: 'Front Left Fender' },
      { id: 19, x: 150, y: 308, scale: 2.0, zIndex: 6, width: 20, height: 60, name: 'Front Right Wheel' },
      { id: 20, x: 353, y: 307, scale: 2.0, zIndex: 6, width: 20, height: 60, name: 'Front Left Wheel' },
      { id: 21, x: 162, y: 332, scale: 1.8, zIndex: 14, width: 40, height: 24, name: 'Right Headlight' },
      { id: 22, x: 342, y: 330, scale: 1.8, zIndex: 14, width: 40, height: 24, name: 'Left Headlight' },
      { id: 23, x: 250, y: 365, scale: 2, zIndex: 11, width: 48, height: 16, name: 'Front Bumper' },
      { id: 24, x: 250, y: 252, scale: 1.7, zIndex: 14, width: 40, height: 24, name: 'Windshield' },
      { id: 25, x: 250, y: 155, scale: 1.3, zIndex: 14, width: 40, height: 24, name: 'Rear Window' },
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
        existingPart.images.push(item.photo);
        if (item.description && !existingPart.descriptions.includes(item.description)) {
          existingPart.descriptions.push(item.description);
        }
      } else {
        damagedParts.push({
          part_id: item.part_id,
          partName,
          descriptions: item.description ? [item.description] : [],
          images: [item.photo]
        });
      }
    });
    return damagedParts;
  };

  const handlePartClick = (partId) => {
    if (isSelectionMode && onPartSelect) {
      onPartSelect(partId);
    } else {
      // Mobile: directly show modal on tap instead of hover
      const damagedData = getDamagedPartData(partId);
      if (damagedData.length > 0) {
        setSelectedImageModal({
          partId,
          partName: getPartName(partId),
          images: damagedData.map(item => item.photo),
          descriptions: damagedData.filter(item => item.description).map(item => item.description)
        });
      }
    }
  };

  const handleDescriptionClick = (partId) => {
    const damagedData = getDamagedPartData(partId);
    if (damagedData.length > 0) {
      setSelectedImageModal({
        partId,
        partName: getPartName(partId),
        images: damagedData.map(item => item.photo),
        descriptions: damagedData.filter(item => item.description).map(item => item.description)
      });
    }
  };

  return (
    <div className="flex flex-col items-center text-white w-full max-w-full overflow-x-hidden">
      {/* Mobile layout - stack everything vertically */}
      <div className="w-full flex flex-col gap-32 max-w-sm mx-auto overflow-x-hidden">
        
        {/* Car diagram section */}
        <div className="flex justify-center items-center w-full overflow-x-hidden">
          <div className="relative w-full max-w-[400px] h-[320px] mx-auto overflow-x-hidden">
            {partCoordinates.map((part) => {
              const isSelected = selectedPart === part.id;
              const isDamaged = isDamagedPart(part.id);
              
              // Mobile-specific scaling and positioning - increased scale to fill more space
              const mobileScale = 1.3;
              const adjustedScale = part.scale * mobileScale;
              const adjustedX = (part.x + offsetX) * mobileScale + 120;
              const adjustedY = (part.y + offsetY) * mobileScale + 60;

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
                        : 'active:scale-125 active:drop-shadow-lg'
                    }`}
                    style={{
                      width: `${part.width}px`,
                      height: `${part.height}px`,
                      transform: `scale(${adjustedScale})`,
                      filter: isSelected
                        ? 'sepia(1) saturate(3) hue-rotate(35deg) brightness(1.2)'
                        : 'none',
                    }}
                    title={`${t(`condition.part${part.id}`)} ${isDamaged ? t('condition.damaged') : ''}`}
                  />
                  {/* Debug ID label */}
                  {/* <div 
                    className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 rounded pointer-events-none"
                    style={{ 
                      fontSize: '10px',
                      lineHeight: '12px',
                      zIndex: 999,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {part.id}
                  </div> */}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile description section */}
        <div className="w-full bg-white rounded-xl  text-black">
          <div className="text-lg font-bold mb-3">{t('condition.damagedParts')}</div>
          {getDamagedPartsWithDetails().length === 0 ? (
            <p className="text-gray-400 text-sm">{t('condition.inspectionAfterReservation')}</p>
          ) : (
            <div className="space-y-3">
              {getDamagedPartsWithDetails().map((damagedPart) => (
                <div
                  key={damagedPart.part_id}
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => handleDescriptionClick(damagedPart.part_id)}
                >
                  <h4 className="font-semibold mb-2">
                    {damagedPart.partName}
                  </h4>
                  {damagedPart.descriptions.length > 0 ? (
                    <div className="space-y-1">
                      {damagedPart.descriptions.map((desc, index) => (
                        <p key={index} className="text-sm">
                          {desc}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">{t('condition.noDescriptionProvided')}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('condition.tapToViewImages', { count: damagedPart.images.length })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-optimized Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[85vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedImageModal.partName}
                </h2>
                <button
                  onClick={() => setSelectedImageModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2"
                >
                  ×
                </button>
              </div>
              
              {selectedImageModal.descriptions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('condition.descriptions')}</h3>
                  <div className="space-y-2">
                    {selectedImageModal.descriptions.map((desc, index) => (
                      <p key={index} className="text-gray-600 bg-gray-100 p-3 rounded text-sm">
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3 grid-cols-1">
                {selectedImageModal.images.map((imageBase64, index) => {
                  const imageSrc = formatImageSrc(imageBase64);
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={`${selectedImageModal.partName} damage ${index + 1}`}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '300px' }}
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                      {!imageSrc && (
                        <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-500 text-sm">
                          {t('condition.noImageDataAvailable')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamagedPartsMobile; 