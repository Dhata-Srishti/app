import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
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

  const API_BASE_URL = 'http://localhost:8081/api/transport';

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
      Alert.alert('Error', 'Network error. Please check if the transport server is running.');
      console.error('Search error:', error);
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
      Alert.alert('Error', 'Network error. Please check if the transport server is running.');
      console.error('Route error:', error);
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
              style={styles.searchButton}
              onPress={searchBuses}
              disabled={loading}
            >
              <LinearGradient
                colors={['#f57f17', '#f9a825']}
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
              style={styles.searchButton}
              onPress={searchBusRoute}
              disabled={loading}
            >
              <LinearGradient
                colors={['#f57f17', '#f9a825']}
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
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchButton: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57f17',
    marginVertical: 10,
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    color: '#5D4037',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#f57f17',
    marginLeft: 4,
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
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
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
  },
  seats: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  bmtcCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  route: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  stopsContainer: {
    marginTop: 5,
  },
  stopsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 5,
  },
  stop: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
}); 