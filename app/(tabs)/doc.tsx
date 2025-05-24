import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/ThemedText';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { Colors } from '../../constants/Colors';

// API service for legal QnA
class LegalQnAService {
  private baseUrl: string;
  
  constructor() {
    // IMPORTANT: We're now connecting directly to the legal_qna service instead of using the backend proxy
    // This bypasses potential connection issues with the backend
    
    // For development testing on localhost
    this.baseUrl = 'http://localhost:8080';
    
    // IMPORTANT: If testing on a real device, replace 'localhost' with your computer's IP address
    // Example: this.baseUrl = 'http://192.168.24.167:8080';
    
    console.log('Legal QnA service using direct URL:', this.baseUrl);
  }
  
  async uploadDocument(file: FormData): Promise<any> {
    try {
      console.log('Uploading document to:', `${this.baseUrl}/upload`);
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: file,
      });
      
      const responseData = await response.json();
      console.log('Upload response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        detail: `Document upload failed: ${error}`
      };
    }
  }
  
  async askQuestion(question: string): Promise<any> {
    try {
      console.log('Asking question:', question);
      const response = await fetch(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Question error:', error);
      return {
        answer: `Error: ${error}`,
        context: []
      };
    }
  }
  
  async loadTestDocument(): Promise<any> {
    try {
      console.log('Loading test document from:', `${this.baseUrl}/load-test-file`);
      const response = await fetch(`${this.baseUrl}/load-test-file`);
      const responseData = await response.json();
      console.log('Test document response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Test document error:', error);
      return {
        detail: `Failed to load test document: ${error}`
      };
    }
  }
}

// Initialize the service
const legalQnAService = new LegalQnAService();

// Define a type for document assets
interface DocAsset {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export default function DocumentReaderScreen() {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState<string[]>([]);
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/plain'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      uploadDocument(result.assets[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error(error);
    }
  };
  
  const uploadDocument = async (asset: DocAsset) => {
    setIsUploading(true);
    setUploadStatus('Processing document...');
    
    try {
      console.log('Uploading asset:', asset.name, asset.uri);
      
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      } as any);
      
      const response = await legalQnAService.uploadDocument(formData);
      
      if (!response.detail) {
        setIsDocumentUploaded(true);
        setUploadStatus(`Document processed successfully! ${response.chunks_indexed || 0} chunks indexed.`);
      } else {
        setUploadStatus(`Upload failed: ${response.detail}`);
      }
    } catch (error) {
      console.error('Upload function error:', error);
      setUploadStatus(`Upload failed: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const loadTestDocument = async () => {
    setIsUploading(true);
    setUploadStatus('Loading test document...');
    
    try {
      const response = await legalQnAService.loadTestDocument();
      
      if (!response.detail) {
        setIsDocumentUploaded(true);
        setUploadStatus(`Test document loaded successfully! ${response.chunks_indexed || 0} chunks indexed.`);
      } else {
        setUploadStatus(`Failed to load test document: ${response.detail}`);
      }
    } catch (error) {
      setUploadStatus(`Failed to load test document: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const askQuestion = async () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    
    setIsAsking(true);
    
    try {
      const response = await legalQnAService.askQuestion(question.trim());
      
      if (response.answer) {
        setAnswer(response.answer);
        setContext(response.context || []);
      } else {
        Alert.alert('Error', response.detail || 'Failed to get answer');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get answer');
    } finally {
      setIsAsking(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <AppHeader
        title="Document Reader"
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="Upload Document" />
          <Card.Content>
            <Text style={styles.description}>
              Upload a legal document (PDF, image, or text) and ask questions about it.
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={pickDocument}
                disabled={isUploading}
                style={styles.button}
              >
                Select Document
              </Button>
              
              <Button
                mode="outlined"
                onPress={loadTestDocument}
                disabled={isUploading}
                style={styles.button}
              >
                Load Sample Document
              </Button>
            </View>
            
            {(isUploading || uploadStatus) && (
              <View style={styles.statusContainer}>
                {isUploading && <ActivityIndicator size="small" color={Colors.primary} />}
                <Text style={styles.statusText}>{uploadStatus}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {isDocumentUploaded && (
          <Card style={styles.card}>
            <Card.Title title="Ask Questions" />
            <Card.Content>
              <TextInput
                label="Your question about the document"
                value={question}
                onChangeText={setQuestion}
                style={styles.input}
                disabled={isAsking}
                placeholder="e.g., What is the retainer fee mentioned in the agreement?"
              />
              
              <Button
                mode="contained"
                onPress={askQuestion}
                loading={isAsking}
                disabled={isAsking}
                style={styles.button}
              >
                Ask Question
              </Button>
              
              {answer && (
                <View style={styles.answerContainer}>
                  <ThemedText type="subtitle" style={styles.answerLabel}>Answer:</ThemedText>
                  <Text style={styles.answerText}>{answer}</Text>
                  
                  {context.length > 0 && (
                    <View>
                      <TouchableOpacity
                        onPress={() => setShowContext(!showContext)}
                        style={styles.contextButton}
                      >
                        <Text style={styles.contextButtonText}>
                          {showContext ? "Hide Context" : "Show Context"}
                        </Text>
                      </TouchableOpacity>
                      
                      {showContext && (
                        <View style={styles.contextContainer}>
                          <ThemedText type="subtitle">Context from Document:</ThemedText>
                          {context.map((text, index) => (
                            <Text key={index} style={styles.contextText}>{text}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
  },
  answerContainer: {
    marginTop: 24,
  },
  answerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contextButton: {
    marginTop: 16,
  },
  contextButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  contextContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  contextText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
}); 