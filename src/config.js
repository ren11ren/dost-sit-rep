// Get the current hostname/IP from window location
// This works for both localhost and network access
const getApiUrl = () => {
  // If running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5002/api';
  }
  // Otherwise, use the same hostname as the page (for phone access)
  return `http://${window.location.hostname}:5002/api`;
};

export const API_URL = getApiUrl();
