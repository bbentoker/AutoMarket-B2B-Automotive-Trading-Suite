import { getApiBaseUrl } from './config';

export interface DealerRegistrationData {
  name: string;
  email: string;
  password: string;
  company_name: string;
  phone_number: string;
  vat_number: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: {
    token?: string;
    error?: string;
    statusCode?: number;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export const submitContactForm = async (data: ContactFormData) => {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/users/landing-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to submit contact form with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

export const loginDealer = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/auth/dealer/login`;
  
  console.log('Attempting login with URL:', url);
  console.log('Login credentials:', credentials);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('Error data:', errorData);
      throw new Error(errorData?.message || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Login response data:', data);
    return data;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};

export const registerDealer = async (data: DealerRegistrationData) => {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/auth/dealer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Check if the response contains an error message
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error registering dealer:', error);
    throw error;
  }
};

export interface Listing {
  id: number;
  brand_name: string;
  model: string;
  first_registration: string;
  fuel_type: string;
  transmission_type: string;
  km_stand: number;
  listing_price: string;
  currency: string;
  features: string;
  status_id: number;
  created_at: string;
  remaining_time: string;
  first_photo: string;
}

export const fetchListings = async (): Promise<Listing[]> => {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/users/fetch-listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched listings:', data);
    return data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}; 