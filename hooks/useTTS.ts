import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { dhataApi } from '../services/api';

export const useTTS = () => {
  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const generateTTS = useCallback(async (
    text: string,
    messageId: string,
    onUpdate: (messageId: string, updates: any) => void
  ) => {
    console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...');
    
    setGeneratingAudioId(messageId);
    onUpdate(messageId, {
      isGeneratingAudio: true,
      hasAudio: false,
    });

    try {
      // Direct API call to get base64 audio
      const response = await fetch(`${dhataApi.getBaseUrl()}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: text,
          return_translation: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ TTS Response:', data.success ? 'Success' : 'Failed');

      if (data.success && data.audio_base64) {
        // Create data URL from base64
        const audioDataUrl = `data:audio/mp3;base64,${data.audio_base64}`;
        
        onUpdate(messageId, {
          audioUri: audioDataUrl,
          hasAudio: true,
          isGeneratingAudio: false,
          kannadaText: data.kannada_text,
        });
      } else {
        throw new Error('No audio data received');
      }

    } catch (error) {
      console.error('❌ TTS failed:', error);
      onUpdate(messageId, {
        isGeneratingAudio: false,
        hasAudio: false,
      });
      
      Alert.alert('TTS Error', 'Could not generate audio. Please try again.');
    } finally {
      setGeneratingAudioId(null);
    }
  }, []);

  const playAudio = useCallback(async (audioUri: string, messageId: string) => {
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
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAudioId(null);
            sound.unloadAsync();
          }
        });
        
        console.log('✅ Mobile audio playing');
      }
    } catch (error) {
      console.error('❌ Audio playback failed:', error);
      setPlayingAudioId(null);
      Alert.alert('Playback Error', 'Could not play audio.');
    }
  }, []);

  const stopAudio = useCallback(async () => {
    console.log('⏹️ Stopping audio');
    setPlayingAudioId(null);
  }, []);

  const isGenerating = useCallback((messageId: string) => {
    return generatingAudioId === messageId;
  }, [generatingAudioId]);

  const isPlaying = useCallback((messageId: string) => {
    return playingAudioId === messageId;
  }, [playingAudioId]);

  const clearCache = useCallback(() => {
    console.log('🗑️ Cache cleared');
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