import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Language, translations, Translations } from "@/constants/translations";
import { logger } from "@/utils/logger";

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
        setLanguage(storedLanguage as Language);
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

