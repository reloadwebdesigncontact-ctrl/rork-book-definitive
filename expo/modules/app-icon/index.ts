// Module Expo local pour le changement d'icône et la synchronisation du thème widget
// requireNativeModule est appelé en lazy pour éviter le crash au chargement

interface AppIconNativeModule {
  setActiveAlias(aliasName: string): boolean;
  saveThemeName(themeName: string): boolean;
}

let _module: AppIconNativeModule | null = null;

function getModule(): AppIconNativeModule | null {
  if (_module !== null) return _module;
  try {
    const { requireNativeModule } = require('expo-modules-core');
    _module = requireNativeModule<AppIconNativeModule>('AppIconModule');
    return _module;
  } catch {
    return null;
  }
}

export function setActiveAlias(aliasName: string): boolean {
  const mod = getModule();
  if (!mod) throw new Error('AppIconModule not available');
  return mod.setActiveAlias(aliasName);
}

export function saveThemeName(themeName: string): boolean {
  const mod = getModule();
  if (!mod) return false;
  try {
    return mod.saveThemeName(themeName);
  } catch {
    return false;
  }
}
