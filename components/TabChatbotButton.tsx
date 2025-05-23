import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function TabChatbotButton({ onPress, ...props }: BottomTabBarButtonProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fdbb65', '#f9a825', '#f57f17']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    marginTop: -20,
    alignItems: 'center',
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
  },
  button: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: '#fff1de',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 