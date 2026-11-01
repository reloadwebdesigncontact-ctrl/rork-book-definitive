import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { getLocales } from "expo-localization";
import { Language, translations, Translations } from "@/constants/translations";
import { logger } from "@/utils/logger";

// Mappe une locale système vers une langue supportée par l'app
function detectDeviceLanguage(): Language {
  try {
    const locales = getLocales();
    const code = locales?.[0]?.languageCode ?? 'fr';
    const supported: Language[] = ['fr', 'en', 'es', 'ar', 'pt', 'de', 'ja', 'zh', 'ru', 'ko', 'hi', 'it'];
    if (supported.includes(code as Language)) return code as Language;
    return 'en'; // fallback anglais pour les langues non supportées
  } catch {
    return 'fr';
  }
}

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('fr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem("language");
      if (storedLanguage !== null) {
        // L'utilisateur a déjà fait un choix explicite → on le respecte
        setLanguage(storedLanguage as Language);
      } else {
        // Premier lancement → on détecte la langue du téléphone
        const detected = detectDeviceLanguage();
        setLanguage(detected);
        // On sauvegarde pour que le choix auto soit persisté
        await AsyncStorage.setItem("language", detected);
      }
    } catch (error) {
      logger.error("Error loading language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem("language", newLanguage);
    } catch (error) {
      logger.error("Error saving language:", error);
    }
  };

  const t: Translations = translations[language];

  return {
    language,
    changeLanguage,
    t,
    isLoading,
  };
});

