import { getCurrentLanguage } from '@/lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  audioUri?: string;
  audioBuffer?: ArrayBuffer;  // Direct audio data for buffer-based playback
  isGeneratingAudio?: boolean;
  hasAudio?: boolean;
  kannadaText?: string;
  showKannadaText?: boolean;
  relatedSection?: string;  // Added for navigation to app sections
}

const STORAGE_KEY = 'chat_messages';
const MAX_MESSAGES = 100; // Limit stored messages to prevent excessive storage usage

const DEFAULT_WELCOME_MESSAGE_EN: Message = {
  id: 'welcome',
  text: "Hello! Welcome! Ask me anything about karnataka, it's governance and how you can benifit!",
  sender: 'bot',
  timestamp: Date.now(),
  hasAudio: false,
  isGeneratingAudio: false,
};

const DEFAULT_WELCOME_MESSAGE_KN: Message = {
  id: 'welcome',
  text: "ನಮಸ್ಕಾರ! ಸುಸ್ವಾಗತ! ಕರ್ನಾಟಕ, ಅದರ ಆಡಳಿತ ಮತ್ತು ನೀವು ಹೇಗೆ ಪ್ರಯೋಜನ ಪಡೆಯಬಹುದು ಎಂಬುದರ ಬಗ್ಗೆ ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ!",
  sender: 'bot',
  timestamp: Date.now(),
  hasAudio: false,
  isGeneratingAudio: false,
};

export const useChatMessages = () => {
  const currentLang = getCurrentLanguage();
  const DEFAULT_WELCOME_MESSAGE = currentLang === 'kn' ? DEFAULT_WELCOME_MESSAGE_KN : DEFAULT_WELCOME_MESSAGE_EN;
  
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from storage on mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages: Message[] = JSON.parse(storedMessages);
        // Ensure welcome message is always present if no messages exist
        if (parsedMessages.length === 0) {
          const currentLang = getCurrentLanguage();
          const welcomeMessage = currentLang === 'kn' ? DEFAULT_WELCOME_MESSAGE_KN : DEFAULT_WELCOME_MESSAGE_EN;
          setMessages([welcomeMessage]);
        } else {
          setMessages(parsedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      const currentLang = getCurrentLanguage();
      const welcomeMessage = currentLang === 'kn' ? DEFAULT_WELCOME_MESSAGE_KN : DEFAULT_WELCOME_MESSAGE_EN;
      setMessages([welcomeMessage]);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      // Keep only the latest MAX_MESSAGES to prevent storage bloat
      const messagesToSave = newMessages.slice(-MAX_MESSAGES);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  };

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });

    return newMessage.id;
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, []);

  const clearMessages = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      const currentLang = getCurrentLanguage();
      const welcomeMessage = currentLang === 'kn' ? DEFAULT_WELCOME_MESSAGE_KN : DEFAULT_WELCOME_MESSAGE_EN;
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to clear chat messages:', error);
    }
  }, []);

  const getMessageById = useCallback((messageId: string) => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  return {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearMessages,
    getMessageById,
    isLoading,
    setIsLoading,
  };
}; 