import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { dhataApi } from '../services/api';

export const useTTS = () => {
  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Helper function to split long text into manageable chunks
  const splitTextIntoChunks = (text: string, maxLength = 1000): string[] => {
    if (text.length <= maxLength) return [text];
    
    const chunks: string[] = [];
    let currentIndex = 0;
    
    while (currentIndex < text.length) {
      // Find a good break point (sentence or paragraph)
      let endIndex = Math.min(currentIndex + maxLength, text.length);
      
      // Try to break at a sentence
      const possibleBreakPoint = text.lastIndexOf('. ', endIndex);
      if (possibleBreakPoint > currentIndex && possibleBreakPoint < endIndex - 10) {
        endIndex = possibleBreakPoint + 1; // Include the period
      }
      
      chunks.push(text.substring(currentIndex, endIndex));
      currentIndex = endIndex;
    }
    
    return chunks;
  };
  
  // Function to try generating TTS with retry logic
  const tryGenerateTTS = async (
    text: string, 
    retryCount = 0,
    maxRetries = 2
  ): Promise<any> => {
    try {
      // Check if text is too long, if so, use only the first part
      const processedText = text.length > 3000 ? text.substring(0, 3000) : text;
      
      // Create a timeout controller instead of using AbortSignal.timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Direct API call to get base64 audio
        const response = await fetch(`${dhataApi.getBaseUrl()}/api/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_text: processedText,
            src_lang: 'kannada', // Force Kannada for better TTS support
            return_translation: true
          }),
          // Use the controller signal for timeout
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.audio_base64) {
          throw new Error(data.error || 'No audio data received');
        }
        
        return data;
      } finally {
        // Ensure timeout is cleared in all cases
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error(`TTS attempt ${retryCount + 1} failed:`, error);
      
      // If we have retries left, try again
      if (retryCount < maxRetries) {
        console.log(`Retrying TTS generation, attempt ${retryCount + 2}...`);
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(tryGenerateTTS(text, retryCount + 1, maxRetries));
          }, 1000); // Wait 1 second before retry
        });
      }
      
      // If all retries failed, rethrow the error
      throw error;
    }
  };

  const generateTTS = useCallback(async (
    text: string,
    messageId: string,
    onUpdate: (messageId: string, updates: any) => void
  ) => {
    if (!text || text.trim().length === 0) {
      console.log('Empty text provided for TTS, skipping');
      return;
    }
    
    console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...');
    
    setGeneratingAudioId(messageId);
    onUpdate(messageId, {
      isGeneratingAudio: true,
      hasAudio: false,
    });

    try {
      // Try to generate TTS with retry logic
      const data = await tryGenerateTTS(text);
      console.log('✅ TTS Response:', data.success ? 'Success' : 'Failed');

      // Create data URL from base64
      const audioDataUrl = `data:audio/mp3;base64,${data.audio_base64}`;
      
      onUpdate(messageId, {
        audioUri: audioDataUrl,
        hasAudio: true,
        isGeneratingAudio: false,
        kannadaText: data.kannada_text,
      });
    } catch (error) {
      console.error('❌ TTS failed after all retries:', error);
      onUpdate(messageId, {
        isGeneratingAudio: false,
        hasAudio: false,
      });
      
      // More user-friendly error message
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Audio Generation Failed', 
          'Could not generate speech audio. This might be due to server issues or network problems. Please try again later.'
        );
      }
    } finally {
      setGeneratingAudioId(null);
    }
  }, []);

  const playAudio = useCallback(async (audioUri: string, messageId: string) => {
    if (!audioUri) {
      console.error('No audio URI provided for playback');
      return;
    }
    
    console.log('🎵 Playing audio...');
    
    try {
      setPlayingAudioId(messageId);

      if (Platform.OS === 'web') {
        // Simple web audio
        const audio = new Audio(audioUri);
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = (e) => {
          console.error('Audio error:', e);
          setPlayingAudioId(null);
        };
        await audio.play();
        console.log('✅ Web audio playing');
      } else {
        // Simple mobile audio with expo-av
        const { Audio } = await import('expo-av');
        
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true }
          );
          
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingAudioId(null);
              sound.unloadAsync().catch(e => console.error('Error unloading sound:', e));
            }
          });
          
          console.log('✅ Mobile audio playing');
        } catch (soundError) {
          console.error('Failed to create sound object:', soundError);
          throw soundError;
        }
      }
    } catch (error) {
      console.error('❌ Audio playback failed:', error);
      setPlayingAudioId(null);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Playback Error', 
          'Could not play audio. The audio file may be corrupted or in an unsupported format.'
        );
      }
    }
  }, []);

  const stopAudio = useCallback(async () => {
    console.log('⏹️ Stopping audio');
    
    if (Platform.OS !== 'web' && playingAudioId) {
      try {
        const { Audio } = await import('expo-av');
        await Audio.setIsEnabledAsync(false);
        await Audio.setIsEnabledAsync(true);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    
    setPlayingAudioId(null);
  }, [playingAudioId]);

  const isGenerating = useCallback((messageId: string) => {
    return generatingAudioId === messageId;
  }, [generatingAudioId]);

  const isPlaying = useCallback((messageId: string) => {
    return playingAudioId === messageId;
  }, [playingAudioId]);

  const clearCache = useCallback(() => {
    console.log('🗑️ Cache cleared');
    // Add any additional cache clearing logic here if needed
  }, []);

  return {
    generateTTS,
    playAudio,
    stopAudio,
    isGenerating,
    isPlaying,
    clearCache,
  };
}; 