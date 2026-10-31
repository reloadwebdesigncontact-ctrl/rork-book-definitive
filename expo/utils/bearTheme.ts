/**
 * Mappe un appTheme vers le nom d'ours disponible sur GitHub.
 * Les thèmes sans ours dédié utilisent l'ours le plus proche.
 */
const BEAR_FALLBACK: Record<string, string> = {
  // Nouveaux thèmes logos → ours orange
  og_orange: 'orange',
  dev_logo:  'orange',
  // Nouveaux thèmes teddy → ours de couleur proche
  teddy_purple: 'purple',
  teddy_blue:   'turquoise',
  teddy_peach:  'peach',
};

export function getBearTheme(appTheme: string): string {
  return BEAR_FALLBACK[appTheme] ?? appTheme;
}
