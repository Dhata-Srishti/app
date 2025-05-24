import { Message, useChatMessages } from '@/hooks/useChatMessages';
import { useTTS } from '@/hooks/useTTS';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { dhataApi } from '../../services/api';

interface MooAIChatProps {
  isOpen: boolean;
}

export default function MooAIChat({ isOpen }: MooAIChatProps) {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Custom hooks for cleaner state management
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  } = useChatMessages();

  const {
    generateTTS,
    playAudio,
    stopAudio,
    isGenerating,
    isPlaying,
    clearCache,
  } = useTTS();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message
    const userMessageId = addMessage({
      text: userMessageText,
      sender: 'user',
    });

    try {
      console.log('Sending query to API:', userMessageText);
      
      const response = await dhataApi.textQuery({
        prompt: userMessageText,
        src_lang: 'english',
        tgt_lang: 'english'
      });

      console.log('API Response:', response);

      let botResponseText = '';
      
      if (response.success && response.data) {
        // Extract response text with improved handling
        if (typeof response.data === 'string') {
          botResponseText = response.data;
        } else if (response.data.response) {
          botResponseText = response.data.response;
        } else if (response.data.text) {
          botResponseText = response.data.text;
        } else if (response.data.answer) {
          botResponseText = response.data.answer;
        } else {
          botResponseText = JSON.stringify(response.data);
        }
      } else {
        console.error('API Error:', response.error);
        botResponseText = getErrorMessage(response.error);
      }

      // Add bot response
      addMessage({
        text: botResponseText,
        sender: 'bot',
        hasAudio: false,
        isGeneratingAudio: false,
      });

    } catch (error) {
      console.error('Chat API Error:', error);
      addMessage({
        text: getNetworkErrorMessage(error),
        sender: 'bot',
        hasAudio: false,
        isGeneratingAudio: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, addMessage, setIsLoading]);

  // Helper function to generate user-friendly error messages
  const getErrorMessage = (error?: string): string => {
    return `I'm sorry, I encountered an error: ${error || 'Unknown error'}. Please try again.`;
  };

  const getNetworkErrorMessage = (error: any): string => {
    return `I'm sorry, I'm having trouble connecting to my AI service. This could be due to:

• Backend server not running
• Network connectivity issues  
• Server overload

Please try again in a moment.

Technical details: ${error}`;
  };

  const handleTTSAction = useCallback(async (message: Message) => {
    const isCurrentlyGenerating = isGenerating(message.id);
    const isCurrentlyPlaying = isPlaying(message.id);
    
    if (isCurrentlyGenerating) return;
    
    if (isCurrentlyPlaying) {
      await stopAudio();
    } else if (message.hasAudio && message.audioUri) {
      // Use URI-based playback (simple approach)
      await playAudio(message.audioUri, message.id);
    } else {
      // Generate new audio
      await generateTTS(message.text, message.id, updateMessage);
    }
  }, [generateTTS, playAudio, stopAudio, isGenerating, isPlaying, updateMessage]);

  const toggleKannadaText = useCallback((messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      updateMessage(messageId, {
        showKannadaText: !message.showKannadaText
      });
    }
  }, [messages, updateMessage]);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearMessages();
            clearCache();
          }
        },
      ]
    );
  }, [clearMessages, clearCache]);

  const renderSpeakerButton = (message: Message) => {
    const isCurrentlyPlaying = isPlaying(message.id);
    const isCurrentlyGenerating = isGenerating(message.id);
    const hasAudio = message.hasAudio;

    // Simple status for debugging
    const buttonStatus = isCurrentlyGenerating ? 'GENERATING' : 
                        isCurrentlyPlaying ? 'PLAYING' : 
                        hasAudio ? 'READY' : 'GENERATE';

    return (
      <TouchableOpacity
        style={[
          styles.speakerButton,
          isCurrentlyGenerating && { backgroundColor: '#FFE0B2' },
          isCurrentlyPlaying && { backgroundColor: '#C8E6C9' },
          hasAudio && !isCurrentlyPlaying && { backgroundColor: '#E3F2FD' }
        ]}
        onPress={() => handleTTSAction(message)}
        disabled={isCurrentlyGenerating}
        activeOpacity={0.7}
      >
        {isCurrentlyGenerating ? (
          <ActivityIndicator size={16} color="#FF9800" />
        ) : (
          <Ionicons
            name={isCurrentlyPlaying ? "stop" : hasAudio ? "volume-high" : "volume-medium"}
            size={16}
            color={isCurrentlyPlaying ? "#4CAF50" : hasAudio ? "#2196F3" : "#666"}
          />
        )}
      </TouchableOpacity>
    );
  };

  // COMPLETELY SIMPLIFIED MESSAGE RENDERING FOR MOBILE VISIBILITY
  const renderMessage = (message: Message, index: number) => (
    <View key={message.id} style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>
          {message.sender === 'user' ? '👤 YOU:' : '🤖 BOT:'}
        </Text>
      </View>
      
      <View style={styles.messageBox}>
        <Text style={styles.messageTextBasic}>
          {message.text}
        </Text>
        
        {message.sender === 'bot' && (
          <View style={styles.buttonContainer}>
            {renderSpeakerButton(message)}
          </View>
        )}
      </View>
      
      {/* Kannada translation display */}
      {message.kannadaText && message.showKannadaText && (
        <View style={styles.kannadaContainer}>
          <Text style={styles.kannadaLabelBasic}>Kannada (for TTS):</Text>
          <Text style={styles.kannadaTextBasic}>{message.kannadaText}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat Header with Clear Button */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Saathi AI Assistant</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearChat}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => renderMessage(message, index))}
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingTextBasic}>
              AI is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Container */}
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
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size={24} color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>SEND</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// COMPLETELY SIMPLIFIED STYLES FOR MAXIMUM VISIBILITY
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  clearButton: {
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
  },
  messageHeader: {
    marginBottom: 10,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageTextBasic: {
    flex: 1,
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
  },
  buttonContainer: {
    marginLeft: 10,
    alignItems: 'center',
  },
  speakerButton: {
    width: 40,
    height: 40,
    backgroundColor: '#EEEEEE',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kannadaContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#AAAAAA',
    borderRadius: 5,
  },
  kannadaLabelBasic: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  kannadaTextBasic: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingTextBasic: {
    marginTop: 10,
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 