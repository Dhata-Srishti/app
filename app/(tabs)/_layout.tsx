import { AppHeader } from '@/components/AppHeader';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SOSOnboardingModal } from '@/components/SOSOnboardingModal';
import { SOSProvider, useSOS } from '@/context/SOSContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

function TabContent() {
  const { isConfigured } = useSOS();

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => (
            <AppHeader
              rightComponent={
                <LanguageSwitcher
                  buttonStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1,
                    borderColor: 'rgba(93, 64, 55, 0.2)',
                  }}
                />
              }
            />
          ),
          tabBarActiveTintColor: '#f57f17',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Schemes',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'gift' : 'gift-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="network"
          options={{
            title: 'Transport',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'bus' : 'bus-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      <SOSOnboardingModal
        isVisible={!isConfigured}
        onClose={() => {}}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <SOSProvider>
      <TabContent />
    </SOSProvider>
  );
}
