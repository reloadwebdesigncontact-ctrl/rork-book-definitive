// Image de l'ours — une seule image chargée pour éviter les crashes
// Les variantes par thème seront ajoutées progressivement
const BEAR_DEFAULT = require('@/assets/images/assistant-bear/assistant-bear-orange.png');

export function getBearForTheme(_theme: string): number {
  return BEAR_DEFAULT;
}
