import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ColorValue,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const TEAL = '#6ec3c1';
const CREAM = '#fff6e6';
const DARK = '#1a2a36';
const TILE_GRADIENT: [ColorValue, ColorValue] = ['#a8e6e6', '#6ec3c1'];

export default function BusScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [routeResult, setRouteResult] = useState<BMTCBus | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'route'>('search');

  // Use IP address for mobile devices, localhost for web
  const API_BASE_URL = Platform.OS === 'web' 
    ? 'http://localhost:8083/api/transport'
    : 'http://192.168.159.96:8083/api/transport';

  const searchBuses = async () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert('Error', 'Please enter both from and to locations');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search-buses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: from.trim(),
          to: to.trim(),
          date: date.trim() || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
        setRouteResult(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to search buses');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = Platform.OS === 'web' 
        ? 'Network error. Please check if the transport server is running on localhost:8083.'
        : 'Network error. Please ensure you are connected to the same WiFi network as your development machine.';
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchBusRoute = async () => {
    if (!busNumber.trim()) {
      Alert.alert('Error', 'Please enter a bus number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bus-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busNumber: busNumber.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRouteResult(data.data);
        setSearchResult(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to get bus route');
      }
    } catch (error) {
      console.error('Route error:', error);
      const errorMessage = Platform.OS === 'web' 
        ? 'Network error. Please check if the transport server is running on localhost:8083.'
        : 'Network error. Please ensure you are connected to the same WiFi network as your development machine.';
      Alert.alert('Connection Error', errorMessage);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: CREAM }]}>
      <View style={styles.mainContentArea}>
        {/* Simplified Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('explore.busAssistance', 'Bus Assistance')}</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Debug Info (only show in development) */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                🔧 Debug: Using {Platform.OS === 'web' ? 'localhost' : 'IP'} - {API_BASE_URL}
              </Text>
            </View>
          )}

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'search' && styles.activeTab]}
              onPress={() => setActiveTab('search')}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color={activeTab === 'search' ? '#FFF' : DARK} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                Search Buses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'route' && styles.activeTab]}
              onPress={() => setActiveTab('route')}
            >
              <Ionicons 
                name="map" 
                size={20} 
                color={activeTab === 'route' ? '#FFF' : DARK} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'route' && styles.activeTabText]}>
                Bus Route
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Buses Tab */}
          {activeTab === 'search' && (
            <View style={styles.searchContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color={TEAL} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={from}
                    onChangeText={setFrom}
                    placeholder="Enter starting location"
                    placeholderTextColor="rgba(26, 42, 54, 0.4)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color={TEAL} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={to}
                    onChangeText={setTo}
                    placeholder="Enter destination"
                    placeholderTextColor="rgba(26, 42, 54, 0.4)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color={TEAL} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="DD-MM-YYYY (Optional)"
                    placeholderTextColor="rgba(26, 42, 54, 0.4)"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchBuses}
                disabled={loading}
              >
                <LinearGradient
                  colors={TILE_GRADIENT}
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
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="bus" size={20} color={TEAL} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={busNumber}
                    onChangeText={setBusNumber}
                    placeholder="Enter bus number"
                    placeholderTextColor="rgba(26, 42, 54, 0.4)"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchBusRoute}
                disabled={loading}
              >
                <LinearGradient
                  colors={TILE_GRADIENT}
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
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {searchResult.serviceType} Buses
                </Text>
                <Text style={styles.resultsSubtitle}>
                  {searchResult.from} → {searchResult.to}
                </Text>
              </View>
              
              {searchResult.serviceType === 'BMTC' && searchResult.buses && (
                <View style={styles.busList}>
                  {searchResult.buses.map((bus, index) => renderBMTCBus(bus, index))}
                </View>
              )}

              {searchResult.serviceType === 'KSRTC' && (
                <View style={styles.busList}>
                  {searchResult.luxuryBuses && searchResult.luxuryBuses.length > 0 && (
                    <View style={styles.busCategory}>
                      <View style={styles.categoryHeader}>
                        <Ionicons name="star" size={20} color={TEAL} />
                        <Text style={styles.categoryTitle}>Luxury Buses</Text>
                      </View>
                      {searchResult.luxuryBuses.map((service, index) => renderBusService(service, index))}
                    </View>
                  )}

                  {searchResult.expressBuses && searchResult.expressBuses.length > 0 && (
                    <View style={styles.busCategory}>
                      <View style={styles.categoryHeader}>
                        <Ionicons name="flash" size={20} color={TEAL} />
                        <Text style={styles.categoryTitle}>Express Buses</Text>
                      </View>
                      {searchResult.expressBuses.map((service, index) => renderBusService(service, index))}
                    </View>
                  )}

                  {searchResult.localBuses && searchResult.localBuses.length > 0 && (
                    <View style={styles.busCategory}>
                      <View style={styles.categoryHeader}>
                        <Ionicons name="bus" size={20} color={TEAL} />
                        <Text style={styles.categoryTitle}>Local Buses</Text>
                      </View>
                      {searchResult.localBuses.map((service, index) => renderBusService(service, index))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {routeResult && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Bus Route</Text>
                <Text style={styles.resultsSubtitle}>Bus {routeResult.busNumber}</Text>
              </View>
              {renderBMTCBus(routeResult, 0)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  mainContentArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93, 64, 55, 0.1)',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DARK,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 64, 55, 0.2)',
  },
  activeTab: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    color: DARK,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  searchContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: CREAM,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: DARK,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DARK,
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 15,
    color: DARK,
    opacity: 0.6,
  },
  busList: {
    gap: 16,
  },
  busCategory: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK,
    marginLeft: 8,
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 195, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 14,
    color: TEAL,
    marginLeft: 4,
    fontWeight: '500',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: CREAM,
    borderRadius: 12,
    padding: 12,
  },
  timeContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: DARK,
    opacity: 0.6,
    marginBottom: 4,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CREAM,
    borderRadius: 12,
    padding: 12,
  },
  busType: {
    fontSize: 14,
    color: DARK,
    opacity: 0.6,
    flex: 1,
  },
  fare: {
    fontSize: 16,
    fontWeight: '600',
    color: TEAL,
  },
  seats: {
    fontSize: 14,
    color: DARK,
    opacity: 0.6,
    marginLeft: 12,
    backgroundColor: 'rgba(110, 195, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmtcCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK,
    backgroundColor: 'rgba(110, 195, 193, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  route: {
    fontSize: 15,
    color: DARK,
    opacity: 0.8,
    marginBottom: 12,
    backgroundColor: CREAM,
    padding: 12,
    borderRadius: 12,
  },
  stopsContainer: {
    backgroundColor: CREAM,
    borderRadius: 12,
    padding: 12,
  },
  stopsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
    marginBottom: 8,
  },
  stop: {
    fontSize: 14,
    color: DARK,
    opacity: 0.6,
    marginBottom: 4,
    paddingLeft: 8,
  },
  debugContainer: {
    marginHorizontal: 0,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'rgba(93, 64, 55, 0.1)',
  },
  debugText: {
    fontSize: 12,
    color: TEAL,
    textAlign: 'center',
  },
}); 