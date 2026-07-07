import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'scan_history_v1';
const MAX_HISTORY = 50;
const MAX_TITLE_LENGTH = 500;
const MAX_AUTHOR_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 50_000;
const MAX_URL_LENGTH = 2048;

export interface HistoryEntry {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  summary?: string;
  scannedAt: string; // ISO date
}

// Sanitise une chaîne : tronque et nettoie les caractères de contrôle
function sanitizeString(str: string | undefined, maxLen: number): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen).trim();
}

// Valide qu'une URL est bien une URL https ou un data URL base64
function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed.slice(0, MAX_URL_LENGTH);
  }
  return undefined; // Rejette les URLs http:// ou non reconnues
}

function isValidEntry(entry: unknown): entry is HistoryEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.title === 'string' &&
    typeof e.author === 'string' &&
    typeof e.scannedAt === 'string'
  );
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    // Filtre les entrées invalides
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export async function addToHistory(
  entry: Omit<HistoryEntry, 'id' | 'scannedAt'>
): Promise<void> {
  try {
    // Sanitisation de toutes les entrées avant stockage
    const safeTitle = sanitizeString(entry.title, MAX_TITLE_LENGTH);
    const safeAuthor = sanitizeString(entry.author, MAX_AUTHOR_LENGTH);
    const safeSummary = sanitizeString(entry.summary, MAX_SUMMARY_LENGTH);
    const safeCoverUrl = sanitizeUrl(entry.coverUrl);

    if (!safeTitle) return; // N'enregistre pas si pas de titre

    const history = await getHistory();
    // Évite les doublons sur le même titre+auteur
    const filtered = history.filter(
      (h) => !(h.title === safeTitle && h.author === safeAuthor)
    );
    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: safeTitle,
      author: safeAuthor,
      coverUrl: safeCoverUrl,
      summary: safeSummary || undefined,
      scannedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail — ne jamais crasher sur une erreur de stockage
  }
}

export async function removeFromHistory(id: string): Promise<void> {
  try {
    if (!id || typeof id !== 'string') return;
    const history = await getHistory();
    const updated = history.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // silently fail
  }
}
