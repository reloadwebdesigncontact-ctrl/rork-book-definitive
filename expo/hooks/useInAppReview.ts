import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAUNCH_COUNT_KEY = 'app_launch_count';
const REVIEW_ASKED_KEY = 'review_asked';
const PACKAGE_NAME = 'app.coverscan';
const MIN_LAUNCHES = 3;
const DELAY_MS = 4000;

export function useInAppReview() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let timer: ReturnType<typeof setTimeout>;

    const tryRequestReview = async () => {
      try {
        const alreadyAsked = await AsyncStorage.getItem(REVIEW_ASKED_KEY);
        if (alreadyAsked === 'true') return;

        const raw = await AsyncStorage.getItem(LAUNCH_COUNT_KEY);
        const count = raw ? parseInt(raw, 10) + 1 : 1;
        await AsyncStorage.setItem(LAUNCH_COUNT_KEY, String(count));

        if (count < MIN_LAUNCHES) return;

        timer = setTimeout(async () => {
          try {
            // Essayer l'URL market:// d'abord (ouvre le Play Store directement)
            const marketUrl = `market://details?id=${PACKAGE_NAME}&showAllReviews=true`;
            const canOpen = await Linking.canOpenURL(marketUrl);
            if (canOpen) {
              await Linking.openURL(marketUrl);
            } else {
              await Linking.openURL(`https://play.google.com/store/apps/details?id=${PACKAGE_NAME}&showAllReviews=true`);
            }
            await AsyncStorage.setItem(REVIEW_ASKED_KEY, 'true');
          } catch {
            // Silencieux
          }
        }, DELAY_MS);
      } catch {
        // Silencieux
      }
    };

    void tryRequestReview();
    return () => { if (timer) clearTimeout(timer); };
  }, []);
}
