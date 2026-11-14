// Module Expo local — synchronise le thème vers le widget Android via SharedPreferences

interface WidgetThemeNativeModule {
  saveThemeColors(gradient0: string, gradient1: string, gradient2: string): boolean;
  saveThemeName(themeName: string): boolean;
}

let _module: WidgetThemeNativeModule | null = null;

function getModule(): WidgetThemeNativeModule | null {
  if (_module !== null) return _module;
  try {
    const { requireNativeModule } = require('expo-modules-core');
    _module = requireNativeModule<WidgetThemeNativeModule>('WidgetThemeModule');
    return _module;
  } catch {
    return null;
  }
}

export function saveThemeColors(gradient0: string, gradient1: string, gradient2: string): boolean {
  const mod = getModule();
  if (!mod) return false;
  try { return mod.saveThemeColors(gradient0, gradient1, gradient2); } catch { return false; }
}

// Méthode principale : envoie juste le nom du thème, les couleurs sont résolues côté Kotlin
export function saveThemeName(themeName: string): boolean {
  const mod = getModule();
  if (!mod) return false;
  try { return mod.saveThemeName(themeName); } catch { return false; }
}
