import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/en.json';
import kn from '@/i18n/kn.json';

// Language configuration
export const LANGUAGE_STORAGE_KEY = '@app_language';
export const DEFAULT_LANGUAGE = 'en';

export const languageNames = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
} as const;

export type LanguageCode = keyof typeof languageNames;

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      kn: { translation: kn },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Get the initial language
export const getInitialLanguage = async (): Promise<LanguageCode> => {
  try {
    // Try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && savedLanguage in languageNames) {
      return savedLanguage as LanguageCode;
    }

    // Get device language
    const deviceLanguage = Localization.locale?.split('-')[0] || DEFAULT_LANGUAGE;
    if (deviceLanguage in languageNames) {
      return deviceLanguage as LanguageCode;
    }

    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error getting initial language:', error);
    return DEFAULT_LANGUAGE;
  }
};

// Set language
export const setLanguage = async (languageCode: LanguageCode): Promise<boolean> => {
  try {
    if (!(languageCode in languageNames)) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
    return true;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = (): LanguageCode => {
  const currentLang = i18n.language;
  return (currentLang in languageNames) ? currentLang as LanguageCode : DEFAULT_LANGUAGE;
};

// Initialize language on app start
getInitialLanguage().then((lang) => {
  i18n.changeLanguage(lang).catch((error) => {
    console.error('Error setting initial language:', error);
  });
});

export default i18n; 