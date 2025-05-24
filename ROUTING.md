# Dhata App Routing Documentation

## Overview
This document describes the complete routing flow from the chatbot frontend to the backend API and TTS functionality.

## Routing Flow

```
Frontend (Chatbot) → Backend API → Dwani AI → Response → TTS → Audio Playback
```

### 1. User Query Flow
1. **User Input**: User types a message in the chatbot interface
2. **Frontend Processing**: `app/(app)/persona-ai.tsx` handles the input
3. **API Call**: Frontend calls `dhataApi.textQuery()` from `services/api.ts`
4. **Backend Endpoint**: Request hits `/api/text_query` in `backend/app.py`
5. **AI Processing**: Backend calls Dwani AI service for response
6. **Response**: AI response is returned to frontend and displayed

### 2. Text-to-Speech Flow
1. **TTS Trigger**: User clicks the speaker icon next to bot responses
2. **Frontend Processing**: `generateTTS()` function is called
3. **API Call**: Frontend calls `dhataApi.textToSpeech()` 
4. **Backend Endpoint**: Request hits `/api/tts` in `backend/app.py`
5. **Auto-Translation**: Backend automatically translates input text to Kannada (TTS only works with Kannada)
6. **Audio Generation**: Backend uses Dwani TTS to generate MP3 audio from Kannada text
7. **Audio Return**: Audio file is returned and cached locally
8. **Playback**: Audio is played using expo-audio

## API Endpoints

### Backend Endpoints (`backend/app.py`)
- `GET /api/health` - Health check
- `POST /api/text_query` - Chat queries
- `POST /api/tts` - Text-to-speech generation (auto-translates to Kannada)
- `POST /api/vision_query` - Image-based queries
- `POST /api/asr` - Speech-to-text
- `POST /api/translate` - Text translation
- `POST /api/extract_document` - Document extraction

### Frontend API Service (`services/api.ts`)
- `dhataApi.checkHealth()` - Check backend health
- `dhataApi.textQuery()` - Send chat queries
- `dhataApi.textToSpeech()` - Generate TTS audio
- `dhataApi.visionQuery()` - Image queries
- `dhataApi.speechToText()` - ASR functionality
- `dhataApi.translate()` - Text translation
- `dhataApi.extractDocument()` - Document processing

## Configuration

### API Configuration (`config/api.config.ts`)
- Centralized API endpoint configuration
- Environment-based URL management
- Timeout and language settings

### Environment Variables
Set `EXPO_PUBLIC_API_URL` to configure the backend URL:
```bash
# For local development
EXPO_PUBLIC_API_URL=http://localhost:5001

# For React Native on physical device
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5001
```

## Frontend Components

### Main Chatbot (`app/(app)/persona-ai.tsx`)
- Handles chat interface and message management
- Manages TTS generation and audio playback
- Implements caching for generated audio files
- Error handling for API failures

### Chat Integration (`app/(tabs)/index.tsx`)
- Modal-based chat interface
- Integration with main app navigation
- Message state management

## Testing

### Test the Routing
Run the test script to verify the complete flow:
```bash
cd scripts
node test-routing.js
```

### Manual Testing
1. **Start Backend**: `cd backend && python app.py`
2. **Start Frontend**: `npm start` or `expo start`
3. **Test Chat**: Send a message in the chatbot
4. **Test TTS**: Click the speaker icon on bot responses

## Error Handling

### Frontend Error Handling
- Network timeout handling (30s timeout)
- API validation and error messaging
- Graceful degradation when TTS fails
- Loading states and user feedback

### Backend Error Handling
- Input validation for all endpoints
- Proper HTTP status codes
- Error logging and debugging
- CORS configuration for React Native

## Performance Optimizations

### Audio Caching
- TTS responses are cached locally
- Prevents redundant API calls for same text
- Reduces Network usage and improves UX

### Request Optimization
- Configurable timeouts
- Abort controllers for request cancellation
- Proper error boundaries

## Troubleshooting

### Common Issues
1. **Connection Refused**: Backend not running on port 5001
2. **CORS Errors**: Backend CORS not configured for React Native
3. **TTS Fails**: Check Dwani API credentials
4. **Audio Not Playing**: Check expo-audio permissions

### Debug Steps
1. Check backend health: `curl http://localhost:5001/api/health`
2. Test text query: Use the test script
3. Check Network logs in React Native debugger
4. Verify environment variables are set correctly

## Architecture Benefits

### Separation of Concerns
- Frontend handles UI and user interaction
- Backend manages AI processing and external APIs
- Clear API boundaries and error handling

### Scalability
- Centralized configuration management
- Modular API service architecture
- Easy to add new endpoints and features

### Maintainability
- Well-documented API interfaces
- Consistent error handling patterns
- Type-safe implementations with TypeScript 