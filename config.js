// API Configuration - Automatically detects environment
const getAPIBase = () => {
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000';
  }
  // If running on Railway or other hosting, use same origin
  return window.location.origin;
};

const API_BASE = getAPIBase();
console.log('🔧 API Base URL:', API_BASE);
