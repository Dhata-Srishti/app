# Quick Start Guide

## 🚀 Getting Started with Dhata App

### Prerequisites
- Node.js and npm/yarn installed
- Python 3.x installed
- Expo CLI installed: `npm install -g @expo/cli`

### 1. Start the Backend

```bash
cd backend
chmod +x run.sh
./run.sh
```

This will:
- Create a Python virtual environment
- Install all required dependencies (including `dwani`)
- Set up environment variables
- Start the Flask server on http://localhost:5001

### 2. Start the Frontend

In a new terminal:

```bash
# Install dependencies (if not done already)
npm install

# Start the Expo development server
npm start
# or
expo start
```

### 3. Test the Routing

```bash
# Test the complete routing flow
node scripts/test-routing.js
```

You should see:
```
✅ Health check passed: healthy
✅ Text query passed
✅ TTS request passed, audio file would be generated
🎯 The routing flow is working correctly!
```

### 4. Use the Chatbot

1. Open the app in Expo Go (mobile) or web browser
2. Tap the "Ask EMoo AI" button at the bottom
3. Type a message about Indian cow breeds
4. See the AI response
5. Click the speaker icon 🔊 to hear the response

### 🔧 Configuration

#### For Physical Device Testing
If testing on a physical device, update the API URL:

1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5001
   ```

### 🐛 Troubleshooting

#### Backend Issues
- **"ModuleNotFoundError: No module named 'dwani'"**: Run the `./run.sh` script
- **"python: command not found"**: The script uses `python3` automatically
- **Port 5001 already in use**: Kill existing processes or change port in `backend/app.py`

#### Frontend Issues
- **"Module not found"**: Run `npm install`
- **API connection failed**: Check if backend is running on correct port
- **Audio not playing**: Ensure device audio permissions are enabled

### 📱 Features Working

✅ **Chat Interface**: Clean, intuitive chat with bot responses  
✅ **AI Integration**: Powered by Dwani API for cow breed information  
✅ **Text-to-Speech**: Click speaker icon to hear responses  
✅ **Audio Caching**: TTS responses cached for better performance  
✅ **Error Handling**: Graceful fallbacks for network issues  
✅ **Mobile Responsive**: Works on iOS/Android via Expo  

### 🎯 Complete Routing Flow

```
User Types Message
    ↓
Frontend (persona-ai.tsx)
    ↓
API Service (services/api.ts)
    ↓
Backend Flask (/api/text_query)
    ↓
Dwani AI Processing
    ↓
Response to Frontend
    ↓
Display + Speaker Icon
    ↓
User Clicks Speaker
    ↓
TTS Generation (/api/tts)
    ↓
Audio Playback
```

### 📚 More Information

- **Full Documentation**: See `ROUTING.md`
- **API Reference**: Check `config/api.config.ts`
- **Test Scripts**: Run `node scripts/test-routing.js` 