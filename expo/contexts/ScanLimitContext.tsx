import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'scan_limit_state_v1';
export const FREE_DAILY_SCAN_LIMIT = 5;

interface ScanLimitState {
  date: string;
  count: number;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const [ScanLimitProvider, useScanLimit] = createContextHook(() => {
  const [state, setState] = useState<ScanLimitState>({ date: todayKey(), count: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ScanLimitState;
          const today = todayKey();
          if (parsed.date === today) {
            setState(parsed);
          } else {
            setState({ date: today, count: 0 });
          }
        }
      } catch (error) {
        console.error('Error loading scan limit:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  const persist = useCallback(async (next: ScanLimitState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error saving scan limit:', error);
    }
  }, []);

  const incrementScan = useCallback(() => {
    const today = todayKey();
    setState((prev) => {
      const base: ScanLimitState = prev.date === today ? prev : { date: today, count: 0 };
      const next: ScanLimitState = { date: today, count: base.count + 1 };
      void persist(next);
      console.log('[ScanLimit] Scan count incremented:', next.count);
      return next;
    });
  }, [persist]);

  const resetToday = useCallback(() => {
    const next: ScanLimitState = { date: todayKey(), count: 0 };
    setState(next);
    void persist(next);
  }, [persist]);

  const currentCount = state.date === todayKey() ? state.count : 0;
  const remaining = Math.max(0, FREE_DAILY_SCAN_LIMIT - currentCount);

  return useMemo(() => ({
    isLoaded,
    scansToday: currentCount,
    remainingFreeScans: remaining,
    hasReachedFreeLimit: currentCount >= FREE_DAILY_SCAN_LIMIT,
    dailyLimit: FREE_DAILY_SCAN_LIMIT,
    incrementScan,
    resetToday,
  }), [isLoaded, currentCount, remaining, incrementScan, resetToday]);
});
