import MooAIChat from '@/app/(app)/persona-ai';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context';
import { useSOS } from '@/context/SOSContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ColorValue, Dimensions, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface BannerImage {
  id: number;
  uri: string;
}

const TEAL = '#6ec3c1';
const CREAM = '#fff6e6';
const DARK = '#1a2a36';
const TILE_GRADIENT: [ColorValue, ColorValue] = ['#a8e6e6', '#6ec3c1'];
const BANNER_GRADIENT: [ColorValue, ColorValue] = ['#ffd3b6', '#ffaaa5'];

// Dummy images for the carousel
const BANNER_IMAGES: BannerImage[] = [
  { id: 1, uri: 'https://picsum.photos/800/400?random=1' },
  { id: 2, uri: 'https://picsum.photos/800/400?random=2' },
  { id: 3, uri: 'https://picsum.photos/800/400?random=3' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 200; // Height for the banner

export default function HomeScreen() {
  const { user } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! Welcome to Saathi! Ask me anything about karnataka, it's governance and how you can benifit!", sender: 'bot' },
  ]);
  const { sendSOS } = useSOS();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerImage>>(null);
  
  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < BANNER_IMAGES.length - 1) {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      } else {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Handle pull-to-refresh action
  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate a delay for refreshing
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle navigation to profile
  const navigateToProfile = () => {
    router.push('/(tabs)/profile' as any);
  };

  // Function to navigate to different sections
  const navigateToSection = (section: string) => {
    console.log(`Navigating to ${section}`);
    if (section === 'document-reader') {
      router.push('/(tabs)/forum' as any);
    } else if (section === 'schemes') {
      router.push('/(tabs)/stray-cows' as any);
    } else if (section === 'around-you') {
      router.push('/(tabs)/marketplace' as any);
    } else if (section === 'bus') {
      router.push('/(tabs)/bus' as any);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: CREAM }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Tile with Image Carousel */}
        <View style={styles.bannerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={BANNER_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={styles.bannerImageContainer}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.bannerGradientOverlay}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{t('explore.movingImages', 'Moving Images')}</Text>
                    <Text style={styles.bannerDescription}>{t('explore.movingImagesDescription', 'View latest updates and news')}</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {BANNER_IMAGES.map((_, index) => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      width: dotWidth,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {/* Document Reader Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('document-reader')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.documentReader', 'Document Reader')}</Text>
                <Text style={styles.cardDescription}>{t('explore.documentReaderDescription', 'Read and understand important documents')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Schemes Eligibility Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('schemes')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="ribbon-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.schemesEligibility', 'Schemes Eligibility')}</Text>
                <Text style={styles.cardDescription}>{t('explore.schemesDescription', 'Check your eligibility for government schemes')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Around You Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('around-you')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.aroundYou', 'Around You')}</Text>
                <Text style={styles.cardDescription}>{t('explore.aroundYouDescription', 'Discover places and services near you')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bus Assistance Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('bus')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="bus-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.busAssistance', 'Bus Assistance')}</Text>
                <Text style={styles.cardDescription}>{t('explore.networkDescription', 'Find Buses and Routes!')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* SOS Button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={sendSOS}
        activeOpacity={0.8}
      >
         <Ionicons name="warning-outline" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Chatbot Button */}
      <View style={styles.chatButtonContainer}>
        <View style={[styles.gradientBorder, { borderColor: TEAL, backgroundColor: '#fff' }]}>
          <TouchableOpacity
            style={[styles.chatButton, { backgroundColor: '#fff' }]}
            onPress={() => setIsChatVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="chatbubble-ellipses" size={30} color={TEAL} style={styles.aiIcon} />
              <Text style={[styles.buttonText, { color: TEAL }]}>{t('explore.askMooAI', 'Ask EMoo AI')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* MooAIChat Modal */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        onRequestClose={() => setIsChatVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsChatVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Saathi AI</Text>
            <View style={{ width: 24 }} />
          </View>
          <MooAIChat messages={messages} setMessages={setMessages} isOpen={isChatVisible} />
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollView: {
    flex: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
  },
  menuCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: 'transparent',
  },
  menuGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: DARK,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: DARK,
    opacity: 0.8,
  },
  chatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: TEAL,
    backgroundColor: '#fff',
    shadowColor: 'rgba(93, 64, 55, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  chatButton: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
  },
  aiIcon: {
    marginRight: 8,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    color: TEAL,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  sosButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 1,
  },
  bannerContainer: {
    width: '100%',
    height: BANNER_HEIGHT,
    marginBottom: 18,
  },
  bannerImageContainer: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  bannerDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});