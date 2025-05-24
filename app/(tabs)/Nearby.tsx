import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { MapParams } from '../../lib/nearby/mcp_maps_server';

// Styling constants
const TEAL = '#6ec3c1';
const CREAM = '#fff6e6';
const DARK = '#1a2a36';

// Example nearby categories
const NEARBY_CATEGORIES = [
  { id: 'hospital', name: 'Hospitals', icon: 'medical-outline' },
  { id: 'police', name: 'Police Stations', icon: 'shield-checkmark-outline' },
  { id: 'pharmacy', name: 'Pharmacies', icon: 'medkit-outline' },
  { id: 'restaurant', name: 'Restaurants', icon: 'restaurant-outline' },
  { id: 'atm', name: 'ATMs', icon: 'cash-outline' },
  { id: 'hotel', name: 'Hotels', icon: 'bed-outline' },
];

interface Message {
  role: string;
  text: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function NearbyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mapParams, setMapParams] = useState<MapParams>({ location: 'Current Location' });
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize the map server
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Mock function to simulate MCP server
        // In a real implementation, this would use the MCP SDK
        const mockMapQueryHandler = (params: MapParams) => {
          setMapParams(params);
        };

        // Simulate MCP server with local function
        mockMapQueryHandler({ location: 'Current Location' });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, []);

  // Function to search for nearby places
  const searchNearby = async (query: string) => {
    setIsGenerating(true);
    
    try {
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', text: query }]);
      
      // Update map parameters based on query
      // This is a simple implementation - in a full version this would use AI
      if (query.includes('restaurant') || query.includes('food')) {
        setMapParams({ search: 'restaurants near me' });
      } else if (query.includes('hospital') || query.includes('medical')) {
        setMapParams({ search: 'hospitals near me' });
      } else if (query.includes('police')) {
        setMapParams({ search: 'police stations near me' });
      } else if (query.includes('pharmacy')) {
        setMapParams({ search: 'pharmacies near me' });
      } else if (query.includes('hotel') || query.includes('stay')) {
        setMapParams({ search: 'hotels near me' });
      } else if (query.includes('atm') || query.includes('cash')) {
        setMapParams({ search: 'atms near me' });
      } else if (query.includes('direction') || query.includes('route')) {
        const parts = query.split(' to ');
        if (parts.length > 1) {
          setMapParams({ origin: 'my location', destination: parts[1] });
        } else {
          setMapParams({ search: query });
        }
      } else {
        // Default search
        setMapParams({ search: query });
      }
      
      // Add AI response to chat
      const responseText = `I've found some results for "${query}" and updated the map for you.`;
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
      
      // Scroll to bottom of chat
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error("Error searching nearby:", error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        text: `Error: ${error.message || 'Something went wrong'}` 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle category selection
  const handleCategorySelect = (category: Category) => {
    searchNearby(`Find nearby ${category.name} around my current location`);
  };

  // Function to handle search query submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchNearby(searchQuery);
      setSearchQuery('');
    }
  };

  // Create map URL based on params
  const getMapUrl = () => {
    const MAPS_API_KEY = 'AIzaSyC7c1m_Jyz3uw6lbIQUNuH3e6o0NKc_8hk';
    let src = '';
    
    if (mapParams.location) {
      src = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${mapParams.location}`;
    } else if (mapParams.origin && mapParams.destination) {
      src = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_API_KEY}&origin=${mapParams.origin}&destination=${mapParams.destination}`;
    } else if (mapParams.search) {
      src = `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=${mapParams.search}`;
    } else {
      // Default to user's current location
      src = `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=my+location`;
    }
    
    return src;
  };

  // Create HTML content with iframe for Google Maps Embedded API
  const getMapHTML = () => {
    const mapUrl = getMapUrl();
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow: hidden;
            }
            iframe {
              border: 0;
              height: 100%;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <iframe 
            src="${mapUrl}"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </body>
      </html>
    `;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('explore.Nearby', 'Nearby Places')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: getMapHTML() }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            onError={(error) => console.error('WebView error:', error)}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={NEARBY_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.categoryItem} 
                onPress={() => handleCategorySelect(item)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons name={item.icon as any} size={24} color={TEAL} />
                </View>
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchNearby', 'Search nearby places...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          style={styles.chatContainer}
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.messageContainer, 
                msg.role === 'user' ? styles.userMessage : styles.aiMessage,
                msg.role === 'error' && styles.errorMessage
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
          {isGenerating && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <Text style={styles.messageText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  mapContainer: {
    height: '40%',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    color: DARK,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: TEAL,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorMessage: {
    backgroundColor: '#FFE0E0',
    borderColor: '#FF9999',
  },
  messageText: {
    fontSize: 14,
    color: DARK,
  },
}); 