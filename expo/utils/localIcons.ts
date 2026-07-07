/**
 * Map des icônes locales pour les thèmes dont l'icône n'est pas accessible via URL distante.
 * Les autres thèmes utilisent des URLs CDN dans appThemes.ts.
 */
export const LOCAL_ICONS: Record<string, ReturnType<typeof require>> = {
  silver: require('@/assets/images/silver.png'),
  gold: require('@/assets/images/gold.png'),
  neon: require('@/assets/images/neon.png'),
  flamingo: require('@/assets/images/flamingo.png'),
  aurora: require('@/assets/images/aurora.png'),
  ocean: require('@/assets/images/ocean.png'),
};
