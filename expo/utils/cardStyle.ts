/**
 * Retourne les styles d'ombre/elevation adaptés au mode sombre.
 * En mode sombre sur Android, elevation=0 évite la démarcation Material.
 */
export function cardShadow(isDarkMode: boolean, elevation = 3) {
  if (isDarkMode) {
    return {
      shadowOpacity: 0,
      elevation: 0,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation,
  };
}
