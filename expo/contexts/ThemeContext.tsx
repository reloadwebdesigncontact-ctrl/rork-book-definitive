import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import { APP_THEMES, AppTheme, ColorPalette } from "@/constants/appThemes";
import { logger } from "@/utils/logger";

// Notifie le widget Android du nouveau thème via SharedPreferences + broadcast
function notifyWidget(themeName: string) {
  if (Platform.OS !== 'android') return;
  try {
    const { WidgetThemeModule } = NativeModules;
    if (WidgetThemeModule?.saveThemeName) {
      WidgetThemeModule.saveThemeName(themeName);
    }
  } catch {
    // Silencieux
  }
}

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('orange');
  const [animatedBackground, setAnimatedBackground] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedMode = await AsyncStorage.getItem("theme");
      const storedAppTheme = await AsyncStorage.getItem("appTheme");

      if (storedMode !== null) {
        setIsDarkMode(storedMode === "dark");
      }
      if (storedAppTheme !== null) {
        setAppTheme(storedAppTheme as AppTheme);
        notifyWidget(storedAppTheme);
      }
    } catch (error) {
      logger.error("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    } catch (error) {
      logger.error("Error saving theme:", error);
    }
  };

  const changeAppTheme = async (theme: AppTheme) => {
    setAppTheme(theme);
    try {
      await AsyncStorage.setItem("appTheme", theme);
      notifyWidget(theme);
    } catch (error) {
      logger.error("Error saving app theme:", error);
    }
  };

  const toggleAnimatedBackground = async () => {
    // Le fond animé est toujours actif
  };

  const colors: ColorPalette = APP_THEMES[appTheme];

  return {
    isDarkMode,
    toggleTheme,
    appTheme,
    changeAppTheme,
    colors,
    isLoading,
    animatedBackground,
    toggleAnimatedBackground,
  };
});
