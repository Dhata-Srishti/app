import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface SOSConfig {
  name: string;
  helpline1: string;
  helpline2?: string;
}

interface SOSContextType {
  config: SOSConfig | null;
  setConfig: (config: SOSConfig | null) => Promise<void>;
  isConfigured: boolean;
  sendSOS: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const SOSContext = createContext<SOSContextType | undefined>(undefined);

const STORAGE_KEY = '@sos_config';

export function SOSProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SOSConfig | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedConfig !== null) {
          setConfigState(JSON.parse(storedConfig));
        }
      } catch (error) {
        console.error('Failed to load SOS config:', error);
      } finally {
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, []);

  const setConfig = async (newConfig: SOSConfig | null) => {
    try {
      if (newConfig === null) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setConfigState(null);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        setConfigState(newConfig);
      }
    } catch (error) {
      console.error('Failed to save SOS config:', error);
      Alert.alert('Error', 'Failed to save SOS configuration.');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    let locationPermissionGranted = false;

    console.log('Requesting Location Permission...');
    // Request Location Permission
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      console.log(`Location permission status: ${locationStatus}`);
      if (locationStatus === 'granted') {
        locationPermissionGranted = true;
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to send your location in an SOS message.');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Permission Error', 'An error occurred while requesting location permission.');
    }

    console.log('SMS permission request skipped as function is unavailable. Assuming system handles it.');
    // We will rely on the system to handle SMS permission when SMS.sendSMSAsync is called.
    let smsPermissionHandled = true; // Assume true for the purpose of proceeding

    console.log(`Permissions request complete. Location: ${locationPermissionGranted}, SMS handling assumed: ${smsPermissionHandled}`);
    // We only strictly require location permission for the SOS message content
    return locationPermissionGranted; // Only return location permission status
  };

  const sendSOS = async () => {
    if (!config) {
      Alert.alert('SOS Not Configured', 'Please set up your name and helpline numbers first.');
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.log('SOS permissions not granted.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const messageBody = `Emergency! My name is ${config.name}. I need help at location: https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
      
      const recipients = [config.helpline1, config.helpline2].filter(Boolean) as string[]; // Filter out undefined/null and ensure string type

      if (recipients.length === 0) {
           Alert.alert('Error', 'No valid helpline numbers configured.');
           return;
      }

      const { result } = await SMS.sendSMSAsync(recipients, messageBody);

      if (result === 'sent') {
        console.log('SOS message sent successfully!');
         Alert.alert('SOS Sent', 'Emergency message sent to your helpline numbers.');
      } else if (result === 'cancelled') {
         console.log('SOS message cancelled by user.');
      } else if (result === 'unknown'){
        console.log('SMS status unknown (Android behavior).');
         Alert.alert('SOS Status', 'Message sent to your phone\'s messaging app. Please check there.');
      }
       else {
        console.error('Failed to send SOS message:', result);
        Alert.alert('Error', `Failed to send SOS message. Status: ${result}`);
      }

    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'An error occurred while trying to send the SOS message.');
    }
  };

  const isConfigured = config !== null;

  if (!isConfigLoaded) {
     return null; // Or a loading indicator
  }

  return (
    <SOSContext.Provider value={{ config, setConfig, isConfigured, sendSOS, requestPermissions }}>
      {children}
    </SOSContext.Provider>
  );
}

export const useSOS = () => {
  const context = useContext(SOSContext);
  if (context === undefined) {
    throw new Error('useSOS must be used within an SOSProvider');
  }
  return context;
}; 