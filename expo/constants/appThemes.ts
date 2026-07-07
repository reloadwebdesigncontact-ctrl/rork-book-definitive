export type AppTheme = 'orange' | 'red' | 'purple' | 'turquoise' | 'pink' | 'yellow' | 'coral' | 'lime' | 'sunset' | 'dreamy' | 'neon' | 'flamingo' | 'aurora' | 'ocean' | 'silver' | 'gold' | 'tropical';

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  gradient: readonly [string, string, string];
  icon: string;
}

const BASE = 'https://raw.githubusercontent.com/reloadwebdesigncontact-ctrl/rork-book-definitive/master/expo/assets/images';

export const APP_THEMES: Record<AppTheme, ColorPalette> = {
  orange: {
    primary: '#FF8C00',
    secondary: '#FFA030',
    tertiary: '#FFB860',
    gradient: ['#FF8C00', '#FFA030', '#FFB860'] as const,
    icon: `${BASE}/icon.png`,
  },
  red: {
    primary: '#FF4444',
    secondary: '#FF6B6B',
    tertiary: '#FF9999',
    gradient: ['#FF4444', '#FF6B6B', '#FF9999'] as const,
    icon: `${BASE}/red.png`,
  },
  purple: {
    primary: '#7B2FBE',
    secondary: '#9B4DCA',
    tertiary: '#B06AE8',
    gradient: ['#7B2FBE', '#9B4DCA', '#B06AE8'] as const,
    icon: `${BASE}/purple.png`,
  },
  turquoise: {
    primary: '#00C9FF',
    secondary: '#22D3EE',
    tertiary: '#67E8F9',
    gradient: ['#00C9FF', '#22D3EE', '#67E8F9'] as const,
    icon: `${BASE}/turquoise.png`,
  },
  pink: {
    primary: '#FF3DA8',
    secondary: '#FF69B4',
    tertiary: '#FF8FCE',
    gradient: ['#FF3DA8', '#FF69B4', '#FF8FCE'] as const,
    icon: `${BASE}/pink.png`,
  },
  yellow: {
    primary: '#FFE55A',
    secondary: '#FFED7A',
    tertiary: '#FFF59D',
    gradient: ['#FFE55A', '#FFED7A', '#FFF59D'] as const,
    icon: `${BASE}/yellow.png`,
  },
  coral: {
    primary: '#A0522D',
    secondary: '#B8632A',
    tertiary: '#CD853F',
    gradient: ['#A0522D', '#B8632A', '#CD853F'] as const,
    icon: `${BASE}/coral.png`,
  },
  lime: {
    primary: '#A8E063',
    secondary: '#BEF77A',
    tertiary: '#D4FF99',
    gradient: ['#A8E063', '#BEF77A', '#D4FF99'] as const,
    icon: `${BASE}/lime.png`,
  },
  sunset: {
    primary: '#FF5A8A',
    secondary: '#FF7A5A',
    tertiary: '#FF9566',
    gradient: ['#FF5A8A', '#FF6B4A', '#FF9566'] as const,
    icon: `${BASE}/sunset.png`,
  },
  dreamy: {
    primary: '#C9748F',
    secondary: '#A98BC4',
    tertiary: '#8BA6D8',
    gradient: ['#C9748F', '#A98BC4', '#8BA6D8'] as const,
    icon: `${BASE}/dreamy.png`,
  },
  neon: {
    primary: '#39FF14',
    secondary: '#AAFF00',
    tertiary: '#00E5FF',
    gradient: ['#39FF14', '#AAFF00', '#00E5FF'] as const,
    icon: `${BASE}/neon.png`,
  },
  flamingo: {
    primary: '#E84393',
    secondary: '#FF6B6B',
    tertiary: '#FF8C42',
    gradient: ['#E84393', '#FF6B6B', '#FF8C42'] as const,
    icon: `${BASE}/flamingo.png`,
  },
  aurora: {
    primary: '#FF9A3C',
    secondary: '#E879A0',
    tertiary: '#D06ECC',
    gradient: ['#FF9A3C', '#E879A0', '#D06ECC'] as const,
    icon: `${BASE}/aurora.png`,
  },
  ocean: {
    primary: '#2E8B9A',
    secondary: '#4CBECC',
    tertiary: '#A8E6CF',
    gradient: ['#2E8B9A', '#4CBECC', '#A8E6CF'] as const,
    icon: `${BASE}/ocean.png`,
  },
  silver: {
    primary: '#9E9E9E',
    secondary: '#BDBDBD',
    tertiary: '#E0E0E0',
    gradient: ['#757575', '#9E9E9E', '#E0E0E0'] as const,
    icon: `${BASE}/silver.png`,
  },
  gold: {
    primary: '#C9962A',
    secondary: '#D4A017',
    tertiary: '#F5D77E',
    gradient: ['#B8860B', '#C9962A', '#F5D77E'] as const,
    icon: `${BASE}/gold.png`,
  },
  tropical: {
    primary: '#C850C0',
    secondary: '#F64F59',
    tertiary: '#FFCC70',
    gradient: ['#4158D0', '#C850C0', '#FFCC70'] as const,
    icon: `${BASE}/tropical.png`,
  },
};
