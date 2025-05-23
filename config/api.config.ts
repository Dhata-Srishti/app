// API Configuration
// Central configuration for backend API settings

export const API_CONFIG = {
  // Base URL for the backend API
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
  TIMEOUT: 30000,
  
  // Default language settings
  DEFAULT_LANGUAGES: {
    SOURCE: 'english',
    TARGET: 'english',
  },
} as const;

// Helper function to get the full endpoint URL
export const getEndpointUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
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

export default API_CONFIG; 