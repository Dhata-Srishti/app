import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { dhataApi } from '../services/api';

interface DemoState {
  loading: boolean;
  result: string;
}

export default function DhataDemo() {
  const [textQuery, setTextQuery] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [ttsText, setTtsText] = useState('');
  
  const [textQueryState, setTextQueryState] = useState<DemoState>({ loading: false, result: '' });
  const [translationState, setTranslationState] = useState<DemoState>({ loading: false, result: '' });
  const [healthState, setHealthState] = useState<DemoState>({ loading: false, result: '' });

  const checkBackendHealth = async () => {
    setHealthState({ loading: true, result: '' });
    
    try {
      const response = await dhataApi.checkHealth();
      setHealthState({
        loading: false,
        result: JSON.stringify(response, null, 2)
      });
    } catch (error) {
      setHealthState({
        loading: false,
        result: `Error: ${error}`
      });
    }
  };

  const handleTextQuery = async () => {
    if (!textQuery.trim()) {
      Alert.alert('Error', 'Please enter a text query');
      return;
    }

    setTextQueryState({ loading: true, result: '' });
    
    try {
      const response = await dhataApi.textQuery({
        prompt: textQuery,
        src_lang: 'en',
        tgt_lang: 'en'
      });
      
      setTextQueryState({
        loading: false,
        result: JSON.stringify(response, null, 2)
      });
    } catch (error) {
      setTextQueryState({
        loading: false,
        result: `Error: ${error}`
      });
    }
  };

  const handleTranslation = async () => {
    if (!translationText.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    setTranslationState({ loading: true, result: '' });
    
    try {
      const response = await dhataApi.translate({
        text: translationText,
        src_lang: 'en',
        tgt_lang: 'kn' // Translate to Kannada
      });
      
      setTranslationState({
        loading: false,
        result: JSON.stringify(response, null, 2)
      });
    } catch (error) {
      setTranslationState({
        loading: false,
        result: `Error: ${error}`
      });
    }
  };

  const handleTextToSpeech = async () => {
    if (!ttsText.trim()) {
      Alert.alert('Error', 'Please enter text for speech synthesis');
      return;
    }

    try {
      const ttsResponse = await dhataApi.textToSpeech({
        input_text: ttsText,
        return_translation: true  // Get the Kannada translation
      });
      
      if (ttsResponse.audioUri) {
        let message = `Audio generated successfully!\n\nOriginal: ${ttsResponse.original_text}`;
        if (ttsResponse.kannada_text) {
          message += `\n\nKannada (for TTS): ${ttsResponse.kannada_text}`;
        }
        Alert.alert('TTS Success', message);
      } else {
        Alert.alert('Error', 'Failed to generate audio');
      }
    } catch (error) {
      Alert.alert('Error', `TTS failed: ${error}`);
    }
  };

  const renderSection = (
    title: string,
    input: React.ReactElement,
    onPress: () => void,
    state: DemoState,
    buttonText: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {input}
      
      <TouchableOpacity 
        style={[styles.button, state.loading && styles.buttonDisabled]}
        onPress={onPress}
        disabled={state.loading}
      >
        {state.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
      
      {state.result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <ScrollView style={styles.resultScroll}>
            <Text style={styles.resultText}>{state.result}</Text>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dhata Backend API Demo</Text>
      
      {/* Health Check */}
      {renderSection(
        'Backend Health Check',
        <Text style={styles.description}>Check if the backend API is running</Text>,
        checkBackendHealth,
        healthState,
        'Check Health'
      )}

      {/* Text Query */}
      {renderSection(
        'AI Text Query',
        <TextInput
          style={styles.input}
          placeholder="Enter your question for the AI..."
          value={textQuery}
          onChangeText={setTextQuery}
          multiline
        />,
        handleTextQuery,
        textQueryState,
        'Send Query'
      )}

      {/* Translation */}
      {renderSection(
        'Text Translation (EN → KN)',
        <TextInput
          style={styles.input}
          placeholder="Enter text to translate to Kannada..."
          value={translationText}
          onChangeText={setTranslationText}
          multiline
        />,
        handleTranslation,
        translationState,
        'Translate'
      )}

      {/* Text to Speech */}
      {renderSection(
        'Text to Speech',
        <TextInput
          style={styles.input}
          placeholder="Enter text to convert to speech..."
          value={ttsText}
          onChangeText={setTtsText}
          multiline
        />,
        handleTextToSpeech,
        { loading: false, result: '' },
        'Generate Speech'
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Note: Make sure the backend server is running on localhost:5001
        </Text>
        <Text style={styles.footerText}>
          Run: npm run backend
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  resultScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 5,
  },
}); 