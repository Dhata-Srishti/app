import { AppHeader } from '@/components/AppHeader';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SOSOnboardingModal } from '@/components/SOSOnboardingModal';
import { SOSProvider, useSOS } from '@/context/SOSContext';
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
          tabBarStyle: { display: 'none' },
          tabBarButton: () => null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            title: 'Forum',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Shop',
          }}
        />
        <Tabs.Screen
          name="bus"
          options={{
            title: 'Bus',
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
