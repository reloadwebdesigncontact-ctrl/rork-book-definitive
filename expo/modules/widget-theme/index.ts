// Module Expo local — synchronise les couleurs du thème vers le widget Android
// via SharedPreferences (accessible depuis Kotlin sans pont JS)

interface WidgetThemeNativeModule {
  saveThemeColors(gradient0: string, gradient1: string, gradient2: string): boolean;
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
  if (!mod) return false; // silencieux sur iOS ou si le module n'est pas dispo
  try {
    return mod.saveThemeColors(gradient0, gradient1, gradient2);
  } catch {
    return false;
  }
}
