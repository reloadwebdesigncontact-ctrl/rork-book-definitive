import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/utils/logger';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Clés de stockage
const FREE_STORAGE_KEY    = 'scan_limit_state_v1';      // limite journalière gratuits
const PREMIUM_STORAGE_KEY = 'scan_limit_premium_v1';    // limite mensuelle premium

// Limites
export const FREE_DAILY_SCAN_LIMIT    = 3;   // 3 scans/jour pour les gratuits
export const MONTHLY_LIMIT_MONTHLY    = 50;  // plan mensuel 4,99€
export const MONTHLY_LIMIT_ANNUAL     = 30;  // plan annuel
export const MONTHLY_LIMIT_LIFETIME   = 30;  // lifetime

// --- Utilitaires ---

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// --- Types ---

interface FreeScanState {
  date: string;
  count: number;
}

interface PremiumScanState {
  month: string;
  count: number;
}

// --- Context ---

export const [ScanLimitProvider, useScanLimit] = createContextHook(() => {
  const { isPremium, premiumPlan } = useSubscription();

  // Gratuits — état journalier
  const [freeState, setFreeState] = useState<FreeScanState>({ date: todayKey(), count: 0 });
  // Premium — état mensuel
  const [premiumState, setPremiumState] = useState<PremiumScanState>({ month: monthKey(), count: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Chargement initial
  useEffect(() => {
    const load = async () => {
      try {
        // Gratuits
        const rawFree = await AsyncStorage.getItem(FREE_STORAGE_KEY);
        if (rawFree) {
          const parsed = JSON.parse(rawFree) as FreeScanState;
          const today = todayKey();
          setFreeState(parsed.date === today ? parsed : { date: today, count: 0 });
        }

        // Premium mensuel
        const rawPremium = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (rawPremium) {
          const parsed = JSON.parse(rawPremium) as PremiumScanState;
          const month = monthKey();
          setPremiumState(parsed.month === month ? parsed : { month, count: 0 });
        }
      } catch (error) {
        logger.error('Error loading scan limit:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  // Persistance
  const persistFree = useCallback(async (next: FreeScanState) => {
    try { await AsyncStorage.setItem(FREE_STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { logger.error('Error saving free scan limit:', e); }
  }, []);

  const persistPremium = useCallback(async (next: PremiumScanState) => {
    try { await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { logger.error('Error saving premium scan limit:', e); }
  }, []);

  // Incrément
  const incrementScan = useCallback(() => {
    if (isPremium) {
      const month = monthKey();
      setPremiumState(prev => {
        const base = prev.month === month ? prev : { month, count: 0 };
        const next = { month, count: base.count + 1 };
        void persistPremium(next);
        logger.log('[ScanLimit] Premium scan count:', next.count);
        return next;
      });
    } else {
      const today = todayKey();
      setFreeState(prev => {
        const base = prev.date === today ? prev : { date: today, count: 0 };
        const next = { date: today, count: base.count + 1 };
        void persistFree(next);
        logger.log('[ScanLimit] Free scan count:', next.count);
        return next;
      });
    }
  }, [isPremium, persistFree, persistPremium]);

  const resetToday = useCallback(() => {
    const next: FreeScanState = { date: todayKey(), count: 0 };
    setFreeState(next);
    void persistFree(next);
  }, [persistFree]);

  // Calcul des limites selon le plan
  const premiumMonthlyLimit = useMemo(() => {
    if (!isPremium) return 0;
    if (premiumPlan === 'monthly') return MONTHLY_LIMIT_MONTHLY; // 50
    return MONTHLY_LIMIT_ANNUAL; // 30 pour annuel et lifetime
  }, [isPremium, premiumPlan]);

  // Compteurs courants
  const freeCount    = freeState.date === todayKey()   ? freeState.count    : 0;
  const premiumCount = premiumState.month === monthKey() ? premiumState.count : 0;

  // Limite atteinte ?
  const hasReachedFreeLimit    = freeCount >= FREE_DAILY_SCAN_LIMIT;
  const hasReachedPremiumLimit = isPremium && premiumCount >= premiumMonthlyLimit;
  const hasReachedLimit        = isPremium ? hasReachedPremiumLimit : hasReachedFreeLimit;

  // Restants
  const remainingFreeScans    = Math.max(0, FREE_DAILY_SCAN_LIMIT - freeCount);
  const remainingPremiumScans = Math.max(0, premiumMonthlyLimit - premiumCount);

  return useMemo(() => ({
    isLoaded,
    // Gratuits
    scansToday: freeCount,
    remainingFreeScans,
    hasReachedFreeLimit,
    dailyLimit: FREE_DAILY_SCAN_LIMIT,
    // Premium
    scansThisMonth: premiumCount,
    remainingPremiumScans,
    hasReachedPremiumLimit,
    premiumMonthlyLimit,
    // Universel
    hasReachedLimit,
    // Actions
    incrementScan,
    resetToday,
  }), [
    isLoaded,
    freeCount,
    remainingFreeScans,
    hasReachedFreeLimit,
    premiumCount,
    remainingPremiumScans,
    hasReachedPremiumLimit,
    premiumMonthlyLimit,
    hasReachedLimit,
    incrementScan,
    resetToday,
  ]);
});
