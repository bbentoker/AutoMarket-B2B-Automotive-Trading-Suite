import { useState, useEffect } from 'react';
import {
  fetchListingData,
  detectUrlType,
  getListingStatuses,
  createManualListing,
} from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import DamagedParts from '../components/DamagedParts';

const maxImageSize = 20;

// Transform ListingSiteA data to match ListingSiteB data structure
const transformListingSiteAData = (listingsiteaResponse) => {
  const extractedData = listingsiteaResponse.extractedData;
  const imageUrls = listingsiteaResponse.imageUrls || [];

  // Helper function to extract numbers from strings
  const extractNumbers = (str) => {
    if (!str) return '';
    // Remove all non-digit characters (including commas, spaces, etc.) and keep only numbers
    const numbers = str.replace(/[^\d]/g, '');
    return numbers;
  };

  // Helper function to extract horsepower (prefer HP value over kW)
  const extractHorsepower = (powerStr) => {
    if (!powerStr) return '';
    // Look for pattern like "70 kW (95 hp)" and prefer the HP value
    const hpMatch = powerStr.match(/\((\d+)\s*hp\)/i);
    if (hpMatch) return hpMatch[1];
    // Fall back to first number found
    return extractNumbers(powerStr);
  };

  // Helper function to extract brand name from make field
  const extractBrandName = (make) => {
    if (!make) return '';
    // Split by space and take first part (e.g., "Mercedes-Benz Citan" -> "Mercedes-Benz")
    const parts = make.split(' ');
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
  };

  // Helper function to extract model from make field
  const extractModel = (make, model) => {
    if (!make) return model || '';

    const parts = make.split(' ');
    const lastPartOfMake = parts.length > 1 ? parts[parts.length - 1] : '';

    // If we have a separate model, prepend the last part of make to it
    if (model) {
      return lastPartOfMake ? `${lastPartOfMake} ${model}` : model;
    }

    // If no separate model, just return the last part of make
    return lastPartOfMake;
  };

  // Helper function to extract features from equipment data
  const extractFeatures = (extractedData) => {
    const features = [];

    // Handle original extractedData format (if it exists)
    if (extractedData.vehicle_features) {
      return extractedData.vehicle_features;
    }

    // Handle new format with categorized equipment
    if (extractedData.equipment) {
      const equipment = extractedData.equipment;

      // Combine all equipment categories
      const allCategories = [
        equipment.comfortAndConvenience || [],
        equipment.entertainmentAndMedia || [],
        equipment.extras || [],
        equipment.safetyAndSecurity || [],
      ];

      // Flatten and extract feature names
      allCategories.forEach((category) => {
        if (Array.isArray(category)) {
          category.forEach((item) => {
            if (typeof item === 'object' && item.id) {
              features.push(item.id);
            } else if (typeof item === 'string') {
              features.push(item);
            }
          });
        }
      });
    }

    return features.join(', ');
  };

  // Convert ListingSiteA data to match ListingSiteB format
  const transformedData = {
    en: {
      brand_name: extractBrandName(extractedData.make),
      model: extractModel(extractedData.make, extractedData.model),
      listing_price: extractedData.price || '',
      currency: 'EUR', // ListingSiteA typically uses EUR
      color: extractedData.color !== 'Unknown Colour' ? extractedData.color : '',
      fuel_type: extractedData.fuel_type || '',
      transmission_type: extractedData.gearbox || '',
      horsepower: extractHorsepower(extractedData.power),
      km_stand: extractNumbers(extractedData.mileage),
      first_registration: extractedData.first_registration
        ? new Date(extractedData.first_registration).toISOString().split('T')[0]
        : '',
      seat: extractedData.seats || '',
      co2: extractNumbers(extractedData.co_2_emissions),
      seller_company: extractedData.seller_name || '',
      images: imageUrls,
      // Fields that don't have direct mapping in ListingSiteA data
      registration_number: '',
      vin_number: '',
      features: extractFeatures(extractedData),
      vat_or_margin: 'Excl. VAT',
      expires_in: '48',
      internal_url: listingsiteaResponse.url || '',
      previous_accidents: extractedData.previous_owner > 1,
      seller_email: '',
      telephone: '',
      seller_address: extractedData.location || '',
      amount_purchased: '',
      price: '',
      avg_selling_time: '',
      listingsitea_link: listingsiteaResponse.url || '',
    },
  };

  return transformedData;
};

// Transform ListingSiteC data to match ListingSiteB data structure
const transformListingSiteCData = (listingsitecResponse) => {
  const extractedData = listingsitecResponse.extractedData;
  const imageUrls = extractedData.original_image_urls || listingsitecResponse.imageUrls || [];

  // Helper function to clean price data
  const cleanPrice = (priceStr) => {
    if (!priceStr) return '';
    // Remove currency symbols and keep only numbers
    return priceStr.replace(/[^\d]/g, '') || '';
  };

  // Helper function to extract model name from title
  const extractModel = (model, title) => {
    if (model && !model.includes('€') && !model.includes('listingsitec.example.com')) {
      return model;
    }
    // Extract model from title if model field contains unwanted text
    if (title) {
      // Remove brand name from title to get model
      const titleParts = title.split(' ');
      if (titleParts.length > 1) {
        return titleParts.slice(1).join(' '); // Return everything after brand
      }
    }
    return '';
  };

  // Helper function to convert year format
  const convertYear = (yearStr) => {
    if (!yearStr) return '';
    // Handle "6/2022" format and convert to "2022-06-01"
    const match = yearStr.match(/^(\d{1,2})\/(\d{4})$/);
    if (match) {
      const month = match[1].padStart(2, '0');
      const year = match[2];
      return `${year}-${month}-01`;
    }
    // Handle simple year format (like "2023")
    const yearMatch = yearStr.match(/(\d{4})/);
    if (yearMatch) {
      return `${yearMatch[1]}-01-01`;
    }
    return '';
  };

  // Helper function to extract transmission type
  const extractTransmission = (transmission) => {
    if (!transmission) return '';
    // Convert "M5" to "Manual"
    if (transmission.startsWith('M')) {
      return 'Manual';
    }
    return transmission;
  };

  // Helper function to extract power in HP from kW
  const convertPowerToHP = (powerKw) => {
    if (!powerKw) return '';
    const match = powerKw.match(/(\d+)kW/);
    if (match) {
      const kw = parseInt(match[1]);
      const hp = Math.round(kw * 1.34102); // Convert kW to HP
      return hp.toString();
    }
    return '';
  };

  // Convert ListingSiteC data to match ListingSiteB format
  const transformedData = {
    en: {
      brand_name: extractedData.brand || '',
      model: extractModel(extractedData.model, extractedData.title),
      listing_price: cleanPrice(extractedData.price),
      currency: extractedData.currency || 'EUR',
      color: '', // Not available in current data
      fuel_type: extractedData.fuel_type || '',
      transmission_type:
        extractedData.transmission_type || extractTransmission(extractedData.transmission),
      horsepower: convertPowerToHP(extractedData.power_kw),
      km_stand: extractedData.mileage || extractedData.details?.mileage || '',
      first_registration: convertYear(
        extractedData.details?.ads_year || extractedData.year || extractedData.registration_date
      ),
      seat: extractedData.doors || '',
      co2: '', // Not available in current data
      seller_company: '', // Not available in current data
      telephone: extractedData.contact_info?.phone || '',
      images: imageUrls,
      // Fields that don't have direct mapping in ListingSiteC data
      registration_number: '',
      vin_number: '',
      features: extractedData.translated_additional_equipment
        ? extractedData.translated_additional_equipment.join(', ')
        : extractedData.additional_equipment
          ? extractedData.additional_equipment.join(', ')
          : Object.values(extractedData.features || {}).join(', '),
      vat_or_margin: 'Excl. VAT',
      expires_in: '48',
      internal_url: listingsitecResponse.url || '',
      previous_accidents: extractedData.condition === 'Used' ? false : true,
      seller_email: extractedData.contact_info?.email || '',
      seller_address: extractedData.location || '',
      amount_purchased: '',
      price: '',
      avg_selling_time: '',
      listingsitea_link: listingsitecResponse.url || '',
    },
  };

  return transformedData;
};

// Transform Mobile.de data to match ListingSiteB data structure
const transformMobileData = (mobileResponse) => {
  const extractedData = mobileResponse.extractedData;
  const imageUrls = extractedData.original_image_urls || [];

  // Helper function to convert MM/YYYY format to YYYY-MM-DD
  const convertDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle MM/YYYY format (e.g., "10/2015")
    const match = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
    if (match) {
      const month = match[1].padStart(2, '0');
      const year = match[2];
      return `${year}-${month}-01`; // Use first day of month
    }
    return '';
  };

  // Helper function to extract brand and model from title
  const extractBrandAndModel = (title) => {
    if (!title) return { brand: '', model: '' };

    // Extract brand and model from title like "Mercedes-Benz CLA 250 für 22.500 €"
    const titleParts = title.split(' ');
    if (titleParts.length >= 3) {
      // Handle multi-word brands like "Mercedes-Benz"
      let brand = '';
      let model = '';

      if (titleParts[0] === 'Mercedes-Benz') {
        brand = 'Mercedes-Benz';
        model = titleParts[1] + ' ' + titleParts[2]; // "CLA 250"
      } else if (titleParts[0] === 'Volkswagen') {
        brand = 'Volkswagen';
        model = titleParts[1]; // "Golf"
      } else {
        brand = titleParts[0];
        model = titleParts[1];
      }

      return { brand, model };
    }
    return { brand: '', model: '' };
  };

  // Helper function to extract data from description
  const extractFromDescription = (description) => {
    if (!description) return {};

    const result = {};

    // Extract mileage
    const mileageMatch = description.match(/(\d+(?:\.\d+)?)\s*km/);
    if (mileageMatch) {
      result.mileage = mileageMatch[1].replace('.', '');
    }

    // Extract horsepower
    const hpMatch = description.match(/(\d+)\s*PS/);
    if (hpMatch) {
      result.horsepower = hpMatch[1];
    }

    // Extract fuel type
    if (description.includes('Hybrid')) {
      result.fuel_type = 'Hybrid';
    } else if (description.includes('Benzin')) {
      result.fuel_type = 'Benzin';
    } else if (description.includes('Diesel')) {
      result.fuel_type = 'Diesel';
    } else if (description.includes('Elektro')) {
      result.fuel_type = 'Elektro';
    }

    // Extract first registration
    const dateMatch = description.match(/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      result.first_registration = `${dateMatch[2]}-${dateMatch[1]}-01`;
    }

    return result;
  };

  // Extract brand and model from title
  const { brand, model } = extractBrandAndModel(extractedData.title);

  // Extract additional data from description
  const descriptionData = extractFromDescription(extractedData.description);

  // Convert Mobile.de data to match ListingSiteB format
  const transformedData = {
    en: {
      brand_name: brand || extractedData.brand || '',
      model: model || extractedData.model || '',
      listing_price: extractedData.price || '',
      currency: extractedData.currency || 'EUR',
      color: '', // Not available in the current data
      fuel_type: descriptionData.fuel_type || extractedData.fuel_type || '',
      transmission_type: extractedData.transmission || '',
      horsepower: descriptionData.horsepower || extractedData.horsepower || '',
      km_stand: descriptionData.mileage || extractedData.mileage || '',
      first_registration:
        descriptionData.first_registration || convertDate(extractedData.first_registration),
      seat: '', // Not available in the current data
      co2: '', // Not available in the current data
      seller_company: '', // Not available in the current data
      images: imageUrls,
      // Fields that don't have direct mapping in Mobile.de data
      registration_number: '',
      vin_number: '',
      features: extractedData.equipment_features ? extractedData.equipment_features.join(', ') : '',
      vat_or_margin: 'Excl. VAT',
      expires_in: '48',
      internal_url: mobileResponse.url || '',
      previous_accidents: extractedData.condition === 'Unfallfrei' ? false : true,
      seller_email: '',
      telephone: '',
      seller_address: '', // Not available in the current data
      amount_purchased: '',
      price: '',
      avg_selling_time: '',
      listingsitea_link: mobileResponse.url || '',
    },
  };

  return transformedData;
};

// Transform Hasznaltauto.hu data to match ListingSiteB data structure
const transformHasznaltData = (hasznaltResponse) => {
  const extractedData = hasznaltResponse.extractedData;
  const imageUrls = extractedData.original_image_urls || [];

  // Helper function to convert year to YYYY-MM-DD format
  const convertYearToDate = (yearStr) => {
    if (!yearStr) return '';
    // Handle YYYY format (e.g., "2023")
    const match = yearStr.match(/^(\d{4})$/);
    if (match) {
      const year = match[1];
      return `${year}-01-01`; // Use first day of year
    }
    return '';
  };

  // Helper function to extract brand name from brand field
  const extractBrandName = (brand) => {
    if (!brand) return '';
    // Capitalize first letter
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Helper function to extract model from model field
  const extractModel = (model) => {
    if (!model) return '';
    // Clean up the model name by removing underscores and extra parts
    return model.replace(/_/g, ' ').split(' ')[0]; // Take first part after cleaning
  };

  // Convert Hasznaltauto.hu data to match ListingSiteB format
  const transformedData = {
    en: {
      brand_name: extractBrandName(extractedData.brand),
      model: extractModel(extractedData.model),
      listing_price: extractedData.price || '',
      currency: extractedData.currency || 'HUF',
      color: '', // Not available in the current data
      fuel_type: extractedData.fuel_type || '',
      transmission_type: extractedData.transmission || '',
      horsepower: extractedData.horsepower || '',
      km_stand: extractedData.mileage || '',
      first_registration: convertYearToDate(extractedData.first_registration),
      seat: '', // Not available in the current data
      co2: '', // Not available in the current data
      seller_company: '', // Not available in the current data
      images: imageUrls,
      // Fields that don't have direct mapping in Hasznaltauto.hu data
      registration_number: '',
      vin_number: '',
      features: '',
      vat_or_margin: 'Excl. VAT',
      expires_in: '48',
      internal_url: hasznaltResponse.url || '',
      previous_accidents: extractedData.condition === 'normal' ? false : true,
      seller_email: '',
      telephone: '',
      seller_address: '', // Not available in the current data
      amount_purchased: '',
      price: '',
      avg_selling_time: '',
      listingsitea_link: hasznaltResponse.url || '',
    },
  };

  return transformedData;
};

// Transform ListingSiteB fallback data to properly extract first_registration
const transformListingSiteBFallbackData = (listingsitebResponse) => {
  // Start with the existing data
  const transformedData = { ...listingsitebResponse };

  // Ensure data structure exists
  if (!transformedData.data) {
    console.warn('No data found in listingsitebResponse, creating empty data structure');
    transformedData.data = {};
  }
  if (!transformedData.data.en) {
    console.warn('No data.en found in listingsitebResponse, creating empty en structure');
    transformedData.data.en = {};
  }

  // Log the original data for debugging
  console.log('Original listingsitebResponse.data.en:', transformedData.data.en);

  // Extract first_registration from the main data.en object and format it properly
  if (
    transformedData.data &&
    transformedData.data.en &&
    transformedData.data.en.first_registration
  ) {
    const firstRegValue = transformedData.data.en.first_registration;
    console.log('Original first_registration value:', firstRegValue, 'Type:', typeof firstRegValue);

    // Convert year to proper date format (YYYY-MM-DD)
    let formattedDate = '';

    // Handle different input formats
    if (typeof firstRegValue === 'number') {
      // If it's a number (like 2025), format as YYYY-01-01
      formattedDate = `${firstRegValue}-01-01`;
    } else if (typeof firstRegValue === 'string') {
      // Check if it's just a 4-digit year
      if (/^\d{4}$/.test(firstRegValue.trim())) {
        formattedDate = `${firstRegValue.trim()}-01-01`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(firstRegValue)) {
        // Already in correct format
        formattedDate = firstRegValue;
      } else if (/^\d{4}-\d{2}$/.test(firstRegValue)) {
        // Format YYYY-MM, add day
        formattedDate = `${firstRegValue}-01`;
      } else {
        // Try to extract year from other formats
        const yearMatch = firstRegValue.match(/(\d{4})/);
        if (yearMatch) {
          formattedDate = `${yearMatch[1]}-01-01`;
        } else {
          console.warn('Could not parse first_registration:', firstRegValue);
          formattedDate = '';
        }
      }
    }

    // Validate the formatted date
    if (formattedDate && /^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      transformedData.data.en.first_registration = formattedDate;
      console.log(
        '✅ Successfully formatted first_registration:',
        firstRegValue,
        '->',
        formattedDate
      );
    } else {
      console.error(
        '❌ Failed to format first_registration:',
        firstRegValue,
        'Result:',
        formattedDate
      );
      transformedData.data.en.first_registration = '';
    }
  }

  // If fallback data exists, extract additional information from parameter_groups
  if (listingsitebResponse.fallback_data && listingsitebResponse.fallback_data.data) {
    const fallbackData = listingsitebResponse.fallback_data.data;

    // Extract data from parameter_groups
    if (fallbackData.parameter_groups) {
      const generalParams = fallbackData.parameter_groups.find((group) => group.type === 'general');
      if (generalParams && generalParams.parameters) {
        // Extract mileage
        console.log('Searching for mileage in parameters:', generalParams.parameters);
        const mileageParam = generalParams.parameters.find((param) => param.id === 'mileage');
        console.log('Found mileage param:', mileageParam);

        if (mileageParam && mileageParam.value !== undefined) {
          if (transformedData.data && transformedData.data.en) {
            const originalKmStand = transformedData.data.en.km_stand;
            transformedData.data.en.km_stand = mileageParam.value;
            console.log(
              '✅ Updated km_stand from fallback parameter_groups:',
              'Original:',
              originalKmStand,
              'New:',
              mileageParam.value,
              'Type:',
              typeof mileageParam.value
            );
          } else {
            console.warn('❌ Cannot update km_stand - data structure missing');
          }
        } else {
          console.warn('❌ Mileage parameter not found or value is undefined');
        }

        // ALSO ensure we're not losing the main data km_stand if it exists
        console.log(
          'Current km_stand after fallback processing:',
          transformedData.data.en.km_stand
        );

        // If fallback didn't work but main data has km_stand, ensure it's preserved
        if (
          (transformedData.data.en.km_stand === undefined ||
            transformedData.data.en.km_stand === null) &&
          listingsitebResponse.data &&
          listingsitebResponse.data.en &&
          listingsitebResponse.data.en.km_stand !== undefined &&
          listingsitebResponse.data.en.km_stand !== null
        ) {
          transformedData.data.en.km_stand = listingsitebResponse.data.en.km_stand;
          console.log('✅ Preserved km_stand from main data:', listingsitebResponse.data.en.km_stand);
        }

        // Extract additional first_registration if not already processed from main data
        if (transformedData.data && transformedData.data.en) {
          if (
            !transformedData.data.en.first_registration ||
            transformedData.data.en.first_registration === ''
          ) {
            const regDateParam = generalParams.parameters.find((param) => param.id === 'regdate');
            if (regDateParam && regDateParam.value) {
              const formattedRegDate = `${regDateParam.value}-01-01`;
              transformedData.data.en.first_registration = formattedRegDate;
              console.log(
                'Updated first_registration from fallback parameter_groups:',
                regDateParam.value,
                '->',
                formattedRegDate
              );
            }
          }
        }
      }
    }
  }

  // Log final result for debugging
  console.log('Final transformedData.data.en:', transformedData.data.en);
  console.log('Final km_stand value:', transformedData.data.en.km_stand);

  return transformedData;
};

const AddDeal = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  // Add state for fetched images
  const [fetchedImages, setFetchedImages] = useState([]);
  // Add flag to track if images have been initially set
  const [imagesInitialized, setImagesInitialized] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [showDamagedPartsPopup, setShowDamagedPartsPopup] = useState(false);
  const [selectedDamagedPart, setSelectedDamagedPart] = useState(null);
  const [damagedPartsData, setDamagedPartsData] = useState([]); // Store damaged parts data
  const [wasUrlFetched, setWasUrlFetched] = useState(false); // Track if URL was fetched
  const [urlType, setUrlType] = useState(''); // Track URL type (listingsiteb/listingsitea)

  // Store all language data
  const [allLanguageData, setAllLanguageData] = useState({});

  // Current form state for the selected language
  const [formState, setFormState] = useState({
    horsepower: '',
    registrationNumber: '',
    firstRegistration: '',
    kmStand: '',
    vinNumber: '',
    listingPrice: '',
    brandName: '',
    model: '',
    color: '',
    fuelType: '',
    transmissionType: '',
    features: '',
    vat_or_margin: 'Excl. VAT',
    expiresIn: '48',
    currency: '',
    co2: '',
    seat: '',
    internalUrl: '',
    previousAccidents: false,
    sellerCompany: '',
    sellerEmail: '',
    telephone: '',
    sellerAddress: '',
    amountPurchased: '',
    price: '',
    avgSellingTime: '',
    listingsiteaLink: '',
    transportCost: '',
    location: '',
    vehicleCategory: '',
    interiorColor: '',
    trimPackage: '',
    engine: '',
    serviceHistory: '',
    numberOfOwners: '',
  });

  const [features, setFeatures] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('1');
  const [statuses, setStatuses] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getListingStatuses().then((statuses) => {
      if (statuses && statuses.length > 0) {
        setStatuses(statuses);
        setSelectedStatus(statuses[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    console.log(allLanguageData);
  }, [allLanguageData]);

  // Update form state when data changes
  useEffect(() => {
    if (allLanguageData && allLanguageData['en']) {
      const data = allLanguageData['en'];
      setFormState({
        horsepower: data.horsepower || '',
        registrationNumber: data.registration_number || '',
        firstRegistration: (() => {
          const regValue = data.first_registration || '';
          console.log(
            'Setting firstRegistration form field with:',
            regValue,
            'Type:',
            typeof regValue
          );

          // Always ensure it's in the correct format for date input
          if (regValue) {
            // Convert to string first
            const regValueStr = String(regValue);

            // Check if already in correct format
            if (/^\d{4}-\d{2}-\d{2}$/.test(regValueStr)) {
              console.log('✅ Format already correct:', regValueStr);
              return regValueStr;
            }

            // If it's just a year (number or string)
            if (/^\d{4}$/.test(regValueStr.trim())) {
              const formatted = `${regValueStr.trim()}-01-01`;
              console.log('🔧 Fixed year format:', regValueStr, '->', formatted);
              return formatted;
            }

            // Try to extract year from other formats
            const yearMatch = regValueStr.match(/(\d{4})/);
            if (yearMatch) {
              const formatted = `${yearMatch[1]}-01-01`;
              console.log('🔧 Extracted year and formatted:', regValueStr, '->', formatted);
              return formatted;
            }

            console.warn('❌ Could not format first_registration:', regValueStr);
            return ''; // Return empty string if we can't format it
          }

          return regValue;
        })(),
        kmStand: data.km_stand !== undefined && data.km_stand !== null ? String(data.km_stand) : '',
        vinNumber: data.vin_number || '',
        listingPrice: data.listing_price
          ? String(data.listing_price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          : '',
        brandName: data.brand_name || '',
        model: data.model || '',
        color: data.color || '',
        fuelType: data.fuel_type || '',
        transmissionType: data.transmission_type || '',
        features: data.features || '',
        vat_or_margin: data.vat_or_margin || 'Excl. VAT',
        expiresIn: data.expires_in || '48',
        currency: data.currency || '',
        co2: data.co2 || '',
        seat: data.seat || '',
        internalUrl: data.internal_url || '',
        previousAccidents: data.previous_accidents || false,
        sellerCompany: data.seller_company || '',
        sellerEmail: data.seller_email || '',
        telephone: data.telephone || '',
        sellerAddress: data.seller_address || '',
        amountPurchased: data.amount_purchased || '',
        price: data.price || '',
        avgSellingTime: data.avg_selling_time || '',
        listingsiteaLink: data.listingsitea_link || '',
        transportCost: data.transport_cost || '',
        location: data.location || '',
        vehicleCategory: data.vehicle_category || '',
        interiorColor: data.interior_color || '',
        trimPackage: data.trim_package || '',
        engine: data.engine || '',
        serviceHistory: data.service_history || '',
        numberOfOwners: data.number_of_owners || '',
      });
      setFeatures(data.features || '');
      // Only set fetched images if they haven't been initialized yet
      if (!imagesInitialized && data.images && data.images.length > 0) {
        setFetchedImages(data.images);
        setImagesInitialized(true);
      }
    }
  }, [allLanguageData, imagesInitialized]);

  // Update the corresponding field in allLanguageData
  const updateFormField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }

    setAllLanguageData((prev) => ({
      ...prev,
      en: {
        ...prev['en'],
        [field === 'registrationNumber'
          ? 'registration_number'
          : field === 'firstRegistration'
            ? 'first_registration'
            : field === 'kmStand'
              ? 'km_stand'
              : field === 'vinNumber'
                ? 'vin_number'
                : field === 'listingPrice'
                  ? 'listing_price'
                  : field === 'brandName'
                    ? 'brand_name'
                    : field === 'fuelType'
                      ? 'fuel_type'
                      : field === 'transmissionType'
                        ? 'transmission_type'
                        : field === 'vat_or_margin'
                          ? 'vat_or_margin'
                          : field === 'expiresIn'
                            ? 'expires_in'
                            : field === 'currency'
                              ? 'currency'
                              : field === 'co2'
                                ? 'co2'
                                : field === 'seat'
                                  ? 'seat'
                                  : field === 'internalUrl'
                                    ? 'internal_url'
                                    : field === 'previousAccidents'
                                      ? 'previous_accidents'
                                      : field === 'sellerCompany'
                                        ? 'seller_company'
                                        : field === 'sellerEmail'
                                          ? 'seller_email'
                                          : field === 'telephone'
                                            ? 'telephone'
                                            : field === 'sellerAddress'
                                              ? 'seller_address'
                                              : field === 'amountPurchased'
                                                ? 'amount_purchased'
                                                : field === 'price'
                                                  ? 'price'
                                                  : field === 'avgSellingTime'
                                                    ? 'avg_selling_time'
                                                    : field === 'listingsiteaLink'
                                                      ? 'listingsitea_link'
                                                      : field === 'transportCost'
                                                        ? 'transport_cost'
                                                        : field === 'location'
                                                          ? 'location'
                                                          : field === 'vehicleCategory'
                                                            ? 'vehicle_category'
                                                            : field === 'interiorColor'
                                                              ? 'interior_color'
                                                              : field === 'trimPackage'
                                                                ? 'trim_package'
                                                                : field === 'engine'
                                                                  ? 'engine'
                                                                  : field === 'serviceHistory'
                                                                    ? 'service_history'
                                                                    : field === 'numberOfOwners'
                                                                      ? 'number_of_owners'
                                                                      : field]: value,
      },
    }));
  };

  // Handle features change
  const handleFeaturesChange = (newFeatures) => {
    setFeatures(newFeatures);
    setAllLanguageData((prev) => ({
      ...prev,
      en: {
        ...prev['en'],
        features: newFeatures,
      },
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = features.trim();
      const updatedFeatures = currentFeatures
        ? `${currentFeatures}, ${newFeature.trim()}`
        : newFeature.trim();
      handleFeaturesChange(updatedFeatures);
      setNewFeature('');
      setShowFeaturePopup(false);
      toast.success('Feature added successfully!');
    }
  };

  const handleFetch = async () => {
    if (!url) {
      toast.error('Please enter a URL before fetching.');
      return;
    }
    setLoading(true);
    let loadingToast = null;
    try {
      console.log('Fetching data from URL:', url);

      // Detect URL type and store it
      const detectedUrlType = detectUrlType(url);
      setUrlType(detectedUrlType);
      console.log('Detected URL type:', detectedUrlType);

      if (detectedUrlType === 'unknown') {
        toast.error(
          'Unsupported URL type. Please use ListingSiteB, ListingSiteA, listingsitec.example.com, Hasznaltauto.hu, Sauto.cz, or Mobile.de URLs.'
        );
        setLoading(false);
        return;
      }

      // Show loading toast with appropriate message
      let loadingMessage = 'Fetching data from URL...';
      if (detectedUrlType === 'hasznalt') {
        loadingMessage = 'Fetching data from Hasznaltauto.hu... This may take 2-3 minutes.';
      } else if (detectedUrlType === 'mobile') {
        loadingMessage = 'Fetching data from Mobile.de... This may take a few minutes.';
      }

      loadingToast = toast.loading(loadingMessage);

      const response = await fetchListingData(url);

      console.log('Full response:', response);

      // Validate response structure
      if (!response) {
        console.error('No response received from API');
        toast.dismiss(loadingToast);
        toast.error('No data received from server. Please try again.');
        return;
      }

      // Check for specific error response format
      if (response.error && response.error === 'Failed to extract listing information') {
        console.error('Listing extraction failed:', response);
        toast.dismiss(loadingToast);
        toast.error('Invalid listing URL - listing may be inactive or removed');
        return;
      }

      if (!response.data) {
        console.error('Response missing data property:', response);
        toast.dismiss(loadingToast);
        toast.error('Invalid response format from server.');
        return;
      }

      const languageData = response.data;
      console.log('Language data:', languageData);

      // Validate language data structure
      if (typeof languageData !== 'object' || languageData === null) {
        console.error('Invalid language data format:', languageData);
        toast.dismiss(loadingToast);
        toast.error('Invalid data format received from server.');
        return;
      }

      // Process data based on URL type
      let processedData;
      if (detectedUrlType === 'listingsitea') {
        // Transform ListingSiteA data to match ListingSiteB format
        processedData = transformListingSiteAData(languageData);
      } else if (detectedUrlType === 'listingsitec') {
        // Transform ListingSiteC data to match ListingSiteB format
        console.log('ListingSiteC Response Structure:', JSON.stringify(languageData, null, 2));
        processedData = transformListingSiteCData(languageData);
      } else if (detectedUrlType === 'hasznalt') {
        // Transform Hasznaltauto.hu data to match ListingSiteB format
        console.log('Hasznaltauto Response Structure:', JSON.stringify(languageData, null, 2));
        processedData = transformHasznaltData(languageData);
      } else if (detectedUrlType === 'sauto') {
        // For now, just log the response to understand the structure
        console.log('Sauto.cz Response Structure:', JSON.stringify(languageData, null, 2));
        // Use data as-is for now until we understand the structure
        processedData = languageData;
      } else if (detectedUrlType === 'mobile') {
        // Transform Mobile.de data to match ListingSiteB format
        console.log('Mobile.de Response Structure:', JSON.stringify(languageData, null, 2));
        processedData = transformMobileData(languageData);
      } else {
        // Handle ListingSiteB data, checking for fallback case
        if (languageData.fallback_used && languageData.fallback_data) {
          console.log('Processing ListingSiteB fallback data...');
          processedData = transformListingSiteBFallbackData(languageData);
        } else {
          // Use ListingSiteB data as-is
          processedData = languageData;
        }
      }

      // Safely update state
      setAllLanguageData(processedData);
      setWasUrlFetched(true); // Mark that URL was fetched
      // Reset images initialized flag so new images can be loaded
      setImagesInitialized(false);

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      toast.success('Data fetched successfully!');
    } catch (error) {
      // Dismiss loading toast on error
      toast.dismiss(loadingToast);

      // Comprehensive error logging
      console.error('Error fetching listing data:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        request: error.request,
        config: error.config,
        url: url,
      });

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('Server error response:', {
          status,
          data: errorData,
          headers: error.response.headers,
        });

        // Check for specific error response format in error data
        if (errorData && errorData.error === 'Failed to extract listing information') {
          toast.error('Invalid listing URL - listing may be inactive or removed');
        } else if (status === 500) {
          toast.error('Server error: Unable to fetch listing data. Please try again later.');
        } else if (status === 404) {
          toast.error('URL not found. Please check the URL and try again.');
        } else if (status === 403) {
          toast.error('Access forbidden. Please check your permissions.');
        } else if (status >= 400 && status < 500) {
          toast.error(`Client error (${status}): ${errorData?.message || 'Invalid request'}`);
        } else {
          toast.error(`Server error (${status}): Please try again later.`);
        }
      } else if (error.request) {
        // Network error or no response
        console.error('Network error - no response received:', error.request);
        toast.error('Network error: Unable to connect to server. Please check your connection.');
      } else {
        // Other errors (parsing, etc.)
        console.error('Unexpected error:', error.message);
        toast.error('Unexpected error: ' + (error.message || 'Unknown error occurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
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

    setSelectedImages((prevImages) => [...prevImages, ...validFiles]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    toast.success(`${validFiles.length} images added`);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prevPreviews[index].url);
      return prevPreviews.filter((_, i) => i !== index);
    });
  };

  // Add function to handle removing fetched images
  const handleRemoveFetchedImage = (index) => {
    setFetchedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    toast.success('Image removed successfully');
  };

  // Handle damaged parts data from DamagedParts component
  const handleDamagedPartsData = (partsData) => {
    console.log('AddDeal: Received damaged parts data:', partsData);
    setDamagedPartsData(partsData);
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, []);

  const handleSubmit = async () => {
    // Check for missing required fields and validation
    const errors = {};
    if (!formState.horsepower) errors.horsepower = true;
    if (!formState.kmStand) errors.kmStand = true;
    if (!formState.registrationNumber) errors.registrationNumber = true;
    if (!formState.listingPrice) errors.listingPrice = true;
    if (!formState.brandName) errors.brandName = true;
    if (!formState.model) errors.model = true;
    if (!formState.vinNumber) errors.vinNumber = true;
    if (!formState.transmissionType) errors.transmissionType = true;
    if (!formState.vat_or_margin) errors.vat_or_margin = true;
    if (!formState.seat) errors.seat = true;

    // Email validation - check format if email is provided
    if (formState.sellerEmail && formState.sellerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.sellerEmail.trim())) {
        errors.sellerEmail = true;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const hasEmailError = errors.sellerEmail;
      const hasRequiredFieldErrors = Object.keys(errors).some((key) => key !== 'sellerEmail');

      if (hasEmailError && hasRequiredFieldErrors) {
        toast.error('Please fill in all required fields and enter a valid email address');
      } else if (hasEmailError) {
        toast.error('Please enter a valid email address');
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }

    // Clear any previous errors
    setFieldErrors({});

    // Show loading toast
    let loadingToast;
    try {
      const formData = new FormData();

      const listingData = {
        ...allLanguageData['en'],
        status_id: selectedStatus,
        internal_url: formState.internalUrl || url,
        vat_or_margin: formState.vat_or_margin,
        expires_in: parseInt(formState.expiresIn),
        currency: formState.currency,
        co2: formState.co2,
        seat: formState.seat && formState.seat !== '' ? parseInt(formState.seat, 10) : null,
        km_stand: formState.kmStand ? parseInt(formState.kmStand) : null,
        // Remove commas from listing price before sending
        listing_price: formState.listingPrice
          ? String(formState.listingPrice).replace(/,/g, '')
          : '',
        is_listingsiteb: urlType === 'listingsiteb' && wasUrlFetched,
        is_listingsitea: urlType === 'listingsitea' && wasUrlFetched,
        is_listingsitec: urlType === 'listingsitec' && wasUrlFetched,
        is_hasznalt: urlType === 'hasznalt' && wasUrlFetched,
        is_sauto: urlType === 'sauto' && wasUrlFetched,
        is_mobile: urlType === 'mobile' && wasUrlFetched,
        // Include remaining fetched images
        images: fetchedImages,
        belgium_price: formState.price || 0,
      };

      // Check if there are any images (fetched or manually uploaded)
      if (imagePreviews.length === 0 && fetchedImages.length === 0) {
        toast.error('Please add images');
        return;
      }
      loadingToast = toast.loading('Creating listing...');

      // Append each field individually to FormData
      Object.entries(listingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // If the value is an array, join it with commas
          const finalValue = Array.isArray(value) ? value.join(',') : value;
          formData.append(key, finalValue);
        }
      });

      // Append all images to the same field name
      if (selectedImages.length > 0) {
        // Convert FileList to array and append all files
        Array.from(selectedImages).forEach((file) => {
          formData.append('manuelImages', file);
        });
      }

      // Append damaged parts data
      if (damagedPartsData.length > 0) {
        console.log('Damaged parts data before FormData:', damagedPartsData);
        damagedPartsData.forEach((partData, index) => {
          formData.append(`damagedParts[${index}][part]`, partData.part);

          // Append all images for this part
          if (partData.images && partData.images.length > 0) {
            console.log(`Part ${partData.part} has ${partData.images.length} images`);
            partData.images.forEach((image, imageIndex) => {
              console.log(`Appending image ${imageIndex} for part ${partData.part}:`, image);
              formData.append(`damagedParts[${index}][images]`, image);
            });
          } else {
            console.log(`Part ${partData.part} has no images`);
          }

          // Append descriptions for each image
          if (partData.descriptions && partData.descriptions.length > 0) {
            console.log(
              `Part ${partData.part} has ${partData.descriptions.length} image descriptions`
            );
            partData.descriptions.forEach((description, descIndex) => {
              if (description) {
                console.log(
                  `Appending image description ${descIndex} for part ${partData.part}: ${description}`
                );
                formData.append(`damagedParts[${index}][descriptions]`, description);
              }
            });
          } else {
            console.log(`Part ${partData.part} has no image descriptions`);
          }

          // Append general part descriptions (without images)
          if (partData.partDescriptions && partData.partDescriptions.length > 0) {
            console.log(
              `Part ${partData.part} has ${partData.partDescriptions.length} general descriptions`
            );
            partData.partDescriptions.forEach((description, descIndex) => {
              if (description) {
                console.log(
                  `Appending general description ${descIndex} for part ${partData.part}: ${description}`
                );
                formData.append(`damagedParts[${index}][partDescriptions]`, description);
              }
            });
          } else {
            console.log(`Part ${partData.part} has no general descriptions`);
          }
        });
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? '(binary)' : pair[1]));
      }

      const response = await createManualListing(formData);
      console.log('Listing created successfully:', response);
      toast.dismiss(loadingToast);
      toast.success('Listing created successfully!');

      setSelectedImages([]); // Clear selected images after successful submission
      setFetchedImages([]); // Clear fetched images after successful submission
      setDamagedPartsData([]); // Clear damaged parts data after successful submission
      setImagePreviews([]); // Clear image previews after successful submission
      setImagesInitialized(false); // Reset images initialized flag
      setFormState({
        horsepower: '',
        registrationNumber: '',
        firstRegistration: '',
        kmStand: '',
        vinNumber: '',
        listingPrice: '',
        brandName: '',
        model: '',
        color: '',
        fuelType: '',
        transmissionType: '',
        features: '',
        vat_or_margin: 'Excl. VAT',
        expiresIn: '48',
        currency: '',
        co2: '',
        seat: '',
        internalUrl: '',
        previousAccidents: false,
        sellerCompany: '',
        sellerEmail: '',
        telephone: '',
        sellerAddress: '',
        amountPurchased: '',
        price: '',
        avgSellingTime: '',
        listingsiteaLink: '',
        transportCost: '',
        location: '',
        vehicleCategory: '',
        interiorColor: '',
        trimPackage: '',
        engine: '',
        serviceHistory: '',
        numberOfOwners: '',
      });
      setUrl('');
      setWasUrlFetched(false); // Reset URL fetched flag
      handleFeaturesChange([]);

      // sleep 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.details || error.message || 'Unknown error';
      toast.error(`Error creating listing: ${errorMessage}`);
    }
  };

  return (
    <div className="w-full flex flex-col bg-gray-800 rounded-lg shadow-lg p-5">
      <h2 className="text-white mb-5 text-2xl font-bold px-5">Add Deal</h2>
      <div className="flex items-center mb-5 px-5">
        <label htmlFor="url" className="sr-only">
          URL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (e.g., https://suchen.mobile.de/auto-inserat/volkswagen-golf-vii-lim-r-bmt-4motion-abt-virtual-unikat-alfter/434000140.html)"
          className="flex-1 p-2 mr-2 rounded border border-gray-600 bg-gray-700 text-white"
        />
        <button
          onClick={handleFetch}
          className="p-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={!url}
        >
          Fetch
        </button>
      </div>
      {/* URL Input */}
      {allLanguageData['en']?.listing_price && (
        <div className="text-white m-5 w-full flex justify-start">
          Current Price of Listing: {allLanguageData['en'].listing_price}{' '}
          {allLanguageData['en'].currency}
        </div>
      )}
      {loading && (
        <div className="text-white m-5 w-full flex justify-end px-5">
          Loading... <span className="loader"></span>
        </div>
      )}
      <div className="p-5 w-full mx-auto  flex gap-5">
        <div className="flex flex-col w-7/12">
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

          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {/* Mandatory Fields First */}
            <div className="flex flex-col">
              <label htmlFor="horsepower" className="text-white mb-1">
                Horsepower *
              </label>
              <input
                id="horsepower"
                type="text"
                value={formState.horsepower}
                onChange={(e) => updateFormField('horsepower', e.target.value)}
                placeholder="Horsepower"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.horsepower ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="registrationNumber" className="text-white mb-1">
                Registration Number *
              </label>
              <input
                id="registrationNumber"
                type="text"
                value={formState.registrationNumber}
                onChange={(e) => updateFormField('registrationNumber', e.target.value)}
                placeholder="Registration Number"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.registrationNumber ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="listingPrice" className="text-white mb-1">
                Listing Price € *
              </label>
              <input
                id="listingPrice"
                type="text"
                value={formState.listingPrice}
                onChange={(e) => {
                  // Remove all non-digit characters
                  const value = e.target.value.replace(/\D/g, '');
                  // Format with commas
                  const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  updateFormField('listingPrice', formattedValue);
                }}
                placeholder="Listing Price €"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.listingPrice ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="brandName" className="text-white mb-1">
                Brand Name *
              </label>
              <input
                id="brandName"
                type="text"
                value={formState.brandName}
                onChange={(e) => updateFormField('brandName', e.target.value)}
                placeholder="Brand Name"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.brandName ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="model" className="text-white mb-1">
                Model *
              </label>
              <input
                id="model"
                type="text"
                value={formState.model}
                onChange={(e) => updateFormField('model', e.target.value)}
                placeholder="Model"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.model ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="kmStand" className="text-white mb-1">
                KM Stand *
              </label>
              <input
                id="kmStand"
                type="text"
                value={formState.kmStand}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  updateFormField('kmStand', value);
                }}
                placeholder="KM Stand"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.kmStand ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="vinNumber" className="text-white mb-1">
                VIN Number *
              </label>
              <input
                id="vinNumber"
                type="text"
                value={formState.vinNumber}
                onChange={(e) => updateFormField('vinNumber', e.target.value)}
                placeholder="VIN Number"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.vinNumber ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="transmissionType" className="text-white mb-1">
                Transmission Type *
              </label>
              <select
                id="transmissionType"
                value={formState.transmissionType}
                onChange={(e) => updateFormField('transmissionType', e.target.value)}
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.transmissionType ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              >
                <option value="">Select Transmission Type</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="seat" className="text-white mb-1">
                Seats *
              </label>
              <input
                id="seat"
                type="number"
                min="1"
                max="50"
                value={formState.seat}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  const intValue = value ? parseInt(value, 10) : '';
                  updateFormField('seat', intValue);
                }}
                placeholder="Number of seats"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.seat ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="vatOrMargin" className="text-white mb-1">
                VAT *
              </label>
              <select
                id="vatOrMargin"
                value={formState.vat_or_margin}
                onChange={(e) => updateFormField('vat_or_margin', e.target.value)}
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.vat_or_margin ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              >
                <option value="Excl. VAT">Excl. VAT</option>
                <option value="Incl. VAT">Incl. VAT</option>
              </select>
            </div>

            {/* Optional Fields */}
            <div className="flex flex-col">
              <label htmlFor="firstRegistration" className="text-white mb-1">
                First Registration
              </label>
              <input
                id="firstRegistration"
                type="date"
                value={formState.firstRegistration}
                onChange={(e) => updateFormField('firstRegistration', e.target.value)}
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="color" className="text-white mb-1">
                Exterior Color
              </label>
              <input
                id="color"
                type="text"
                value={formState.color}
                onChange={(e) => updateFormField('color', e.target.value)}
                placeholder="Exterior Color"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="interiorColor" className="text-white mb-1">
                Interior Color
              </label>
              <input
                id="interiorColor"
                type="text"
                value={formState.interiorColor}
                onChange={(e) => updateFormField('interiorColor', e.target.value)}
                placeholder="Interior Color"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="fuelType" className="text-white mb-1">
                Fuel Type
              </label>
              <input
                id="fuelType"
                type="text"
                value={formState.fuelType}
                onChange={(e) => updateFormField('fuelType', e.target.value)}
                placeholder="Fuel Type"
                maxLength="15"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="engine" className="text-white mb-1">
                Engine
              </label>
              <input
                id="engine"
                type="text"
                value={formState.engine}
                onChange={(e) => updateFormField('engine', e.target.value)}
                placeholder="Engine"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="location" className="text-white mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formState.location}
                onChange={(e) => updateFormField('location', e.target.value)}
                placeholder="Location"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="vehicleCategory" className="text-white mb-1">
                Vehicle Category
              </label>
              <input
                id="vehicleCategory"
                type="text"
                value={formState.vehicleCategory}
                onChange={(e) => updateFormField('vehicleCategory', e.target.value)}
                placeholder="Vehicle Category"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="trimPackage" className="text-white mb-1">
                Trim Package
              </label>
              <input
                id="trimPackage"
                type="text"
                value={formState.trimPackage}
                onChange={(e) => updateFormField('trimPackage', e.target.value)}
                placeholder="Trim Package"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="serviceHistory" className="text-white mb-1">
                Service History
              </label>
              <input
                id="serviceHistory"
                type="text"
                value={formState.serviceHistory}
                onChange={(e) => updateFormField('serviceHistory', e.target.value)}
                placeholder="Service History"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="numberOfOwners" className="text-white mb-1">
                Number of Owners
              </label>
              <input
                id="numberOfOwners"
                type="number"
                min="0"
                value={formState.numberOfOwners}
                onChange={(e) => updateFormField('numberOfOwners', e.target.value)}
                placeholder="Number of Owners"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="status" className="text-white mb-1">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                disabled
                onChange={(e) => setSelectedStatus(e.target.value)}
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
              <label htmlFor="expiresIn" className="text-white mb-1">
                Expiration (hours)
              </label>
              <select
                id="expiresIn"
                value={formState.expiresIn}
                onChange={(e) => updateFormField('expiresIn', e.target.value)}
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              >
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="120">120 hours</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="co2" className="text-white mb-1">
                CO2 Emissions
              </label>
              <input
                id="co2"
                type="text"
                value={formState.co2}
                onChange={(e) => updateFormField('co2', e.target.value)}
                placeholder="CO2 Emissions"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="internalUrl" className="text-white mb-1">
                Internal URL
              </label>
              <input
                id="internalUrl"
                type="text"
                value={url ? url : formState.internalUrl}
                onChange={(e) => updateFormField('internalUrl', e.target.value)}
                placeholder="Internal URL"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="previousAccidents" className="text-white mb-1">
                Previous Accidents
              </label>
              <div className="flex items-center p-2">
                <input
                  id="previousAccidents"
                  type="checkbox"
                  checked={formState.previousAccidents}
                  onChange={(e) => updateFormField('previousAccidents', e.target.checked)}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-white text-sm">Previous accidents</span>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="sellerCompany" className="text-white mb-1">
                Seller Company
              </label>
              <input
                id="sellerCompany"
                type="text"
                value={formState.sellerCompany}
                onChange={(e) => updateFormField('sellerCompany', e.target.value)}
                placeholder="Seller Company"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="sellerEmail" className="text-white mb-1">
                Seller Email
              </label>
              <input
                id="sellerEmail"
                type="email"
                value={formState.sellerEmail}
                onChange={(e) => updateFormField('sellerEmail', e.target.value)}
                placeholder="Seller Email"
                className={`p-2 rounded border bg-gray-700 text-white ${
                  fieldErrors.sellerEmail ? 'border-red-500 border-2' : 'border-gray-600'
                }`}
              />
              {fieldErrors.sellerEmail && (
                <span className="text-red-400 text-sm mt-1">
                  Please enter a valid email address
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="telephone" className="text-white mb-1">
                Telephone
              </label>
              <input
                id="telephone"
                type="tel"
                value={formState.telephone}
                onChange={(e) => updateFormField('telephone', e.target.value)}
                placeholder="Telephone"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="amountPurchased" className="text-white mb-1">
                Amount Purchased €
              </label>
              <input
                id="amountPurchased"
                type="number"
                step="0.01"
                min="0"
                value={formState.amountPurchased}
                onChange={(e) => updateFormField('amountPurchased', e.target.value)}
                placeholder="Amount Purchased €"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label htmlFor="sellerAddress" className="text-white mb-1">
                Seller Address
              </label>
              <textarea
                id="sellerAddress"
                value={formState.sellerAddress}
                onChange={(e) => updateFormField('sellerAddress', e.target.value)}
                placeholder="Seller Address"
                rows="3"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white resize-vertical"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="price" className="text-white mb-1">
                Belgium Price
              </label>
              <input
                id="price"
                type="text"
                value={formState.price}
                onChange={(e) => updateFormField('price', e.target.value)}
                placeholder="Price"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="avgSellingTime" className="text-white mb-1">
                Avg Selling Time
              </label>
              <input
                id="avgSellingTime"
                type="number"
                value={formState.avgSellingTime}
                onChange={(e) => updateFormField('avgSellingTime', e.target.value)}
                onWheel={(e) => e.target.blur()}
                placeholder="e.g. 18"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="transportCost" className="text-white mb-1">
                Transport Cost €
              </label>
              <input
                id="transportCost"
                type="text"
                value={formState.transportCost}
                onChange={(e) => updateFormField('transportCost', e.target.value)}
                placeholder="Transport Cost €"
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="listingsiteaLink" className="text-white mb-1">
                Link to ListingSiteA
              </label>
              <input
                id="listingsiteaLink"
                type="url"
                value={formState.listingsiteaLink}
                onChange={(e) => updateFormField('listingsiteaLink', e.target.value)}
                placeholder="https://www.listingsitea.example.com/..."
                className="p-2 rounded border border-gray-600 bg-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* second column */}
        <div className="w-5/12 flex flex-col justify-start">
          <div className="">
            <label htmlFor="features" className="text-white mb-1 block">
              Features
            </label>
            <div className="flex gap-2 mb-2">
              <textarea
                id="features"
                value={features}
                onChange={(e) => handleFeaturesChange(e.target.value)}
                placeholder="Enter features (comma-separated)"
                className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white h-40"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Separate features with commas</p>
              <button
                onClick={() => setShowFeaturePopup(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* Feature Popup */}
          {showFeaturePopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-white text-lg font-semibold mb-4">Add New Feature</h3>
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Enter new feature"
                  className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowFeaturePopup(false);
                      setNewFeature('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Damaged Parts Popup */}
          {showDamagedPartsPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full ">
              <div className="bg-gray-800  rounded-lg shadow-xl max-w-8xl max-h-[90vh] overflow-y-auto p-5">
                <h3 className="text-white text-lg font-semibold mb-4">Select Damaged Part</h3>
                <DamagedParts
                  selectedPart={selectedDamagedPart}
                  onPartSelect={(partId) => {
                    // Single selection - if clicking the same part, deselect it, otherwise select the new part
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
          <div className="mt-5">
            <div className="flex flex-col">
              <label className="text-white mb-2">Damaged Parts</label>
              <button
                onClick={() => setShowDamagedPartsPopup(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 self-start"
              >
                Select Damaged Part
              </button>

              {/* Damaged Parts Preview */}
              {damagedPartsData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white text-sm font-semibold mb-3">Selected Damaged Parts:</h4>
                  <div className="flex flex-wrap gap-4 ">
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
                                        typeof image === 'string'
                                          ? image
                                          : URL.createObjectURL(image)
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

                        {(!partData.images || partData.images.length === 0) && (
                          <p className="text-gray-400 text-xs">No images uploaded</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="images" className="text-white mb-1 block">
              Upload Images (Max {maxImageSize}MB each)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Files
              </label>
              <span className="text-sm text-gray-300">
                {selectedImages.length} manually uploaded, {fetchedImages.length} from URL
              </span>
            </div>

            {/* Display fetched images */}
            {fetchedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white text-sm font-semibold mb-2">Fetched Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fetchedImages.map((imageUrl, index) => (
                    <div key={`fetched-${index}`} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Fetched ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Failed to load image:', imageUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                        <button
                          onClick={() => handleRemoveFetchedImage(index)}
                          className="self-end text-white hover:text-red-500 text-xl font-bold"
                        >
                          ✕
                        </button>
                        <p className="text-white text-xs">Fetched Image {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display manually uploaded images */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white text-sm font-semibold mb-2">Manually Uploaded Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`manual-${index}`} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="self-end text-white hover:text-red-500 text-xl font-bold"
                        >
                          ✕
                        </button>
                        <p className="text-white text-xs truncate">{preview.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="p-2 px-4 mt-5 rounded bg-green-600 text-white hover:bg-green-700 self-end"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDeal;
