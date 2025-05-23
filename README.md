# Dhata - AI-Powered Language Processing App 🗣️

This is a full-stack React Native application with an integrated Python Flask backend that provides AI-powered voice, vision, and language processing capabilities using the Dwani API.

## Features

### Frontend (React Native/Expo)
- Cross-platform mobile app (iOS, Android, Web)
- Modern UI with React Native Paper
- Multi-language support with i18next
- File-based routing with Expo Router

### Backend (Flask API)
- **Text Query** - Chat with AI in different languages
- **Vision Query** - Upload images and get AI descriptions  
- **Speech to Text (ASR)** - Convert audio to text
- **Translation** - Translate text between languages
- **Text to Speech** - Convert text to spoken audio
- **Document Text Extraction** - Extract and translate text from PDFs

## Quick Start

### Option 1: Run everything with one command
```bash
# Install all dependencies and start both frontend and backend
npm run setup
npm run dev
```

### Option 2: Manual setup

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Setup backend**
   ```bash
   npm run backend:install
   ```

3. **Start backend server**
   ```bash
   npm run backend
   ```

4. **Start frontend (in a new terminal)**
   ```bash
   npm start
   ```

## Project Structure

```
dhata/
├── app/                    # React Native app pages
├── components/             # Reusable React components
│   └── DhataDemo.tsx      # Backend API demo component
├── services/              # API services
│   └── api.ts             # Backend API client
├── backend/               # Flask backend server
│   ├── app.py             # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   ├── run.sh             # Backend startup script
│   └── README.md          # Backend documentation
├── constants/             # App constants
├── context/              # React contexts
└── assets/               # Static assets
```

## Available Scripts

### Frontend
- `npm start` - Start Expo development server
- `npm run android` - Open app in Android emulator
- `npm run ios` - Open app in iOS simulator  
- `npm run web` - Open app in web browser

### Backend
- `npm run backend` - Start Flask backend server
- `npm run backend:install` - Install Python dependencies
- `npm run backend:dev` - Start backend in development mode

### Full-stack
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Install all dependencies

## Backend API Endpoints

The Flask backend runs on `http://localhost:5001` and provides:

- `GET /api/health` - Health check
- `POST /api/text_query` - AI chat queries
- `POST /api/vision_query` - Image analysis
- `POST /api/asr` - Speech to text
- `POST /api/translate` - Text translation
- `POST /api/tts` - Text to speech
- `POST /api/extract_document` - Document text extraction

## Testing the Integration

Use the `DhataDemo` component to test all backend features:

```typescript
import DhataDemo from '../components/DhataDemo';

// Use in your app to test API integration
<DhataDemo />
```

## Environment Setup

The backend uses the Dwani API with these credentials:
- API Key: `harshringsia18@gmail.com_dwani`
- Base URL: `https://dwani-pulakeshi.hf.space`

## Development

### Frontend Development
Edit files in the `app/` directory. The project uses file-based routing.

### Backend Development  
Edit `backend/app.py` to modify API endpoints. The server auto-reloads in debug mode.

### API Integration
Use the `dhataApi` service from `services/api.ts` to communicate with the backend:

```typescript
import { dhataApi } from '../services/api';

// Example: Text query
const response = await dhataApi.textQuery({
  prompt: "Hello, how are you?",
  src_lang: "en",
  tgt_lang: "kn"
});
```

## Deployment

### Frontend
Deploy using Expo's build service:
```bash
npx expo build
```

### Backend
For production, use a proper WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Dwani API Documentation](https://dwani.ai/api)

## Original Expo Template

This project was created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). The original Expo template files have been integrated with the Dhata backend system.

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
