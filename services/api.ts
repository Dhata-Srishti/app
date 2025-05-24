// Dhata Backend API Service
// This service handles all communication with the Flask backend

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { API_CONFIG, validateApiConfig } from '../config/api.config';

// Use centralized configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

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
  src_lang?: string;  // Optional source language, defaults to 'english'
  return_translation?: boolean;  // Optional flag to return translation text
}

export interface TTSResponse {
  audioUri: string | null;
  kannada_text?: string;
  original_text?: string;
  src_lang?: string;
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
  private timeoutMs: number = API_CONFIG.TIMEOUT;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    
    // Validate configuration on initialization
    if (!validateApiConfig()) {
      console.warn('API configuration validation failed. Please check your settings.');
    }
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
        throw new Error('Request timeout - please check your Network connection');
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
   * Automatically translates input text to Kannada before generating speech
   * (TTS only works with Kannada text)
   * Returns a TTSResponse with audio URI and optional translation info
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: request.input_text,
          src_lang: request.src_lang || 'english',
          return_translation: request.return_translation || false
        })
      });

      if (response.ok) {
        // Check if response is JSON (when return_translation=true) or binary audio
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON response with translation
          const jsonResponse = await response.json();
          
          if (jsonResponse.success && jsonResponse.audio_base64) {
            // Convert base64 to audio file
            const audioBlob = new Blob(
              [Uint8Array.from(atob(jsonResponse.audio_base64), c => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            );
            
            // For web platform, use blob URL directly
            if (Platform.OS === 'web') {
              const blobUrl = URL.createObjectURL(audioBlob);
              console.log('TTS audio blob URL created:', blobUrl);
              return {
                audioUri: blobUrl,
                kannada_text: jsonResponse.kannada_text,
                original_text: jsonResponse.original_text,
                src_lang: jsonResponse.src_lang
              };
            }
            
            // For native platforms, save the audio file
            const reader = new FileReader();
            return new Promise<TTSResponse>((resolve) => {
              reader.onloadend = async () => {
                try {
                  const base64data = reader.result as string;
                  const base64Audio = base64data.split(',')[1];
                  
                  const timestamp = Date.now();
                  const filename = `tts_audio_${timestamp}.mp3`;
                  const fileUri = FileSystem.documentDirectory + filename;
                  
                  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                    encoding: FileSystem.EncodingType.Base64,
                  });
                  
                  console.log('TTS audio saved to:', fileUri);
                  resolve({
                    audioUri: fileUri,
                    kannada_text: jsonResponse.kannada_text,
                    original_text: jsonResponse.original_text,
                    src_lang: jsonResponse.src_lang
                  });
                } catch (error) {
                  console.error('Error saving TTS audio file:', error);
                  resolve({
                    audioUri: null,
                    kannada_text: jsonResponse.kannada_text,
                    original_text: jsonResponse.original_text,
                    src_lang: jsonResponse.src_lang
                  });
                }
              };
              reader.onerror = () => {
                console.error('Error reading audio blob');
                resolve({
                  audioUri: null,
                  kannada_text: jsonResponse.kannada_text,
                  original_text: jsonResponse.original_text,
                  src_lang: jsonResponse.src_lang
                });
              };
              reader.readAsDataURL(audioBlob);
            });
          } else {
            throw new Error(jsonResponse.error || 'TTS failed');
          }
        } else {
          // Handle binary audio response (legacy behavior)
          const audioBlob = await response.blob();
          
          // For web platform, use blob URL directly
          if (Platform.OS === 'web') {
            const blobUrl = URL.createObjectURL(audioBlob);
            console.log('TTS audio blob URL created:', blobUrl);
            return {
              audioUri: blobUrl,
              original_text: request.input_text,
              src_lang: request.src_lang || 'english'
            };
          }
          
          // For native platforms, convert blob to base64 and save to file system
          const reader = new FileReader();
          return new Promise<TTSResponse>((resolve) => {
            reader.onloadend = async () => {
              try {
                const base64data = reader.result as string;
                const base64Audio = base64data.split(',')[1];
                
                const timestamp = Date.now();
                const filename = `tts_audio_${timestamp}.mp3`;
                const fileUri = FileSystem.documentDirectory + filename;
                
                await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                
                console.log('TTS audio saved to:', fileUri);
                resolve({
                  audioUri: fileUri,
                  original_text: request.input_text,
                  src_lang: request.src_lang || 'english'
                });
              } catch (error) {
                console.error('Error saving TTS audio file:', error);
                resolve({
                  audioUri: null,
                  original_text: request.input_text,
                  src_lang: request.src_lang || 'english'
                });
              }
            };
            reader.onerror = () => {
              console.error('Error reading audio blob');
              resolve({
                audioUri: null,
                original_text: request.input_text,
                src_lang: request.src_lang || 'english'
              });
            };
            reader.readAsDataURL(audioBlob);
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Text to speech failed:', error);
      return {
        audioUri: null,
        original_text: request.input_text,
        src_lang: request.src_lang || 'english'
      };
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