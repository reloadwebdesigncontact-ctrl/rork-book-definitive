import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { APP_THEMES, AppTheme, ColorPalette } from "@/constants/appThemes";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('orange');
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
      }
    } catch (error) {
      console.error("Error loading theme:", error);
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
      console.error("Error saving theme:", error);
    }
  };

  const changeAppTheme = async (theme: AppTheme) => {
    setAppTheme(theme);
    try {
      await AsyncStorage.setItem("appTheme", theme);
    } catch (error) {
      console.error("Error saving app theme:", error);
    }
  };

  const colors: ColorPalette = APP_THEMES[appTheme];

  return {
    isDarkMode,
    toggleTheme,
    appTheme,
    changeAppTheme,
    colors,
    isLoading,
  };
});
