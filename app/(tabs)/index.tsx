import MooAIChat from '@/app/(app)/persona-ai';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context';
import { useSOS } from '@/context/SOSContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorValue, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const TEAL = '#6ec3c1';
const CREAM = '#fff6e6';
const DARK = '#1a2a36';
const TILE_GRADIENT: [ColorValue, ColorValue] = ['#a8e6e6', '#6ec3c1'];

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
    if (section === 'forum') {
      router.push('/(tabs)/forum' as any);
    } else if (section === 'report') {
      router.push('/(tabs)/stray-cows' as any);
    } else if (section === 'marketplace') {
      router.push('/(tabs)/marketplace' as any);
    } else if (section === 'network') {
      router.push('/(tabs)/network' as any);
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
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <ThemedText style={[styles.welcomeText, { color: DARK }]}>
            {t('common.welcome', 'Welcome')}, {user?.displayName || t('common.user', 'User')}!
          </ThemedText>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {/* Forum Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('forum')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="chatbubbles-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.forum', 'Forum')}</Text>
                <Text style={styles.cardDescription}>{t('explore.forumDescription', 'Know about others opinions, and share yours!')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Report Stray Cow Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('report')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="alert-circle-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.reportStrayCow', 'Report stray cow')}</Text>
                <Text style={styles.cardDescription}>{t('explore.helpHelpless', 'Help the helpless')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Marketplace Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('marketplace')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="basket-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('marketplace.title', 'Shop')}</Text>
                <Text style={styles.cardDescription}>{t('marketplace.description', 'Find Dairy products, services near you')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Network Card */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => navigateToSection('network')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={TILE_GRADIENT} style={styles.menuGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="map-outline" size={36} color={TEAL} />
                </View>
                <Text style={styles.cardTitle}>{t('explore.network', 'Network')}</Text>
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
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
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
});