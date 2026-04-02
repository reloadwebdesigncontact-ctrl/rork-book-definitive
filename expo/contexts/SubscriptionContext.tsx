import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const PREMIUM_DEBUG_STORAGE_KEY = 'premium_debug_override';
const CUSTOMER_INFO_QUERY_KEY = ['customerInfo'] as const;
const OFFERINGS_QUERY_KEY = ['offerings'] as const;
const PREMIUM_ENTITLEMENT_KEY = 'premium';

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
    console.log('RevenueCat configured successfully with platform key');
  } catch (error) {
    console.error('Error configuring RevenueCat:', error);
  }
} else {
  console.log('RevenueCat skipped because no API key was found');
}

function hasPremiumEntitlement(customerInfo: CustomerInfo | null | undefined) {
  const activeEntitlement = customerInfo?.entitlements.active?.[PREMIUM_ENTITLEMENT_KEY];
  const allEntitlement = customerInfo?.entitlements.all?.[PREMIUM_ENTITLEMENT_KEY];
  const entitlementByProduct = Object.values(customerInfo?.entitlements.all ?? {}).some((entitlement) => {
    const productIdentifier = entitlement.productIdentifier;
    return productIdentifier === 'coverscan_premium_monthly' || productIdentifier === 'coverscan_premium_monthly:monthly';
  });
  const hasActiveSubscription = customerInfo?.activeSubscriptions?.some((subscriptionId) => {
    return subscriptionId === 'coverscan_premium_monthly' || subscriptionId === 'coverscan_premium_monthly:monthly';
  });

  return Boolean(activeEntitlement ?? allEntitlement ?? entitlementByProduct ?? hasActiveSubscription);
}

async function syncCustomerInfoAfterPurchase() {
  const refreshedCustomerInfo = await Purchases.getCustomerInfo();
  console.log('Customer info synced after purchase/restore:', refreshedCustomerInfo.entitlements.active, refreshedCustomerInfo.activeSubscriptions);
  return refreshedCustomerInfo;
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [isConfigured] = useState<boolean>(revenueCatConfigured);
  const [premiumDebugOverride, setPremiumDebugOverride] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadPremiumDebugOverride = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(PREMIUM_DEBUG_STORAGE_KEY);
        const nextValue = storedValue === 'true';
        console.log('Premium debug override loaded:', nextValue);
        setPremiumDebugOverride(nextValue);
      } catch (error) {
        console.error('Error loading premium debug override:', error);
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
        console.log("Customer info fetched:", info.entitlements.active);
        return info;
      } catch (error) {
        console.error("Error fetching customer info:", error);
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
        console.log("Offerings fetched:", offeringsData.current?.identifier);
        return offeringsData;
      } catch (error) {
        console.error("Error fetching offerings:", error);
        return null;
      }
    },
    enabled: isConfigured,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: PurchasesPackage) => {
      console.log('Purchasing package:', packageToPurchase.identifier, packageToPurchase.product.priceString);
      const { customerInfo: purchasedCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('Customer info returned by purchase:', purchasedCustomerInfo.entitlements.active, purchasedCustomerInfo.activeSubscriptions);

      const syncedCustomerInfo = await syncCustomerInfoAfterPurchase();
      const finalCustomerInfo = syncedCustomerInfo ?? purchasedCustomerInfo;
      const premiumUnlocked = hasPremiumEntitlement(finalCustomerInfo);

      console.log('Premium unlocked after purchase validation:', premiumUnlocked);

      if (!premiumUnlocked) {
        throw new Error('Premium entitlement not active after successful purchase');
      }

      return finalCustomerInfo;
    },
    onSuccess: (newCustomerInfo) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, newCustomerInfo);
      void queryClient.invalidateQueries({ queryKey: CUSTOMER_INFO_QUERY_KEY });
      console.log('Purchase successful, premium entitlement status:', hasPremiumEntitlement(newCustomerInfo));
    },
    onError: (error: any) => {
      if (error.userCancelled) {
        console.log("User cancelled purchase");
      } else {
        console.error("Purchase error:", error);
        Alert.alert('Achat incomplet', "L'abonnement a été payé mais le mode premium n'a pas encore été activé. Réessayez dans un instant.");
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('Restoring purchases...');
      await Purchases.restorePurchases();
      const restoredInfo = await syncCustomerInfoAfterPurchase();
      return restoredInfo;
    },
    onSuccess: (restoredInfo) => {
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, restoredInfo);
      console.log('Purchases restored successfully, premium entitlement status:', hasPremiumEntitlement(restoredInfo));
    },
    onError: (error) => {
      console.error("Restore error:", error);
    },
  });

  const hasRevenueCatPremium = hasPremiumEntitlement(customerInfo);
  const isPremium = hasRevenueCatPremium || premiumDebugOverride;

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
      console.log('Customer info updated via listener, premium entitlement status:', hasPremiumEntitlement(info));
      queryClient.setQueryData(CUSTOMER_INFO_QUERY_KEY, info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured, queryClient]);

  const setPremiumDebugAccess = useCallback(async (enabled: boolean) => {
    console.log('Setting premium debug override:', enabled);
    setPremiumDebugOverride(enabled);
    try {
      await AsyncStorage.setItem(PREMIUM_DEBUG_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving premium debug override:', error);
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
