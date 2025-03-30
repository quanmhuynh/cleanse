import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Create a history cache to ensure consistent history data across screens
interface HistoryCache {
  [userId: string]: {
    timestamp: number;
    data: any[];
  }
}

// Cache history data for 5 seconds max to avoid too many API calls
const historyCache: HistoryCache = {};
const CACHE_DURATION = 5000; // 5 seconds

// Function to get cached history or fetch new data
const getCachedHistory = async (userId: string, fetchFn: () => Promise<any[]>): Promise<any[]> => {
  const now = Date.now();
  const cachedData = historyCache[userId];
  
  // If we have valid cached data, return it
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`Using cached history data for user ${userId} (${cachedData.data.length} items)`);
    return cachedData.data;
  }
  
  // Otherwise fetch new data
  console.log(`Fetching fresh history data for user ${userId}`);
  try {
    const data = await fetchFn();
    // Update cache
    historyCache[userId] = {
      timestamp: now,
      data: data
    };
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    // Return empty array on error
    return [];
  }
};

/**
 * Determines the appropriate API URL based on platform and environment
 * This handles different scenarios:
 * - Web development: Uses localhost
 * - iOS simulator: Uses localhost
 * - Android emulator: Uses 10.0.2.2 (special Android alias to host machine)
 * - Physical devices: Uses the development server's IP address
 */
export const getApiUrl = (): string => {
  // Get the development machine's IP address from Expo Constants
  const devServerIp = Constants.expoConfig?.hostUri?.split(':')[0];
  
  if (Platform.OS === 'web') {
    // For web development, use localhost
    return 'http://localhost:8000';
  } else if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 (special alias to host machine)
    if (__DEV__ && devServerIp) {
      return `http://${devServerIp}:8000`;
    }
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator and physical devices
    if (__DEV__ && devServerIp) {
      return `http://${devServerIp}:8000`;
    }
    return 'http://localhost:8000';
  }
  
  // Fallback to localhost
  return 'http://localhost:8000';
};

// Cache the API URL so it doesn't change during runtime
export const API_URL = getApiUrl();

// Log the API URL on startup for debugging
console.log(`API URL configured as: ${API_URL}`);

/**
 * Helper function to make API requests
 * @param endpoint - API endpoint (without leading slash)
 * @param options - Fetch options
 * @returns Promise with response data
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}/${endpoint}`;
  
  console.log(`Making API request to: ${url}`, {
    method: options.method || 'GET',
    headers: options.headers
  });
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Special handling for specific endpoints and status codes
    if (!response.ok) {
      // Handle get_history 404 errors specially - return empty array
      if (endpoint.startsWith('get_history') && response.status === 404) {
        console.log('No history found, returning empty array');
        return [] as unknown as T;
      }
      
      // Check if this is a get_user 404 error
      if (endpoint.startsWith('get_user') && response.status === 404) {
        console.log('User not found, returning null');
        return null as T;
      }
      
      // For other errors, try to get detailed error message
      try {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(
          errorData.detail || `API error: ${response.status} ${response.statusText}`
        );
      } catch (jsonError) {
        // Couldn't parse the error response
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      console.log('Returning empty object for 204 response');
      return {} as T;
    }
    
    // Special case for empty responses that should be arrays
    if (endpoint.startsWith('get_history')) {
      try {
        const jsonData = await response.json();
        console.log(`History data type: ${typeof jsonData}, is array: ${Array.isArray(jsonData)}`);
        if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
          console.log('History is empty, returning empty array');
        }
        return jsonData;
      } catch (jsonError) {
        console.error('Error parsing JSON response for history:', jsonError);
        // Return empty array for history endpoint on parse error
        return [] as unknown as T;
      }
    }
    
    try {
      const jsonData = await response.json();
      console.log('Successful response data type:', typeof jsonData);
      return jsonData;
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Unable to parse server response');
    }
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    
    // Special case for history endpoint - return empty array on error
    if (endpoint.startsWith('get_history')) {
      console.log('Returning empty array for history on fetch error');
      return [] as unknown as T;
    }
    
    throw fetchError;
  }
};

// API wrapper functions for common operations
export const api = {
  /**
   * Make a GET request to the API
   */
  get: <T>(endpoint: string, options: RequestInit = {}) => {
    // Special handling for history endpoint to use cache
    if (endpoint.startsWith('get_history')) {
      const emailMatch = endpoint.match(/email=([^&]+)/);
      if (emailMatch && emailMatch[1]) {
        const userId = emailMatch[1];
        return getCachedHistory(userId, () => 
          apiRequest<T>(endpoint, { ...options, method: 'GET' }) as Promise<any[]>
        ) as unknown as Promise<T>;
      }
    }
    
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  
  /**
   * Make a POST request to the API
   */
  post: <T>(endpoint: string, data: any, options: RequestInit = {}) => {
    // When adding history, invalidate the cache for that user
    if (endpoint === 'add_history' && data.email) {
      delete historyCache[data.email];
      console.log(`Invalidated history cache for user ${data.email}`);
    }
    
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * Make a PUT request to the API
   */
  put: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Make a DELETE request to the API
   */
  delete: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
    
  /**
   * Clear the history cache for a specific user or all users
   */
  clearHistoryCache: (userId?: string) => {
    if (userId) {
      delete historyCache[userId];
      console.log(`Manually cleared history cache for user ${userId}`);
    } else {
      Object.keys(historyCache).forEach(key => delete historyCache[key]);
      console.log('Manually cleared all history caches');
    }
  }
};

export default api; 