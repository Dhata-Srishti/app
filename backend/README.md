# Dhata Backend API

This is the backend API server for the Dhata React Native application. It provides AI-powered voice, vision, and language processing capabilities using the Dwani API.

## Features

The backend provides the following AI services:

1. **Text Query** - Chat with AI in different languages
2. **Vision Query** - Upload images and get AI descriptions
3. **Speech to Text (ASR)** - Convert audio to text
4. **Translation** - Translate text between languages  
5. **Text to Speech** - Convert text to spoken audio
6. **Document Text Extraction** - Extract and translate text from PDFs

## Quick Start

### Option 1: Using the startup script (Recommended)
```bash
cd backend
./run.sh
```

### Option 2: Manual setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DWANI_API_KEY=harshringsia18@gmail.com_dwani
export DWANI_API_BASE_URL=https://dwani-pulakeshi.hf.space

# Start server
python app.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if the API is running

### AI Services
- **POST** `/api/text_query` - Text-based chat query
- **POST** `/api/vision_query` - Vision-based query with image upload
- **POST** `/api/asr` - Automatic Speech Recognition  
- **POST** `/api/translate` - Text translation
- **POST** `/api/tts` - Text-to-Speech (returns MP3 audio)
- **POST** `/api/extract_document` - Document text extraction

## API Usage Examples

### Text Query
```bash
curl -X POST http://localhost:5001/api/text_query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?",
    "src_lang": "en",
    "tgt_lang": "kn"
  }'
```

### Translation
```bash
curl -X POST http://localhost:5001/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello World",
    "src_lang": "en", 
    "tgt_lang": "kn"
  }'
```

### Vision Query
```bash
curl -X POST http://localhost:5001/api/vision_query \
  -F "image=@path/to/image.jpg" \
  -F "query=What is in this image?" \
  -F "src_lang=en" \
  -F "tgt_lang=kn"
```

## Response Format

All API endpoints return JSON responses:

### Success Response
```json
{
  "success": true,
  "data": {
    // API response data
  }
}
```

### Error Response  
```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

The following environment variables are required:

- `DWANI_API_KEY` - Your Dwani API key
- `DWANI_API_BASE_URL` - Dwani API base URL

## Dependencies

- Flask 2.0.1 - Web framework
- dwani - Dwani API client
- python-dotenv - Environment variable loading
- flask-cors - CORS support for React Native
- werkzeug - WSGI utilities

## Integration with React Native

The backend is configured with CORS to allow requests from the React Native frontend. The frontend can make HTTP requests to `http://localhost:5001` (or your deployed URL) to access all the AI services.

## Development

To modify the API endpoints, edit `app.py`. The server will automatically reload in debug mode.

For production deployment, consider using a production WSGI server like Gunicorn instead of the Flask development server. 