import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface AppHeaderProps {
  showBackButton?: boolean;
  title?: string;
  rightComponent?: React.ReactNode;
}

export function AppHeader({ showBackButton = false, title, rightComponent }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff1de" />
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/dhata.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        
        {title && (
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
        )}

        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff1de',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 120,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#5D4037',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
}); 