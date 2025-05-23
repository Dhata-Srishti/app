import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
}

interface MooAIChatProps {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isOpen: boolean;
}

export default function MooAIChat({ messages, setMessages, isOpen }: MooAIChatProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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
      };

      setMessages([...updatedMessages, botResponse]);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: Message = {
        text: `I'm sorry, I'm having trouble connecting to my AI service. This could be due to:\n\n• Backend server not running\n• Network connectivity issues\n• Server overload\n\nPlease try again in a moment.\n\nTechnical details: ${error}`,
        sender: 'bot',
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            <ThemedText style={styles.messageText}>{message.text}</ThemedText>
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
          placeholder="Ask about Indian cow breeds or anything else..."
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
            <ActivityIndicator size={24} color="#999" />
          ) : (
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? '#5D4037' : '#999'}
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
    backgroundColor: '#faebd7',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5D4037',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#8D6E63',
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 