// Toutes les images de l'ours chargées statiquement
// Ce fichier centralise les require pour éviter les crashes au chargement

export const BEAR_IMAGES = {
  orange:    require('@/assets/images/assistant-bear/assistant-bear-orange.png'),
  red:       require('@/assets/images/assistant-bear/assistant-bear-red.png'),
  purple:    require('@/assets/images/assistant-bear/assistant-bear-purple.png'),
  turquoise: require('@/assets/images/assistant-bear/assistant-bear-turquoise.png'),
  pink:      require('@/assets/images/assistant-bear/assistant-bear-pink.png'),
  yellow:    require('@/assets/images/assistant-bear/assistant-bear-yellow.png'),
  coral:     require('@/assets/images/assistant-bear/assistant-bear-coral.png'),
  lime:      require('@/assets/images/assistant-bear/assistant-bear-lime.png'),
  sunset:    require('@/assets/images/assistant-bear/assistant-bear-sunset.png'),
  dreamy:    require('@/assets/images/assistant-bear/assistant-bear-dreamy.png'),
  neon:      require('@/assets/images/assistant-bear/assistant-bear-neon.png'),
  flamingo:  require('@/assets/images/assistant-bear/assistant-bear-flamingo.png'),
  aurora:    require('@/assets/images/assistant-bear/assistant-bear-aurora.png'),
  ocean:     require('@/assets/images/assistant-bear/assistant-bear-ocean.png'),
  silver:    require('@/assets/images/assistant-bear/assistant-bear-silver.png'),
  gold:      require('@/assets/images/assistant-bear/assistant-bear-gold.png'),
  tropical:  require('@/assets/images/assistant-bear/assistant-bear-tropical.png'),
  peach:     require('@/assets/images/assistant-bear/assistant-bear-peach.png'),
} as const;

export type BearThemeKey = keyof typeof BEAR_IMAGES;

export function getBearForTheme(theme: string): ReturnType<typeof require> {
  return (BEAR_IMAGES as Record<string, ReturnType<typeof require>>)[theme]
    ?? BEAR_IMAGES.orange;
}
