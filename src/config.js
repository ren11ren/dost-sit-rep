// Get the current hostname/IP from window location
// This works for both localhost and network access
const getApiUrl = () => {
  const apiPort = process.env.REACT_APP_API_PORT || '5010';

  // If running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:${apiPort}/api`;
  }
  // Otherwise, use the same hostname as the page (for phone access)
  return `http://${window.location.hostname}:${apiPort}/api`;
};

export const API_URL = getApiUrl();
