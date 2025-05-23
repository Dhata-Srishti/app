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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: from.trim(), to: to.trim(), date: date.trim() || undefined }),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busNumber: busNumber.trim() }),
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
        {bus.stops.length > 5 && <Text style={styles.stop}>• ... and {bus.stops.length - 5} more stops</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={["#fdbb65", "#f9a825", "#f57f17"]}
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

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search Buses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'route' && styles.activeTab]}
            onPress={() => setActiveTab('route')}
          >
            <Text style={[styles.tabText, activeTab === 'route' && styles.activeTabText]}>Bus Route</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            {/* From, To, Date Inputs and Search Button */}
            {/* ... */}
          </View>
        )}

        {activeTab === 'route' && (
          <View style={styles.searchContainer}>
            {/* Bus Number Input and Get Route Button */}
            {/* ... */}
          </View>
        )}

        {searchResult && (
          <View style={styles.resultsContainer}>
            {/* Render searchResult with renderBMTCBus or renderBusService */}
          </View>
        )}

        {routeResult && (
          <View style={styles.resultsContainer}>
            {/* Render single BMTCBus routeResult */}
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

