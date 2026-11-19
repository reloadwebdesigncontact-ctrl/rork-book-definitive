// template
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { UserProvider } from "@/contexts/UserContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ScanLimitProvider } from "@/contexts/ScanLimitContext";
import { AnimatedSplash } from "@/components/AnimatedSplash";
import Onboarding from "@/components/Onboarding";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      <Stack.Screen name="summary" options={{ headerShown: false }} />
      <Stack.Screen name="flashcards" options={{ headerShown: false }} />
      <Stack.Screen name="fiche" options={{ headerShown: false }} />
      <Stack.Screen name="lyrics-reader" options={{ headerShown: false }} />
      <Stack.Screen name="full-summary" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
      <Stack.Screen name="theme-picker" options={{ headerShown: false }} />
      <Stack.Screen name="premium-features" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [fontTimeout, setFontTimeout] = useState(false);

  // Chargement de Baloo 2 : SemiBold (titre) + Regular (textes courants)
  const [fontsLoaded, fontError] = useFonts({
    'Baloo2-SemiBold': require('@expo-google-fonts/baloo-2/600SemiBold/Baloo2_600SemiBold.ttf'),
    'Baloo2-Regular':  require('@expo-google-fonts/baloo-2/400Regular/Baloo2_400Regular.ttf'),
  });

  // Timeout de sécurité : si la police met plus de 3s, on affiche quand même l'app
  useEffect(() => {
    const timer = setTimeout(() => setFontTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cacher le splash natif le plus tôt possible — notre AnimatedSplash JS prend le relais
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("onboarding_completed");
        setShowOnboarding(completed !== "true");
      } catch {
        setShowOnboarding(false);
      }
    };
    void checkOnboarding();
  }, []);

  // Si erreur de police ou timeout, on continue quand même
  if (showOnboarding === null || (!fontsLoaded && !fontTimeout && !fontError)) return null;

  // Wrapper safe pour éviter que les contexts crashent toute l'app
  const SafeWrapper = ({ children }: { children: React.ReactNode }) => {
    try {
      return <>{children}</>;
    } catch (error) {
      console.error('Provider error:', error);
      return <>{children}</>;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeWrapper>
        <LanguageProvider>
          <VoiceProvider>
            <ThemeProvider>
              <UserProvider>
                <SubscriptionProvider>
                  <ScanLimitProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                      {showSplash && (
                        <AnimatedSplash onFinish={() => setShowSplash(false)} />
                      )}
                      {showOnboarding && (
                        <Onboarding onComplete={() => setShowOnboarding(false)} />
                      )}
                    </GestureHandlerRootView>
                  </ScanLimitProvider>
                </SubscriptionProvider>
              </UserProvider>
            </ThemeProvider>
          </VoiceProvider>
        </LanguageProvider>
      </SafeWrapper>
    </QueryClientProvider>
  );
}
