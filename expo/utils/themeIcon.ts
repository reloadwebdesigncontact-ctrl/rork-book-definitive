import type { ImageSource } from "expo-image";
import type { ThemeIconSource } from "@/constants/appThemes";

export function resolveThemeIcon(icon: ThemeIconSource): ImageSource {
  if (typeof icon === "string") {
    return { uri: icon };
  }
  return icon as ImageSource;
}
