import { AppHeader } from '@/components/AppHeader';
import { SOSOnboardingModal } from '@/components/SOSOnboardingModal';
import { TabChatbotButton } from '@/components/TabChatbotButton';
import { SOSProvider, useSOS } from '@/context/SOSContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

function TabContent() {
  const { isConfigured } = useSOS();

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <AppHeader />,
          tabBarStyle: {
            backgroundColor: '#fff1de',
            borderTopColor: 'rgba(0,0,0,0.1)',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#f57f17',
          tabBarInactiveTintColor: '#5D4037',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            title: 'Forum',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarButton: (props) => <TabChatbotButton {...props} />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="basket" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="network"
          options={{
            title: 'Network',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
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
