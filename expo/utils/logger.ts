/**
 * Logger sécurisé — les logs sont désactivés en production.
 * En prod on ne veut pas exposer d'infos techniques dans la console.
 */
const IS_DEV = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (IS_DEV) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (IS_DEV) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Les erreurs critiques sont toujours loggées (utile pour Sentry/crashlytics si ajouté plus tard)
    if (IS_DEV) console.error(...args);
  },
};
