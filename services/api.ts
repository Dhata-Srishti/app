// Dhata Backend API Service
// This service handles all communication with the Flask backend

// Use the local IP address instead of localhost for React Native compatibility
// To update: Run 'ifconfig | grep "inet " | grep -v 127.0.0.1' to get your current IP
const API_BASE_URL = 'http://192.168.199.96:5001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TextQueryRequest {
  prompt: string;
  src_lang?: string;
  tgt_lang?: string;
}

export interface TranslationRequest {
  text: string;
  src_lang?: string;
  tgt_lang?: string;
}

export interface VisionQueryRequest {
  query: string;
  src_lang?: string;
  tgt_lang?: string;
}

export interface ASRRequest {
  language?: string;
}

export interface TTSRequest {
  input_text: string;
}

export interface DocumentExtractionRequest {
  page_number?: number;
  src_lang?: string;
  tgt_lang?: string;
}

// Language code mapping - maps common codes to API expected format
const LANGUAGE_MAP: { [key: string]: string } = {
  'en': 'english',
  'hi': 'hindi',
  'kn': 'kannada',
  'as': 'assamese',
  'bn': 'bengali',
  'gu': 'gujarati',
  'ml': 'malayalam',
  'mr': 'marathi',
  'or': 'odia',
  'pa': 'punjabi',
  'ta': 'tamil',
  'te': 'telugu',
  // Also support direct mapping
  'english': 'english',
  'hindi': 'hindi',
  'kannada': 'kannada',
  'assamese': 'assamese',
  'bengali': 'bengali',
  'gujarati': 'gujarati',
  'malayalam': 'malayalam',
  'marathi': 'marathi',
  'odia': 'odia',
  'punjabi': 'punjabi',
  'tamil': 'tamil',
  'telugu': 'telugu',
};

// Helper function to map language codes
const mapLanguageCode = (lang?: string): string => {
  if (!lang) return 'english';
  return LANGUAGE_MAP[lang.toLowerCase()] || 'english';
};

class DhataApiService {
  private baseUrl: string;
  private timeoutMs: number = 30000; // 30 second timeout

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a fetch request with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your network connection');
      }
      throw error;
    }
  }

  /**
   * Check if the backend API is healthy
   */
  async checkHealth(): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to connect to backend: ${error}`
      };
    }
  }

  /**
   * Send a text query to the AI chat
   */
  async textQuery(request: TextQueryRequest): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/text_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          src_lang: mapLanguageCode(request.src_lang),
          tgt_lang: mapLanguageCode(request.tgt_lang)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Text query failed: ${error}`
      };
    }
  }

  /**
   * Translate text between languages
   */
  async translate(request: TranslationRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          src_lang: mapLanguageCode(request.src_lang),
          tgt_lang: mapLanguageCode(request.tgt_lang)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Translation failed: ${error}`
      };
    }
  }

  /**
   * Upload an image and get a vision-based response
   */
  async visionQuery(request: VisionQueryRequest, imageUri: string): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('query', request.query);
      formData.append('src_lang', mapLanguageCode(request.src_lang));
      formData.append('tgt_lang', mapLanguageCode(request.tgt_lang));
      
      // Create a file blob from the image URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');

      const apiResponse = await fetch(`${this.baseUrl}/api/vision_query`, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      return await apiResponse.json();
    } catch (error) {
      return {
        success: false,
        error: `Vision query failed: ${error}`
      };
    }
  }

  /**
   * Convert speech to text (Automatic Speech Recognition)
   */
  async speechToText(request: ASRRequest, audioUri: string): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('language', mapLanguageCode(request.language));
      
      // Create a file blob from the audio URI
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append('audio', blob, 'audio.wav');

      const apiResponse = await fetch(`${this.baseUrl}/api/asr`, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      return await apiResponse.json();
    } catch (error) {
      return {
        success: false,
        error: `Speech to text failed: ${error}`
      };
    }
  }

  /**
   * Convert text to speech
   * Returns a URL to the generated audio file
   */
  async textToSpeech(request: TTSRequest): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: request.input_text
        })
      });

      if (response.ok) {
        // Return the URL to the audio file
        return response.url;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Text to speech failed:', error);
      return null;
    }
  }

  /**
   * Extract text from a document
   */
  async extractDocument(request: DocumentExtractionRequest, documentUri: string): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('page_number', (request.page_number || 1).toString());
      formData.append('src_lang', mapLanguageCode(request.src_lang));
      formData.append('tgt_lang', mapLanguageCode(request.tgt_lang));
      
      // Create a file blob from the document URI
      const response = await fetch(documentUri);
      const blob = await response.blob();
      formData.append('document', blob, 'document.pdf');

      const apiResponse = await fetch(`${this.baseUrl}/api/extract_document`, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      return await apiResponse.json();
    } catch (error) {
      return {
        success: false,
        error: `Document extraction failed: ${error}`
      };
    }
  }

  /**
   * Update the base URL for the API (useful for switching between dev/prod)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Create a singleton instance
export const dhataApi = new DhataApiService();

// Export the class for custom instances
export default DhataApiService; 