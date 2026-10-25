export type AppTheme = 'orange' | 'red' | 'purple' | 'turquoise' | 'pink' | 'yellow' | 'coral' | 'lime' | 'sunset' | 'dreamy' | 'neon' | 'flamingo' | 'aurora' | 'ocean' | 'silver' | 'gold' | 'tropical' | 'peach' | 'velvet' | 'glacier' | 'galaxy' | 'tartan' | 'holo' | 'arctic' | 'lagoon' | 'dev_logo' | 'og_orange';

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
    primary: '#FF6B35',
    secondary: '#F44771',
    tertiary: '#FF8C5A',
    gradient: ['#FFA726', '#FF6B35', '#F44771'] as const,
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
    primary: '#C4845A',
    secondary: '#D4906A',
    tertiary: '#E4A880',
    gradient: ['#C4845A', '#D4906A', '#E4A880'] as const,
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
    primary: '#4158D0',
    secondary: '#C850C0',
    tertiary: '#F64F8B',
    gradient: ['#4158D0', '#C850C0', '#F64F8B'] as const,
    icon: `${BASE}/tropical.png`,
  },
  peach: {
    primary: '#F06292',
    secondary: '#FF8A65',
    tertiary: '#FFBB6C',
    gradient: ['#FFBB6C', '#FF8A65', '#F06292'] as const,
    icon: `${BASE}/peach.png`,
  },
  velvet: {
    primary: '#B5294E',
    secondary: '#D44B70',
    tertiary: '#E87090',
    gradient: ['#B5294E', '#D44B70', '#E87090'] as const,
    icon: `${BASE}/velvet.png`,
  },
  glacier: {
    primary: '#00B4D8',
    secondary: '#00D4FF',
    tertiary: '#90E8FF',
    gradient: ['#00B4D8', '#00D4FF', '#90E8FF'] as const,
    icon: `${BASE}/glacier.png`,
  },
  galaxy: {
    primary: '#6B35E8',
    secondary: '#9B5FFF',
    tertiary: '#C89FFF',
    gradient: ['#6B35E8', '#9B5FFF', '#C89FFF'] as const,
    icon: `${BASE}/galaxy.png`,
  },
  tartan: {
    primary: '#CC1A1A',
    secondary: '#E03030',
    tertiary: '#F05050',
    gradient: ['#CC1A1A', '#E03030', '#F05050'] as const,
    icon: `${BASE}/tartan.png`,
  },
  holo: {
    primary: '#9B7FE8',
    secondary: '#B8A9E8',
    tertiary: '#D4CCF5',
    gradient: ['#9B7FE8', '#B8A9E8', '#D4CCF5'] as const,
    icon: `${BASE}/holo.png`,
  },
  arctic: {
    primary: '#7B35E8',
    secondary: '#5B5FFF',
    tertiary: '#00D4FF',
    gradient: ['#7B35E8', '#5B5FFF', '#00D4FF'] as const,
    icon: `${BASE}/arctic.png`,
  },
  lagoon: {
    primary: '#0097B2',
    secondary: '#00B4D8',
    tertiary: '#48CAE4',
    gradient: ['#0097B2', '#00B4D8', '#48CAE4'] as const,
    icon: `${BASE}/lagoon.png`,
  },
  dev_logo: {
    primary: '#F97C3C',
    secondary: '#FB8C00',
    tertiary: '#FFA040',
    gradient: ['#F97C3C', '#FB8C00', '#FFA040'] as const,
    icon: `${BASE}/dev_logo.png`,
  },
  og_orange: {
    primary: '#FF5200',
    secondary: '#FF6A00',
    tertiary: '#FF8533',
    gradient: ['#FF5200', '#FF6A00', '#FF8533'] as const,
    icon: `${BASE}/og_orange.png`,
  },
};
