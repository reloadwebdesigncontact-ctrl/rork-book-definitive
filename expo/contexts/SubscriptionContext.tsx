import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

const PREMIUM_DEBUG_STORAGE_KEY = 'premium_debug_override';
const CUSTOMER_INFO_QUERY_KEY = ['customerInfo'] as const;
const OFFERINGS_QUERY_KEY = ['offerings'] as const;
const PREMIUM_ENTITLEMENT_KEY = 'premium';

// Le debug override n'est disponible qu'en développement
const IS_DEV = __DEV__;

function getRCToken() {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }

  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

const revenueCatApiKey = getRCToken();
let revenueCatConfigured = false;

if (revenueCatApiKey) {
  try {
    Purchases.configure({ apiKey: revenueCatApiKey });
    revenueCatConfigured = true;
    logger.log('RevenueCat configured successfully with platform key');
  } catch (error) {
    logger.error('Error configuring RevenueCat:', error);
  }
} else {
  logger.log('RevenueCat skipped because no API key was found');
}

function hasPremiumEntitlement(customerInfo: CustomerInfo | null | undefined) {
  const activeEntitlement = customerInfo?.entitlements.active?.[PREMIUM_ENTITLEMENT_KEY];
  const allEntitlement = customerInfo?.entitlements.all?.[PREMIUM_ENTITLEMENT_KEY];
  const entitlementByProduct = Object.values(customerInfo?.entitlements.all ?? {}).some((entitlement) => {
    const productIdentifier = entitlement.productIdentifier;
    return productIdentifier === 'cover_scan_mensuel' || productIdentifier === 'cover_scan_mensuel:forfait-de-base';
  });
  const hasActiveSubscription = customerInfo?.activeSubscriptions?.some((subscriptionId) => {
    return subscriptionId === 'cover_scan_mensuel' || subscriptionId === 'cover_scan_mensuel:forfait-de-base';
  });

  return Boolean(activeEntitlement ?? allEntitlement ?? entitlementByProduct ?? hasActiveSubscription);
}

async function syncCustomerInfoAfterPurchase() {
  const refreshedCustomerInfo = await Purchases.getCustomerInfo();
  logger.log('Customer info synced after purchase/restore');
  return refreshedCustomerInfo;
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [isConfigured] = useState<boolean>(revenueCatConfigured);
  const [premiumDebugOverride, setPremiumDebugOverride] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadPremiumDebugOverride = async () => {
      // En production, le debug override est ignoré
      if (!IS_DEV) return;
      try {
        const storedValue = await AsyncStorage.getItem(PREMIUM_DEBUG_STORAGE_KEY);
        const nextValue = storedValue === 'true';
        logger.log('Premium debug override loaded:', nextValue);
        setPremiumDebugOverride(nextValue);
      } catch (error) {
        logger.error('Error loading premium debug override:', error);
      }
    };
    void loadPremiumDebugOverride();
  }, []);

  const { data: customerInfo, isLoading: isLoadingCustomerInfo, refetch: refetchCustomerInfo } = useQuery({
    queryKey: CUSTOMER_INFO_QUERY_KEY,
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        logger.log("Customer info fetched, premium:", hasPremiumEntitlement(info));
        return info;
      } catch (error) {
        logger.error("Error fetching customer info:", error);
        return null;
      }
    },
    enabled: isConfigured,
  });

  const { data: offerings, isLoading: isLoadingOfferings } = useQuery({
    queryKey: OFFERINGS_QUERY_KEY,
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        const offeringsData = await Purchases.getOfferings();
        logger.log("Offerings fetched:", offeringsData.current?.identifier);
        return offeringsData;
      } catch (error) {
        logger.error("Error fetching offerings:", error);
        return null;
      }
    },
    enabled: isConfigured,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: PurchasesPackage) => {
      logger.log('Purchasing package:', packageToPurchase.identifier);
      const { customerInfo: purchasedCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);

      const syncedCustomerInfo = await syncCustomerInfoAfterPurchase();
      const finalCustomerInfo = syncedCustomerInfo ?? purchasedCustomerInfo;
      const premiumUnlocked = hasPremiumEntitlement(finalCustomerInfo);

      logger.log('Premium unlocked after purchase validation:', premiumUnlocked);

      if (!premiumUnlocked) {
        throw new Error('Premium entitlement not active after successful purchase');
      }

      return finalCustomerInfo;
    },
    onSuccess: (newCustomerInfo) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, newCustomerInfo);
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_INFO_QUERY_KEY });
      logger.log('Purchase successful');
    },
    onError: (error: any) => {
      if (error.userCancelled) {
        logger.log("User cancelled purchase");
      } else {
        logger.error("Purchase error:", error);
        Alert.alert('Achat incomplet', "L'abonnement a été payé mais le mode premium n'a pas encore été activé. Réessayez dans un instant.");
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      logger.log('Restoring purchases...');
      await Purchases.restorePurchases();
      const restoredInfo = await syncCustomerInfoAfterPurchase();
      return restoredInfo;
    },
    onSuccess: (restoredInfo) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, restoredInfo);
      logger.log('Purchases restored, premium:', hasPremiumEntitlement(restoredInfo));
    },
    onError: (error) => {
      logger.error("Restore error:", error);
    },
  });

  const hasRevenueCatPremium = hasPremiumEntitlement(customerInfo);
  // En production, le debug override est complètement désactivé
  const isPremium = IS_DEV ? (hasRevenueCatPremium || premiumDebugOverride) : hasRevenueCatPremium;

  const currentOffering = offerings?.current;

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchasePackage = useCallback((pkg: PurchasesPackage) => {
    return purchaseAsync(pkg);
  }, [purchaseAsync]);

  const restorePurchases = useCallback(() => {
    return restoreAsync();
  }, [restoreAsync]);

  useEffect(() => {
    if (!isConfigured) return;

    const listener = (info: CustomerInfo) => {
      logger.log('Customer info updated via listener');
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured, queryClient]);

  const setPremiumDebugAccess = useCallback(async (enabled: boolean) => {
    if (!IS_DEV) return; // Désactivé en production
    logger.log('Setting premium debug override:', enabled);
    setPremiumDebugOverride(enabled);
    try {
      await AsyncStorage.setItem(PREMIUM_DEBUG_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      logger.error('Error saving premium debug override:', error);
    }
  }, []);

  return useMemo(() => ({
    isPremium,
    hasRevenueCatPremium,
    premiumDebugOverride,
    setPremiumDebugAccess,
    isLoading: isLoadingCustomerInfo || isLoadingOfferings,
    currentOffering,
    customerInfo,
    purchasePackage,
    restorePurchases,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
    refetchCustomerInfo,
    premiumProductPrice: currentOffering?.availablePackages.find((pkg) => pkg.identifier === '$rc_monthly')?.product.priceString ?? currentOffering?.availablePackages[0]?.product.priceString ?? '5,00 €',
  }), [
    currentOffering,
    customerInfo,
    hasRevenueCatPremium,
    isLoadingCustomerInfo,
    isLoadingOfferings,
    isPremium,
    premiumDebugOverride,
    purchaseMutation.error,
    purchaseMutation.isPending,
    purchasePackage,
    refetchCustomerInfo,
    restoreMutation.isPending,
    restorePurchases,
    setPremiumDebugAccess,
  ]);
});
