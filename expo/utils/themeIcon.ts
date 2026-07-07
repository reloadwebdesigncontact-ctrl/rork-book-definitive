import type { ImageSource } from "expo-image";
import type { ThemeIconSource } from "@/constants/appThemes";
import { LOCAL_ICONS } from "@/utils/localIcons";

export function resolveThemeIcon(icon: ThemeIconSource, themeKey?: string): ImageSource {
  // Utilise l'icône locale si disponible (priorité sur les URLs distantes)
  if (themeKey && LOCAL_ICONS[themeKey]) {
    return LOCAL_ICONS[themeKey] as ImageSource;
  }
  if (typeof icon === "string") {
    return { uri: icon };
  }
  return icon as ImageSource;
}
