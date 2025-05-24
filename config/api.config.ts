// API Configuration
// Central configuration for backend API settings

export const API_CONFIG = {
  // Base URL for the main backend API (Flask server on port 5001)
  // For local development: http://localhost:5001
  // For React Native on physical device: http://YOUR_IP:5001
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    TEXT_QUERY: '/api/text_query',
    VISION_QUERY: '/api/vision_query',
    ASR: '/api/asr',
    TRANSLATE: '/api/translate',
    TTS: '/api/tts',
    EXTRACT_DOCUMENT: '/api/extract_document',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 60000,
  
  // Default language settings
  DEFAULT_LANGUAGES: {
    SOURCE: 'english',
    TARGET: 'english',
  },
} as const;

// Transport Service Configuration (Go server on port 8083)
export const TRANSPORT_API_CONFIG = {
  // Base URL for the transport backend API (Go server on port 8083)
  // For local development: http://localhost:8083
  // For React Native on physical device: http://YOUR_IP:8083
  BASE_URL: process.env.EXPO_PUBLIC_TRANSPORT_API_URL || 'http://localhost:8083',
  
  // Transport API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/transport/health',
    SEARCH_BUSES: '/api/transport/search-buses',
    BUS_ROUTE: '/api/transport/bus-route',
    BMTC_BUSES: '/api/transport/bmtc-buses',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 20000,
} as const;

// Helper function to get the full endpoint URL for main API
export const getEndpointUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Helper function to get the full endpoint URL for transport API
export const getTransportEndpointUrl = (endpoint: keyof typeof TRANSPORT_API_CONFIG.ENDPOINTS): string => {
  return `${TRANSPORT_API_CONFIG.BASE_URL}${TRANSPORT_API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Helper function to validate API configuration
export const validateApiConfig = (): boolean => {
  try {
    new URL(API_CONFIG.BASE_URL);
    return true;
  } catch {
    console.error('Invalid API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    return false;
  }
};

// Helper function to validate transport API configuration
export const validateTransportApiConfig = (): boolean => {
  try {
    new URL(TRANSPORT_API_CONFIG.BASE_URL);
    return true;
  } catch {
    console.error('Invalid TRANSPORT_API_CONFIG.BASE_URL:', TRANSPORT_API_CONFIG.BASE_URL);
    return false;
  }
};

export default API_CONFIG; 