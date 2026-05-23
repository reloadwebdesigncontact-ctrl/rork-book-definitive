// template
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    </Stack>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    void SplashScreen.hideAsync();
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

  if (showOnboarding === null) return null;

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
