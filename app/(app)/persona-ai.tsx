import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { dhataApi } from '../../services/api';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  audioUri?: string;
  isGeneratingAudio?: boolean;
  hasAudio?: boolean;
  kannadaText?: string;  // Store the Kannada translation for TTS
  showKannadaText?: boolean;  // Toggle to show/hide Kannada text
}

interface MooAIChatProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isOpen: boolean;
}

export default function MooAIChat({ messages, setMessages, isOpen }: MooAIChatProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const scrollViewRef = useRef<ScrollView>(null);
  const audioPlayer = useAudioPlayer();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const generateTTS = async (text: string, messageIndex: number) => {
    // Check if audio is already cached
    if (audioCache.has(text)) {
      const audioUri = audioCache.get(text)!;
      updateMessageAudio(messageIndex, audioUri, false, true);
      return;
    }

    // Set generating state
    updateMessageAudio(messageIndex, undefined, true, false);

    try {
      console.log('Generating TTS for:', text.substring(0, 50) + '...');
      const ttsResponse = await dhataApi.textToSpeech({ 
        input_text: text,
        return_translation: true  // Request translation info
      });
      
      if (ttsResponse.audioUri) {
        console.log('TTS generated successfully:', ttsResponse.audioUri);
        if (ttsResponse.kannada_text) {
          console.log('Kannada translation for TTS:', ttsResponse.kannada_text);
        }
        
        // Cache the audio
        setAudioCache(prev => new Map(prev).set(text, ttsResponse.audioUri!));
        updateMessageAudioWithTranslation(
          messageIndex, 
          ttsResponse.audioUri, 
          false, 
          true, 
          ttsResponse.kannada_text
        );
      } else {
        console.warn('TTS generation returned null');
        // Failed to generate audio
        updateMessageAudio(messageIndex, undefined, false, false);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      updateMessageAudio(messageIndex, undefined, false, false);
    }
  };

  const updateMessageAudio = (messageIndex: number, audioUri?: string, isGenerating?: boolean, hasAudio?: boolean) => {
    const newMessages = [...messages];
    newMessages[messageIndex] = {
      ...newMessages[messageIndex],
      audioUri,
      isGeneratingAudio: isGenerating,
      hasAudio
    };
    setMessages(newMessages);
  };

  const updateMessageAudioWithTranslation = (
    messageIndex: number, 
    audioUri?: string, 
    isGenerating?: boolean, 
    hasAudio?: boolean,
    kannadaText?: string
  ) => {
    const newMessages = [...messages];
    newMessages[messageIndex] = {
      ...newMessages[messageIndex],
      audioUri,
      isGeneratingAudio: isGenerating,
      hasAudio,
      kannadaText,
      showKannadaText: false  // Initially hidden
    };
    setMessages(newMessages);
  };

  const toggleKannadaText = (messageIndex: number) => {
    const newMessages = [...messages];
    newMessages[messageIndex] = {
      ...newMessages[messageIndex],
      showKannadaText: !newMessages[messageIndex].showKannadaText
    };
    setMessages(newMessages);
  };

  const playAudio = async (audioUri: string, messageIndex: number) => {
    try {
      setPlayingAudioId(messageIndex);

      // Replace the audio source and play
      audioPlayer.replace(audioUri);
      audioPlayer.play();

      // We'll use a timeout to reset playing state since expo-audio doesn't have the same event system
      // In a real app, you might want to use a more sophisticated approach
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000); // Adjust based on typical audio length

    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudioId(null);
    }
  };

  const stopAudio = async () => {
    try {
      audioPlayer.pause();
      setPlayingAudioId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputText.trim(),
      sender: 'user',
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending query to API:', userMessage.text);
      
      // Send query to backend API
      const response = await dhataApi.textQuery({
        prompt: userMessage.text,
        src_lang: 'english',
        tgt_lang: 'english'
      });

      console.log('API Response:', response);

      let botResponseText = '';
      
      if (response.success && response.data) {
        // Extract the response text from the API response
        // The exact structure may vary based on the Dwani API response format
        if (typeof response.data === 'string') {
          botResponseText = response.data;
        } else if (response.data.response) {
          botResponseText = response.data.response;
        } else if (response.data.text) {
          botResponseText = response.data.text;
        } else if (response.data.answer) {
          botResponseText = response.data.answer;
        } else {
          // Fallback to stringify the response if we can't find the text
          botResponseText = JSON.stringify(response.data);
        }
      } else {
        console.error('API Error:', response.error);
        botResponseText = `I'm sorry, I encountered an error: ${response.error || 'Unknown error'}. Please try again.`;
      }

      const botResponse: Message = {
        text: botResponseText,
        sender: 'bot',
        hasAudio: false,
        isGeneratingAudio: false,
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      
      // Auto-generate TTS for better user experience (optional)
      // You can comment this out if you prefer manual TTS generation
      // generateTTS(botResponseText, finalMessages.length - 1);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: Message = {
        text: `I'm sorry, I'm having trouble connecting to my AI service. This could be due to:\n\n• Backend server not running\n• Network connectivity issues\n• Server overload\n\nPlease try again in a moment.\n\nTechnical details: ${error}`,
        sender: 'bot',
        hasAudio: false,
        isGeneratingAudio: false,
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpeakerButton = (message: Message, index: number) => {
    const isPlaying = playingAudioId === index;
    const isGenerating = message.isGeneratingAudio;
    const hasAudio = message.hasAudio;

    return (
      <TouchableOpacity
        style={styles.speakerButton}
        onPress={() => {
          if (isGenerating) return;
          
          if (isPlaying) {
            stopAudio();
          } else if (hasAudio && message.audioUri) {
            playAudio(message.audioUri, index);
          } else {
            generateTTS(message.text, index);
          }
        }}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size={16} color="#2196F3" />
        ) : (
          <Ionicons
            name={isPlaying ? "stop" : "volume-high"}
            size={16}
            color="#2196F3"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <View style={styles.messageContent}>
              <ThemedText style={styles.messageText}>{message.text}</ThemedText>
              {message.sender === 'bot' && (
                <View style={styles.botControls}>
                  {message.kannadaText && (
                    <TouchableOpacity
                      style={styles.kannadaButton}
                      onPress={() => toggleKannadaText(index)}
                    >
                      <Ionicons
                        name={message.showKannadaText ? "eye-off" : "eye"}
                        size={14}
                        color="#4CAF50"
                      />
                    </TouchableOpacity>
                  )}
                  {renderSpeakerButton(message, index)}
                </View>
              )}
            </View>
            
            {/* Show Kannada translation when toggled */}
            {message.kannadaText && message.showKannadaText && (
              <View style={styles.kannadaTextContainer}>
                <ThemedText style={styles.kannadaLabel}>Kannada (for TTS):</ThemedText>
                <ThemedText style={styles.kannadaText}>{message.kannadaText}</ThemedText>
              </View>
            )}
          </View>
        ))}
        
        {/* Show loading indicator when AI is thinking */}
        {isLoading && (
          <View style={[styles.messageBubble, styles.botMessage, styles.loadingMessage]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <ThemedText style={[styles.messageText, styles.loadingText]}>
              AI is thinking...
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="What do you want to know today?"
          placeholderTextColor="#666"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size={24} color="#FFFFFF" />
          ) : (
            <Ionicons
              name="send"
              size={24}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 8,
    marginLeft: '15%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 8,
    marginRight: '15%',
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  loadingText: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    color: '#2C3E50',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#BDC3C7',
  },
  speakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  botControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 8,
  },
  kannadaButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  kannadaTextContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  kannadaLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.9,
  },
  kannadaText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
}); 