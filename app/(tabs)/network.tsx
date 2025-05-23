import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function NetworkScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t('explore.network', 'Network')}</ThemedText>
      <ThemedText>{t('explore.networkDescription', 'Find Cows near you')}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 