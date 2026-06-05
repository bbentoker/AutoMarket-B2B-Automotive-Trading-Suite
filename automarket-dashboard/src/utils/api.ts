import { getToken } from './auth';

interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    
    // Debug: Log the base URL
    console.log('Raw environment variable:', import.meta.env.VITE_API_BASE_URL);
    console.log('Raw API Base URL:', envUrl);
    
    // Clean up and construct the base URL properly
    this.baseURL = this.constructBaseURL(envUrl);
    console.log('Final API Base URL:', this.baseURL);
  }

  private constructBaseURL(url: string): string {
    // If it's just a domain without protocol, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Remove any duplicate domain parts (e.g., .automarket.example.com/.automarket.example.com)
    url = url.replace(/\.([^\/]+)\.com\/\.\1\.com/g, '.$1.com');
    
    // Remove double slashes except after protocol
    url = url.replace(/([^:]\/)\/+/g, '$1');
    
    // Ensure it ends with /api for consistency
    if (!url.endsWith('/api')) {
      url = url.endsWith('/') ? url + 'api' : url + '/api';
    }
    
    return url;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async makeRequest<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // Debug: Log the request details
    console.log('Making request to:', fullUrl);
    console.log('Request config:', config);

    try {
      const response = await fetch(fullUrl, config);
      
      if (response.status === 401) {
        console.log('🚨 API returned 401 Unauthorized');
        console.log('  Response:', response);
        console.log('  Current token:', getToken());
        
        // Parse the token to understand why it might be rejected
        const currentToken = getToken();
        if (currentToken) {
          try {
            const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]));
            console.log('🔍 Token payload:', tokenPayload);
            console.log('🕒 Token exp (unix):', tokenPayload.exp);
            console.log('🕒 Token exp (date):', new Date(tokenPayload.exp * 1000));
            console.log('🕒 Current time (unix):', Math.floor(Date.now() / 1000));
            console.log('🕒 Time until expiry (seconds):', tokenPayload.exp - Math.floor(Date.now() / 1000));
          } catch (e) {
            console.log('❌ Failed to parse token payload:', e);
          }
        }
        
        // Log response details (try to read as text)
        response.clone().text().then(text => {
          console.log('📄 Response body:', text);
        }).catch(e => {
          console.log('❌ Failed to read response body:', e);
        });
        
        // Don't redirect immediately - let the authentication system handle it
        console.log('⚠️ API received 401, letting auth system handle redirect');
        console.log('💡 Possible causes:');
        console.log('  - Server clock skew');
        console.log('  - Wrong JWT secret on server');
        console.log('  - Token format not expected by server');
        console.log('  - Additional claims required');
        
        // Just throw the error - don't redirect here
        throw new Error('Unauthorized - Server rejected token');
      }

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T = unknown>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'GET',
    });
  }

  // POST request
  async post<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = unknown>(url: string, data: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'DELETE',
    });
  }

  // Dashboard specific methods
  async getDashboardOverview(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/overview');
  }

  async getCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/cars');
  }

  async getReservedCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/cars/reserved');
  }

  async getMyOffers(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/offers/my');
  }

  async getDashboardOffers(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/offers');
  }

  async getPurchasedCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/cars/purchased');
  }

  async getInvoices(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/invoices');
  }

  async getDashboardInvoices(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/invoices');
  }

  async getDashboardPurchasedCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/purchased-cars');
  }
  async getTrackPurchasedCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/track-purchased-cars');
  }
  async getDashboardSavedCars(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/saved-cars');
  }

  async getWeeklyReport(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/users/get-weekly-report');
  }

  /**
   * Checks weekly report availability without throwing on 404.
   * Returns available=false only when the server responds with 404
   * and the body matches the expected shape/message provided.
   */
  async checkWeeklyReportAvailability(): Promise<{ available: boolean; status: number; data?: unknown }> {
    const url = `${this.baseURL}/users/get-weekly-report`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      // If unauthorized, let auth system handle it
      if (response.status === 401) {
        console.log('🚨 Weekly report API returned 401 Unauthorized');
        return { available: false, status: 401 };
      }

      let data: unknown = undefined;
      try {
        data = await response.clone().json();
      } catch {
        // ignore parse errors; data stays undefined
      }

      // Block navigation only for this precise case
      if (
        response.status === 404 &&
        data &&
        typeof data === 'object' &&
        'success' in data &&
        (data as { success?: boolean }).success === false &&
        'message' in data &&
        (data as { message?: string }).message === 'Weekly report options not found. Please configure your report preferences first.'
      ) {
        return { available: false, status: 404, data };
      }

      // For any other non-OK response, allow navigation (don't block)
      if (!response.ok) {
        return { available: true, status: response.status, data };
      }

      return { available: true, status: response.status, data };
    } catch (error) {
      console.error('checkWeeklyReportAvailability failed:', error);
      // On network or unexpected errors, do not block navigation
      return { available: true, status: 0 };
    }
  }

  async getDashboardProfile(): Promise<ApiResponse<unknown>> {
    return this.get<unknown>('/dashboard/profile');
  }

  async updateDashboardProfile(profileData: unknown): Promise<ApiResponse<unknown>> {
    return this.put<unknown>('/dashboard/profile', profileData);
  }

  async changeDashboardPassword(passwordData: unknown): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/dashboard/profile/change-password', passwordData);
  }

    async loginWithCode(loginCode: string): Promise<{ message: string; token: string; user: unknown }> {
    // This endpoint doesn't need the /api prefix
    // Remove /api suffix from the already cleaned base URL
    const baseUrl = this.baseURL.endsWith('/api') ? this.baseURL.slice(0, -4) : this.baseURL;
    const url = `${baseUrl}/auth/dealer/login-code`;
    
    console.log('🔐 Using base URL:', this.baseURL);
    console.log('🔐 Login endpoint URL:', url);
    
    // Make direct request without using makeRequest to avoid /api prefix
    try {
      const payload = { code: loginCode };
      console.log('📤 Login request payload:', payload);
      console.log('📤 Login request URL:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login API Request failed:', error);
      throw error;
    }
  }

  async removeReservedCar(listingId: number): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/dashboard/remove-reserved', { listing_id: listingId });
  }

  async processOffer(offerId: number, action: 'accept' | 'decline'): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/dashboard/process-offer', { 
      offer_id: offerId, 
      action: action 
    });
  }

  async unsaveCar(listingId: number): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/dashboard/unsave-car', { listing_id: listingId });
  }

  async getWishlist(userId: string): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/users/get-wishlist', { user_id: userId });
  }

  async addWishlistClick(wishlistOptionId: number, listingId: number, userId: number): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/users/add-wishlist-click', { 
      wishlist_option_id: wishlistOptionId,
      listing_id: listingId,
      user_id: userId
    });
  }

  async postWishlistActivity(code: string): Promise<ApiResponse<unknown>> {
    return this.post<unknown>('/users/wishlist-activity', { 
      code: code
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService; 