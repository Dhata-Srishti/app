import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TRANSPORT_API_CONFIG } from '../../config/api.config';

interface BusService {
  serviceName: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  fare: string;
  busType: string;
  rating?: string;
}

interface BMTCBus {
  busNumber: string;
  from: string;
  to: string;
  stops: string[];
  type?: string;
}

interface SearchResult {
  serviceType: 'BMTC' | 'KSRTC';
  from: string;
  to: string;
  date?: string;
  buses?: BMTCBus[];
  luxuryBuses?: BusService[];
  expressBuses?: BusService[];
  localBuses?: BusService[];
}

export default function NetworkScreen() {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [routeResult, setRouteResult] = useState<BMTCBus | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'route'>('search');
  const [transportServerAvailable, setTransportServerAvailable] = useState<boolean | null>(null);

  // Check transport server availability on component mount
  useEffect(() => {
    checkTransportServerAvailability();
  }, []);

  const checkTransportServerAvailability = async () => {
    try {
      const baseUrl = getTransportBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Quick 3-second check
      
      const response = await platformFetch(`${baseUrl}/health`, { 
        method: 'GET',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setTransportServerAvailable(true);
      } else {
        setTransportServerAvailable(false);
      }
    } catch (error) {
      console.log('Transport server not available:', error);
      setTransportServerAvailable(false);
    }
  };

  // Web: Use localhost:8083 
  // Mobile: Use environment variable or fallback gracefully
  const getTransportBaseUrl = (): string => {
    if (Platform.OS === 'web') {
      return 'http://localhost:8083/api/transport';
    } else {
      const baseUrl = TRANSPORT_API_CONFIG.BASE_URL;
      if (baseUrl === 'http://localhost:8083') {
        // Use the IP from environment if available
        return 'http://192.168.159.96:8083/api/transport';
      }
      return `${baseUrl}/api/transport`;
    }
  };

  const API_BASE_URL = getTransportBaseUrl();

  // Alternative fetch function for web platforms
  const webFetch = (url: string, options: RequestInit): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || 'GET', url);
      
      if (options.headers) {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      
      xhr.onload = () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((acc, line) => {
            const [key, value] = line.split(': ');
            if (key && value) acc[key] = value;
            return acc;
          }, {} as Record<string, string>))
        });
        resolve(response);
      };
      
      xhr.onerror = () => reject(new Error(`Network request failed: ${xhr.status} ${xhr.statusText}`));
      xhr.ontimeout = () => reject(new Error('Network request timed out'));
      
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Request aborted'));
        });
      }
      
      xhr.timeout = 10000;
      xhr.send(options.body as string);
    });
  };

  const platformFetch = Platform.OS === 'web' ? webFetch : fetch;

  // Show helpful setup message instead of intrusive alerts
  const showTransportSetupMessage = useCallback(() => {
    const message = Platform.OS === 'web' 
      ? 'Transport server not running. Please start it with:\n\ncd backend && go run transport-server.go'
      : `Transport server setup needed:\n\n1. Start the transport server on your dev machine\n2. Ensure both devices are on the same WiFi\n\nCurrent URL: ${API_BASE_URL}`;
    
    Alert.alert('Transport Setup Required', message, [
      { text: 'OK', style: 'default' },
      { 
        text: 'Retry', 
        onPress: () => checkTransportServerAvailability()
      }
    ]);
  }, [API_BASE_URL]);

  const handleTransportError = useCallback((error: any, operation: string) => {
    console.log(`Transport ${operation} error:`, error);
    
    // Don't show intrusive alerts for every error - just log and show user-friendly message
    const errorMessage = transportServerAvailable === false 
      ? 'Transport service is not available. Please check setup.'
      : 'Network error occurred. Please try again.';
    
    // Only show alert for user-initiated actions
    if (operation === 'search' || operation === 'route') {
      Alert.alert('Transport Service', errorMessage, [
        { text: 'OK', style: 'default' },
        { text: 'Setup Help', onPress: showTransportSetupMessage }
      ]);
    }
  }, [transportServerAvailable, showTransportSetupMessage]);

  const searchBuses = async () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please enter both from and to locations');
      return;
    }

    if (transportServerAvailable === false) {
      showTransportSetupMessage();
      return;
    }

    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await platformFetch(`${API_BASE_URL}/search-buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: from.trim(),
          to: to.trim(),
          date: date.trim() || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
        setRouteResult(null);
        setTransportServerAvailable(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to search buses');
      }
    } catch (error: unknown) {
      handleTransportError(error, 'search');
      setTransportServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const searchBusRoute = async () => {
    if (!busNumber.trim()) {
      Alert.alert('Error', 'Please enter a bus number');
      return;
    }

    if (transportServerAvailable === false) {
      showTransportSetupMessage();
      return;
    }

    setLoading(true);
    try {
      const response = await platformFetch(`${API_BASE_URL}/bus-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busNumber: busNumber.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRouteResult(data.data);
        setSearchResult(null);
        setTransportServerAvailable(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to get bus route');
      }
    } catch (error) {
      handleTransportError(error, 'route');
      setTransportServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const renderBusService = (service: BusService, index: number) => (
    <View key={index} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{service.serviceName}</Text>
        {service.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f57f17" />
            <Text style={styles.rating}>{service.rating}</Text>
          </View>
        )}
      </View>
      <View style={styles.serviceDetails}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Departure</Text>
          <Text style={styles.time}>{service.departureTime}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Arrival</Text>
          <Text style={styles.time}>{service.arrivalTime}</Text>
        </View>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.busType}>{service.busType}</Text>
        <Text style={styles.fare}>{service.fare}</Text>
        <Text style={styles.seats}>{service.availableSeats} seats</Text>
      </View>
    </View>
  );

  const renderBMTCBus = (bus: BMTCBus, index: number) => (
    <View key={index} style={styles.bmtcCard}>
      <View style={styles.busHeader}>
        <Text style={styles.busNumber}>{bus.busNumber}</Text>
        <Text style={styles.busType}>BMTC</Text>
      </View>
      <Text style={styles.route}>{bus.from} → {bus.to}</Text>
      <View style={styles.stopsContainer}>
        <Text style={styles.stopsLabel}>Key Stops:</Text>
        {bus.stops.slice(0, 5).map((stop, stopIndex) => (
          <Text key={stopIndex} style={styles.stop}>• {stop}</Text>
        ))}
        {bus.stops.length > 5 && (
          <Text style={styles.stop}>• ... and {bus.stops.length - 5} more stops</Text>
        )}
      </View>
    </View>
  );

  const renderServerStatus = () => {
    if (transportServerAvailable === null) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#f57f17" />
          <Text style={styles.statusText}>Checking transport service...</Text>
        </View>
      );
    }
    
    if (transportServerAvailable === false) {
      return (
        <View style={[styles.statusContainer, styles.statusError]}>
          <Ionicons name="warning-outline" size={20} color="#ff6b6b" />
          <Text style={styles.statusTextError}>Transport service unavailable</Text>
          <TouchableOpacity onPress={showTransportSetupMessage} style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Setup Help</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={[styles.statusContainer, styles.statusSuccess]}>
        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        <Text style={styles.statusTextSuccess}>Transport service ready</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={['#fdbb65', '#f9a825', '#f57f17']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="bus" size={40} color="#FFF" />
            <Text style={styles.headerTitle}>🚌 Transport Help</Text>
            <Text style={styles.headerSubtitle}>Find buses and routes</Text>
          </View>
        </LinearGradient>

        {/* Server Status */}
        {renderServerStatus()}

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search Buses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'route' && styles.activeTab]}
            onPress={() => setActiveTab('route')}
          >
            <Text style={[styles.tabText, activeTab === 'route' && styles.activeTabText]}>
              Bus Route
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Buses Tab */}
        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>From</Text>
              <TextInput
                style={styles.input}
                value={from}
                onChangeText={setFrom}
                placeholder="Enter starting location (e.g., MG Road, Hebbal)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>To</Text>
              <TextInput
                style={styles.input}
                value={to}
                onChangeText={setTo}
                placeholder="Enter destination (e.g., Silk Board, Whitefield)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="DD-MM-YYYY (for KSRTC buses)"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[styles.searchButton, transportServerAvailable === false && styles.searchButtonDisabled]}
              onPress={searchBuses}
              disabled={loading || transportServerAvailable === false}
            >
              <LinearGradient
                colors={transportServerAvailable === false ? ['#ccc', '#999'] : ['#f57f17', '#f9a825']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Search Buses</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Bus Route Tab */}
        {activeTab === 'route' && (
          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bus Number</Text>
              <TextInput
                style={styles.input}
                value={busNumber}
                onChangeText={setBusNumber}
                placeholder="Enter bus number (e.g., 500D, 401K)"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[styles.searchButton, transportServerAvailable === false && styles.searchButtonDisabled]}
              onPress={searchBusRoute}
              disabled={loading || transportServerAvailable === false}
            >
              <LinearGradient
                colors={transportServerAvailable === false ? ['#ccc', '#999'] : ['#f57f17', '#f9a825']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="map" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Get Route</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {searchResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              🚌 {searchResult.serviceType} Buses: {searchResult.from} → {searchResult.to}
            </Text>
            
            {searchResult.serviceType === 'BMTC' && searchResult.buses && (
              <View>
                {searchResult.buses.map((bus, index) => renderBMTCBus(bus, index))}
              </View>
            )}

            {searchResult.serviceType === 'KSRTC' && (
              <View>
                {searchResult.luxuryBuses && searchResult.luxuryBuses.length > 0 && (
                  <View>
                    <Text style={styles.categoryTitle}>🌟 Luxury Buses</Text>
                    {searchResult.luxuryBuses.map((service, index) => renderBusService(service, index))}
                  </View>
                )}

                {searchResult.expressBuses && searchResult.expressBuses.length > 0 && (
                  <View>
                    <Text style={styles.categoryTitle}>🚀 Express Buses</Text>
                    {searchResult.expressBuses.map((service, index) => renderBusService(service, index))}
                  </View>
                )}

                {searchResult.localBuses && searchResult.localBuses.length > 0 && (
                  <View>
                    <Text style={styles.categoryTitle}>🚶 Local Buses</Text>
                    {searchResult.localBuses.map((service, index) => renderBusService(service, index))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {routeResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              🚌 Bus Route: {routeResult.busNumber}
            </Text>
            {renderBMTCBus(routeResult, 0)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1de',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f0f4f8',
  },
  statusSuccess: {
    backgroundColor: '#e8f5e8',
  },
  statusError: {
    backgroundColor: '#ffeaea',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statusTextSuccess: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statusTextError: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  helpButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f57f17',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57f17',
    marginTop: 20,
    marginBottom: 10,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#f57f17',
    fontWeight: '500',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busType: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  fare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57f17',
    marginHorizontal: 10,
  },
  seats: {
    fontSize: 14,
    color: '#666',
  },
  bmtcCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f57f17',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f57f17',
  },
  route: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  stopsContainer: {
    marginTop: 8,
  },
  stopsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  stop: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
}); 