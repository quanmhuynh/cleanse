// Define routes for the application
export const ROUTES = {
  // Main screens
  HOME: '/',
  USERS: '/users',
  CAMERA: '/camera',
  
  // Survey screens
  SURVEY: '/screens/survey',
  
  // Add more routes as needed
};

// Function to navigate with parameters
export const createPath = (route: string, params?: Record<string, string>) => {
  if (!params) return route;
  
  const queryParams = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${route}?${queryParams}`;
}; 