import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { logger } from './logger';
import { setAppIcon, getAppIcon } from 'expo-dynamic-app-icon';

const APP_ICON_KEY = 'selected_app_icon';

export const ICON_OPTIONS = [
  { key: 'orange',    label: 'Orange' },
  { key: 'red',       label: 'Red' },
  { key: 'purple',    label: 'Purple' },
  { key: 'turquoise', label: 'Turquoise' },
  { key: 'pink',      label: 'Pink' },
  { key: 'yellow',    label: 'Yellow' },
  { key: 'coral',     label: 'Coral' },
  { key: 'lime',      label: 'Lime' },
  { key: 'sunset',    label: 'Sunset' },
  { key: 'dreamy',    label: 'Dreamy' },
  { key: 'neon',      label: 'Neon' },
  { key: 'flamingo',  label: 'Flamingo' },
  { key: 'aurora',    label: 'Aurora' },
  { key: 'ocean',     label: 'Ocean' },
  { key: 'silver',    label: 'Silver' },
  { key: 'gold',      label: 'Gold' },
  { key: 'tropical',  label: 'Tropical' },
  { key: 'peach',     label: 'Peach' },
  { key: 'velvet',    label: 'Velvet' },
  { key: 'glacier',   label: 'Glacier' },
  { key: 'galaxy',    label: 'Galaxy' },
  { key: 'tartan',    label: 'Tartan' },
  { key: 'holo',      label: 'Holo' },
  { key: 'arctic',    label: 'Arctic' },
  { key: 'lagoon',    label: 'Lagoon' },
  { key: 'teddy-purple', label: 'Teddy Purple' },
  { key: 'teddy-blue',   label: 'Teddy Blue' },
  { key: 'teddy-peach',  label: 'Teddy Peach' },
  { key: 'dev-logo',     label: 'Logo du développement' },
  { key: 'og-orange',    label: 'OG Logo Orange' },
] as const;

export type AppIconKey = typeof ICON_OPTIONS[number]['key'];

export const ICON_PREVIEWS: Record<AppIconKey, ReturnType<typeof require>> = {
  orange:    require('@/assets/images/icon.png'),
  red:       require('@/assets/images/red.png'),
  purple:    require('@/assets/images/purple.png'),
  turquoise: require('@/assets/images/turquoise.png'),
  pink:      require('@/assets/images/pink.png'),
  yellow:    require('@/assets/images/yellow.png'),
  coral:     require('@/assets/images/coral.png'),
  lime:      require('@/assets/images/lime.png'),
  sunset:    require('@/assets/images/sunset.png'),
  dreamy:    require('@/assets/images/dreamy.png'),
  neon:      require('@/assets/images/neon.png'),
  flamingo:  require('@/assets/images/flamingo.png'),
  aurora:    require('@/assets/images/aurora.png'),
  ocean:     require('@/assets/images/ocean.png'),
  silver:    require('@/assets/images/silver.png'),
  gold:      require('@/assets/images/gold.png'),
  tropical:  require('@/assets/images/tropical.png'),
  peach:     require('@/assets/images/peach.png'),
  velvet:    require('@/assets/images/velvet.png'),
  glacier:   require('@/assets/images/glacier.png'),
  galaxy:    require('@/assets/images/galaxy.png'),
  tartan:    require('@/assets/images/tartan.png'),
  holo:      require('@/assets/images/holo.png'),
  arctic:    require('@/assets/images/arctic.png'),
  lagoon:    require('@/assets/images/lagoon.png'),
  'teddy-purple': require('@/assets/images/teddy-purple.png'),
  'teddy-blue':   require('@/assets/images/teddy-blue.png'),
  'teddy-peach':  require('@/assets/images/teddy-peach.png'),
  'dev-logo':     require('@/assets/images/dev-logo.png'),
  'og-orange':    require('@/assets/images/og-orange.png'),
};

export async function getSavedIcon(): Promise<AppIconKey> {
  try {
    // expo-dynamic-app-icon retourne le nom de l'icône active
    const current = getAppIcon();
    if (current && current !== 'DEFAULT') {
      return current as AppIconKey;
    }
    const saved = await AsyncStorage.getItem(APP_ICON_KEY);
    return (saved as AppIconKey) || 'orange';
  } catch {
    return 'orange';
  }
}

export async function changeAppIcon(iconKey: AppIconKey): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    // Sauvegarder d'abord en AsyncStorage
    await AsyncStorage.setItem(APP_ICON_KEY, iconKey);

    // Appeler setAppIcon — Android va redémarrer l'app automatiquement
    const result = setAppIcon(iconKey);

    if (result === false) {
      logger.error('[AppIcon] setAppIcon returned false for:', iconKey);
    }

    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[AppIcon] Error:', msg);
    return false;
  }
}
