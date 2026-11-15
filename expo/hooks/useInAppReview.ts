import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const LAUNCH_COUNT_KEY = 'app_launch_count';
const REVIEW_ASKED_KEY = 'review_asked';
// Demander la note après N lancements
const MIN_LAUNCHES = 3;
// Délai avant d'afficher la popup (ms)
const DELAY_MS = 4000;

export function useInAppReview() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let timer: ReturnType<typeof setTimeout>;

    const tryRequestReview = async () => {
      try {
        // Ne pas redemander si déjà fait
        const alreadyAsked = await AsyncStorage.getItem(REVIEW_ASKED_KEY);
        if (alreadyAsked === 'true') return;

        // Incrémenter le compteur de lancements
        const raw = await AsyncStorage.getItem(LAUNCH_COUNT_KEY);
        const count = raw ? parseInt(raw, 10) + 1 : 1;
        await AsyncStorage.setItem(LAUNCH_COUNT_KEY, String(count));

        // Déclencher uniquement au 3e lancement et au-delà
        if (count < MIN_LAUNCHES) return;

        // Vérifier que le store review est disponible
        const isAvailable = await StoreReview.isAvailableAsync();
        if (!isAvailable) return;

        // Délai pour laisser l'app se charger complètement
        timer = setTimeout(async () => {
          await StoreReview.requestReview();
          await AsyncStorage.setItem(REVIEW_ASKED_KEY, 'true');
        }, DELAY_MS);
      } catch {
        // Silencieux — ne jamais bloquer l'app pour ça
      }
    };

    void tryRequestReview();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
}
