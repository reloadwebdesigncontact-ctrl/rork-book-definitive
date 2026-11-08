import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/utils/logger';

// Clés de stockage
const FREE_STORAGE_KEY    = 'scan_limit_state_v1';
const PREMIUM_STORAGE_KEY = 'scan_limit_premium_v1';

// Limites
export const FREE_DAILY_SCAN_LIMIT  = 3;
export const MONTHLY_LIMIT_MONTHLY  = 50;  // plan mensuel 4,99€
export const MONTHLY_LIMIT_ANNUAL   = 30;  // plan annuel
export const MONTHLY_LIMIT_LIFETIME = 30;  // lifetime

// Utilitaires
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface FreeScanState {
  date: string;
  count: number;
}

interface PremiumScanState {
  month: string;
  count: number;
}

export const [ScanLimitProvider, useScanLimit] = createContextHook(() => {
  const [freeState, setFreeState] = useState<FreeScanState>({ date: todayKey(), count: 0 });
  const [premiumState, setPremiumState] = useState<PremiumScanState>({ month: monthKey(), count: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rawFree = await AsyncStorage.getItem(FREE_STORAGE_KEY);
        if (rawFree) {
          const parsed = JSON.parse(rawFree) as FreeScanState;
          setFreeState(parsed.date === todayKey() ? parsed : { date: todayKey(), count: 0 });
        }
        const rawPremium = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (rawPremium) {
          const parsed = JSON.parse(rawPremium) as PremiumScanState;
          setPremiumState(parsed.month === monthKey() ? parsed : { month: monthKey(), count: 0 });
        }
      } catch (error) {
        logger.error('Error loading scan limit:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  const persistFree = useCallback(async (next: FreeScanState) => {
    try { await AsyncStorage.setItem(FREE_STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { logger.error('Error saving free scan limit:', e); }
  }, []);

  const persistPremium = useCallback(async (next: PremiumScanState) => {
    try { await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { logger.error('Error saving premium scan limit:', e); }
  }, []);

  // incrementScan reçoit isPremium en paramètre pour éviter l'import circulaire
  const incrementScan = useCallback((isPremium: boolean) => {
    if (isPremium) {
      const month = monthKey();
      setPremiumState(prev => {
        const base = prev.month === month ? prev : { month, count: 0 };
        const next = { month, count: base.count + 1 };
        void persistPremium(next);
        return next;
      });
    } else {
      const today = todayKey();
      setFreeState(prev => {
        const base = prev.date === today ? prev : { date: today, count: 0 };
        const next = { date: today, count: base.count + 1 };
        void persistFree(next);
        return next;
      });
    }
  }, [persistFree, persistPremium]);

  const resetToday = useCallback(() => {
    const next: FreeScanState = { date: todayKey(), count: 0 };
    setFreeState(next);
    void persistFree(next);
  }, [persistFree]);

  const freeCount    = freeState.date === todayKey()    ? freeState.count    : 0;
  const premiumCount = premiumState.month === monthKey() ? premiumState.count : 0;

  const remainingFreeScans = Math.max(0, FREE_DAILY_SCAN_LIMIT - freeCount);

  return useMemo(() => ({
    isLoaded,
    // Gratuits
    scansToday: freeCount,
    remainingFreeScans,
    hasReachedFreeLimit: freeCount >= FREE_DAILY_SCAN_LIMIT,
    dailyLimit: FREE_DAILY_SCAN_LIMIT,
    // Premium
    scansThisMonth: premiumCount,
    // Actions
    incrementScan,
    resetToday,
  }), [
    isLoaded,
    freeCount,
    remainingFreeScans,
    premiumCount,
    incrementScan,
    resetToday,
  ]);
});
