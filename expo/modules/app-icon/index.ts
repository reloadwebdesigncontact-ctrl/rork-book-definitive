// Module Expo local pour le changement d'icône
// requireNativeModule est appelé en lazy pour éviter le crash au chargement

interface AppIconNativeModule {
  setActiveAlias(aliasName: string): boolean;
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
