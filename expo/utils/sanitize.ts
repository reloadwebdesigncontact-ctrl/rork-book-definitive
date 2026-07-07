/**
 * Utilitaires de sanitisation des données — OWASP A03 Injection Prevention
 * Utilisé pour nettoyer toutes les données externes avant affichage ou stockage.
 */

/** Caractères de contrôle dangereux (hors \n, \r, \t) */
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitise une chaîne de texte :
 * - Supprime les caractères de contrôle
 * - Tronque à maxLength
 * - Trim
 */
export function sanitizeText(
  input: unknown,
  maxLength = 10_000
): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS_REGEX, '')
    .slice(0, maxLength)
    .trim();
}

/**
 * Valide et sanitise une URL :
 * - N'accepte que https:// et data:image/
 * - Tronque à 2048 caractères
 */
export function sanitizeUrl(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const url = input.trim();
  if (url.startsWith('https://') || url.startsWith('data:image/')) {
    return url.slice(0, 2048);
  }
  return undefined;
}

/**
 * Sanitise un texte qui sera affiché dans l'UI.
 * Supprime aussi les séquences ANSI/escape.
 */
export function sanitizeDisplayText(
  input: unknown,
  maxLength = 50_000
): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(/\x1B\[[0-9;]*m/g, '') // ANSI escape sequences
    .replace(/\*/g, '')              // Markdown bold (utilisé dans l'app)
    .slice(0, maxLength)
    .trim();
}

/**
 * Valide qu'un string est un ID sûr (alphanumérique + tirets)
 */
export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9\-_]{1,100}$/.test(id);
}

/**
 * Sanitise la réponse de l'IA avant affichage
 */
export function sanitizeAiResponse(input: unknown): string {
  return sanitizeDisplayText(input, 100_000);
}
