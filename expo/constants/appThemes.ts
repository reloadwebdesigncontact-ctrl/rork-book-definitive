export type AppTheme = 'orange' | 'red' | 'purple' | 'turquoise' | 'pink' | 'yellow' | 'coral' | 'lime' | 'sunset' | 'dreamy' | 'neon' | 'flamingo' | 'aurora' | 'ocean';

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  gradient: readonly [string, string, string];
  icon: string;
}

export const APP_THEMES: Record<AppTheme, ColorPalette> = {
  orange: {
    primary: '#FF6B35',
    secondary: '#FF8C42',
    tertiary: '#FFA07A',
    gradient: ['#FF6B35', '#FF8C42', '#FFA07A'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uwd6i5dvvv735zh2rkdgh',
  },
  red: {
    primary: '#FF3B3B',
    secondary: '#FF5C5C',
    tertiary: '#FF7A7A',
    gradient: ['#FF3B3B', '#FF5C5C', '#FF7A7A'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cirfkl92wc226o4ojx0ml',
  },
  purple: {
    primary: '#7C3AED',
    secondary: '#9061F9',
    tertiary: '#A78BFA',
    gradient: ['#7C3AED', '#9061F9', '#A78BFA'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7hjyk0r579i5fce2pcfpe',
  },
  turquoise: {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    tertiary: '#67E8F9',
    gradient: ['#06B6D4', '#22D3EE', '#67E8F9'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/racmmj34q8p49l1zd8npu',
  },
  pink: {
    primary: '#FF69B4',
    secondary: '#FF8FCE',
    tertiary: '#FFB6E0',
    gradient: ['#FF69B4', '#FF8FCE', '#FFB6E0'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5glivuhp3fya0is72xhqh',
  },
  yellow: {
    primary: '#FDB927',
    secondary: '#FDC84A',
    tertiary: '#FDDD7F',
    gradient: ['#FDB927', '#FDC84A', '#FDDD7F'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cq7bjj57csq48ehkupdhv',
  },
  coral: {
    primary: '#D88F6A',
    secondary: '#E0A882',
    tertiary: '#E8C1A5',
    gradient: ['#D88F6A', '#E0A882', '#E8C1A5'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fg16bjzcbisbm16f7i9fw',
  },
  lime: {
    primary: '#A4B838',
    secondary: '#B5C855',
    tertiary: '#C6D87A',
    gradient: ['#A4B838', '#B5C855', '#C6D87A'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/z6mufl2x6oz79byq6pstn',
  },
  sunset: {
    primary: '#FF5A5F',
    secondary: '#FF8A3D',
    tertiary: '#FFD0B2',
    gradient: ['#EA4C89', '#FF5A5F', '#FFB347'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/093iq745793vhhfqpm43c',
  },
  dreamy: {
    primary: '#F98A97',
    secondary: '#B499FF',
    tertiary: '#7EA5FF',
    gradient: ['#F98A97', '#C6AFEC', '#7EA5FF'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vkdo86p2qwci69aosht0m',
  },
  neon: {
    primary: '#39FF14',
    secondary: '#AAFF00',
    tertiary: '#CCFF00',
    gradient: ['#39FF14', '#AAFF00', '#CCFF00'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/z6mufl2x6oz79byq6pstn',
  },
  flamingo: {
    primary: '#FF3D8B',
    secondary: '#FF6B6B',
    tertiary: '#FF8C42',
    gradient: ['#FF3D8B', '#FF6B6B', '#FF8C42'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5glivuhp3fya0is72xhqh',
  },
  aurora: {
    primary: '#FFA500',
    secondary: '#E879A0',
    tertiary: '#C084FC',
    gradient: ['#FFA500', '#E879A0', '#C084FC'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/093iq745793vhhfqpm43c',
  },
  ocean: {
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    tertiary: '#A8E6CF',
    gradient: ['#0EA5E9', '#06B6D4', '#A8E6CF'] as const,
    icon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/racmmj34q8p49l1zd8npu',
  },
};
