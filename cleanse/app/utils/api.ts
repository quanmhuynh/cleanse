import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API error: ${response.status} ${response.statusText}`
    );
  }
  
  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};

// API wrapper functions for common operations
export const api = {
  /**
   * Make a GET request to the API
   */
  get: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  /**
   * Make a POST request to the API
   */
  post: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
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
};

export default api; 