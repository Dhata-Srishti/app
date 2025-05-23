# TTS Translation Implementation

## Overview

The Text-to-Speech (TTS) functionality now **automatically translates any input text to Kannada** before generating speech, as the TTS system only works with Kannada transcripts.

## How It Works

### Current Implementation Status: ✅ **ALREADY IMPLEMENTED AND WORKING**

When a text request is sent to the TTS endpoint:

1. **Input**: Any text in any language (defaults to English if no source language specified)
2. **Auto-Translation**: Backend automatically translates the text to Kannada using Dwani's translation API
3. **TTS Generation**: The translated Kannada text is used to generate MP3 audio using Dwani's TTS service
4. **Output**: Returns MP3 audio file with Kannada speech

## Technical Implementation

### Backend (`backend/app.py`)

The `/api/tts` endpoint:
- Accepts `input_text` (required) and optional `src_lang` (defaults to 'english')
- Uses `dwani.Translate.run_translate()` to convert text to Kannada (`kan_Knda`)
- Passes the Kannada text to `dwani.Audio.speech()` for TTS generation
- Returns MP3 audio file

```python
# Example flow in backend
input_text = "Hello, how are you?"
src_lang = "english"  # or any supported language

# Auto-translate to Kannada
kannada_text = dwani.Translate.run_translate(
    sentences=[input_text], 
    src_lang='eng_Latn', 
    tgt_lang='kan_Knda'
)

# Generate TTS from Kannada
audio = dwani.Audio.speech(input=kannada_text, response_format="mp3")
```

### Frontend (`services/api.ts`)

The `textToSpeech()` method:
- Accepts optional `src_lang` parameter
- Sends request to `/api/tts` endpoint
- Handles the returned audio file for playback

```typescript
// Example usage
await dhataApi.textToSpeech({
  input_text: "Good morning",
  src_lang: "english"  // Optional, defaults to 'english'
});
```

## Supported Languages

### Input Languages (Source)
- English (`english`, `en`)
- Hindi (`hindi`, `hi`) 
- Kannada (`kannada`, `kn`)
- Assamese (`assamese`, `as`)
- Bengali (`bengali`, `bn`)
- Gujarati (`gujarati`, `gu`)
- Malayalam (`malayalam`, `ml`)
- Marathi (`marathi`, `mr`)
- Odia (`odia`, `or`)
- Punjabi (`punjabi`, `pa`)
- Tamil (`tamil`, `ta`)
- Telugu (`telugu`, `te`)

### Output Language
- **Always Kannada** (TTS requirement)

## User Experience

### From User Perspective:
1. User sees bot response in English (or any language)
2. User clicks the speaker 🔊 icon
3. System automatically translates the text to Kannada
4. User hears the response in Kannada speech
5. **NEW**: User can click the eye 👁️ icon to see the Kannada translation text that was sent to TTS

### From Developer Perspective:
```javascript
// Simple usage - just pass any text
const ttsResponse = await dhataApi.textToSpeech({
  input_text: "Hello world"
});

// Advanced usage - get translation info for display
const ttsResponse = await dhataApi.textToSpeech({
  input_text: "नमस्ते",
  src_lang: "hindi",
  return_translation: true  // Returns Kannada text for display
});

// Access the results
console.log('Audio URI:', ttsResponse.audioUri);
console.log('Kannada translation:', ttsResponse.kannada_text);
```

## Error Handling

- **Translation Failure**: Falls back to using original text if translation fails
- **TTS Failure**: Returns null and logs error details
- **Network Issues**: Proper timeout and error messaging

## Testing

Run the test script to verify functionality:
```bash
node scripts/test-tts-translation.js
```

## Key Benefits

1. **Seamless Experience**: Users don't need to know about the translation step
2. **Multi-language Support**: Accept text in any supported language
3. **Consistent Output**: Always generates Kannada speech regardless of input language
4. **Robust Fallbacks**: Graceful handling of translation or TTS failures
5. **Backward Compatible**: Existing TTS calls continue to work
6. **🆕 Translation Transparency**: Users can see the Kannada text that was sent to TTS

## New UI Features

### Kannada Text Display
- **Eye Icon**: Click to toggle visibility of the Kannada translation
- **Translation Display**: Shows "Kannada (for TTS): [translated text]"
- **Per-Message**: Each bot message can independently show/hide its Kannada translation
- **Automatic**: Translation is captured when TTS is generated

### UI Controls
- **🔊 Speaker Icon**: Generate and play TTS audio
- **👁️ Eye Icon**: Toggle Kannada translation text visibility (appears after TTS generation)
- **Visual Feedback**: Loading indicators during TTS generation

## Integration Points

### Chatbot Integration (`app/(app)/persona-ai.tsx`)
- `generateTTS()` function automatically handles translation
- Audio caching works seamlessly with translated content
- No changes needed to existing UI components

### Demo Interface (`components/DhataDemo.tsx`)
- TTS demo section works with any input text
- Automatic translation happens transparently

## Configuration

### Backend Configuration
- Language mappings defined in `DWANI_LANGUAGE_MAP`
- Default source language: `'english'`
- Target language: Always `'kannada'` (hardcoded for TTS)

### Frontend Configuration
- Language codes mapped in `LANGUAGE_MAP`
- API timeout: 30 seconds
- Audio caching enabled by default

## Architecture Flow

```
User Input: "Hello, how are you?"
        ↓
Backend TTS Endpoint (/api/tts)
        ↓
Auto-Translation: "ನೀವು ಹೇಗಿದ್ದೀರಿ?"
        ↓
Dwani TTS Generation (Kannada audio)
        ↓
Response: {audio_base64, kannada_text}
        ↓
Frontend Display:
  [Original Bot Message]
  [🔊 Speaker] [👁️ Eye]
  
  [If Eye clicked:]
  Kannada (for TTS): ನೀವು ಹೇಗಿದ್ದೀರಿ?
```

### User Interface Flow

1. **Bot Response**: "Hello, how are you?"
2. **User clicks 🔊**: TTS generates audio + captures Kannada translation
3. **Eye icon 👁️ appears**: User can now see the translation
4. **User clicks 👁️**: Shows "Kannada (for TTS): ನೀವು ಹೇಗಿದ್ದೀರಿ?"

## Files Modified

1. `backend/app.py` - Enhanced TTS endpoint with language mapping
2. `services/api.ts` - Updated TTS interface and method
3. `ROUTING.md` - Updated documentation
4. `README.md` - Updated endpoint descriptions
5. `scripts/test-tts-translation.js` - New test script

## Summary

✅ **The requested functionality is fully implemented and working, with BONUS features!**

Users can now send text in any language to the TTS system, and it will automatically:
1. Translate the text to Kannada
2. Generate speech in Kannada
3. Return the audio for playback
4. **🆕 BONUS**: Display the Kannada translation text in the chat interface

### What was enhanced:
- **Backend**: Added `return_translation` parameter to TTS endpoint
- **Frontend**: Updated TTS response handling to include translation info
- **UI**: Added eye icon to toggle Kannada text visibility
- **User Experience**: Users can now see exactly what Kannada text was sent to TTS

### How to use the new feature:
1. Chat with the AI bot (any language)
2. Click the 🔊 speaker icon to generate TTS
3. Click the 👁️ eye icon to see the Kannada translation
4. The Kannada text shows exactly what was sent to the TTS engine

**No additional work is required - the enhanced feature is ready to use!** 