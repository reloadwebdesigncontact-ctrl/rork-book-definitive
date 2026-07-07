import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Crown } from "lucide-react-native";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { APP_THEMES, AppTheme } from "@/constants/appThemes";
import { resolveThemeIcon } from "@/utils/themeIcon";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Paywall } from "@/components/Paywall";
import * as Haptics from "expo-haptics";

const THEME_LABELS: Record<AppTheme, { fr: string; en: string }> = {
  orange:    { fr: 'Orange',    en: 'Orange' },
  red:       { fr: 'Rouge',     en: 'Red' },
  purple:    { fr: 'Violet',    en: 'Purple' },
  turquoise: { fr: 'Turquoise', en: 'Turquoise' },
  pink:      { fr: 'Rose',      en: 'Pink' },
  yellow:    { fr: 'Jaune',     en: 'Yellow' },
  coral:     { fr: 'Corail',    en: 'Coral' },
  lime:      { fr: 'Lime',      en: 'Lime' },
  sunset:    { fr: 'Coucher de soleil', en: 'Sunset' },
  dreamy:    { fr: 'Rêveur',    en: 'Dreamy' },
  neon:      { fr: 'Néon',      en: 'Neon' },
  flamingo:  { fr: 'Flamant',   en: 'Flamingo' },
  aurora:    { fr: 'Aurore',    en: 'Aurora' },
  ocean:     { fr: 'Océan',     en: 'Ocean' },
  silver:    { fr: 'Argent',    en: 'Silver' },
  gold:      { fr: 'Or',        en: 'Gold' },
  tropical:  { fr: 'Tropical',  en: 'Tropical' },
};

// Thèmes réservés aux utilisateurs Premium
const PREMIUM_THEMES = new Set<AppTheme>(['tropical']);

const THEMES = Object.keys(APP_THEMES) as AppTheme[];

export default function ThemePickerScreen() {
  const router = useRouter();
  const { isDarkMode, colors, appTheme, changeAppTheme } = useTheme();
  const { language } = useLanguage();
  const { isPremium } = useSubscription();
  const backScale = useRef(new Animated.Value(1)).current;
  const [showPaywall, setShowPaywall] = React.useState(false);

  const handleSelect = async (theme: AppTheme) => {
    if (PREMIUM_THEMES.has(theme) && !isPremium) {
      setShowPaywall(true);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await changeAppTheme(theme);
    router.back();
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={[styles.bg, { backgroundColor: '#0D0D0D' }]} />
      ) : (
        <LinearGradient
          colors={["#F7E9E3", "#F0DDD5", "#E8D0C5"]}
          style={styles.bg}
        />
      )}
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              onPressIn={() => {
                Animated.spring(backScale, { toValue: 0.85, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(backScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
              }}
            >
              <ArrowLeft size={24} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            {language === 'fr' ? 'Couleur de l\'app' : 'App color'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Liste verticale des thèmes */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {THEMES.map((theme) => {
            const palette = APP_THEMES[theme];
            const isSelected = appTheme === theme;
            const isPremiumTheme = PREMIUM_THEMES.has(theme);
            const isLocked = isPremiumTheme && !isPremium;
            const label = language === 'fr'
              ? THEME_LABELS[theme].fr
              : THEME_LABELS[theme].en;

            return (
              <Pressable
                key={theme}
                onPress={() => handleSelect(theme)}
                style={({ pressed }) => [
                  styles.themeRow,
                  isDarkMode && styles.themeRowDark,
                  isSelected && { borderColor: palette.primary, borderWidth: 2 },
                  pressed && { opacity: 0.85 },
                  isLocked && { opacity: 0.75 },
                ]}
              >
                {/* Icône de l'app avec ce thème */}
                <Image
                  source={resolveThemeIcon(palette.icon, theme)}
                  style={styles.themeIcon}
                  contentFit="contain"
                />

                {/* Infos du thème */}
                <View style={styles.themeInfo}>
                  <View style={styles.themeNameRow}>
                    <Text style={[styles.themeName, isDarkMode && styles.themeNameDark]}>
                      {label}
                    </Text>
                    {isPremiumTheme && (
                      <View style={[styles.premiumBadge, { backgroundColor: palette.primary }]}>
                        <Crown size={10} color="#FFF" strokeWidth={2.5} />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  {/* Preview des couleurs du gradient */}
                  <View style={styles.gradientPreview}>
                    {palette.gradient.map((color, i) => (
                      <View
                        key={i}
                        style={[styles.colorDot, { backgroundColor: color }]}
                      />
                    ))}
                    <LinearGradient
                      colors={palette.gradient as unknown as string[]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientBar}
                    />
                  </View>
                </View>

                {/* Verrou si Premium non activé, checkmark si sélectionné */}
                {isLocked ? (
                  <View style={[styles.lockCircle, { borderColor: palette.primary }]}>
                    <Crown size={14} color={palette.primary} strokeWidth={2.5} />
                  </View>
                ) : isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: palette.primary }]}>
                    <Check size={16} color="#FFF" strokeWidth={3} />
                  </View>
                ) : (
                  <View style={[styles.emptyCircle, { borderColor: isDarkMode ? '#555' : '#DDD' }]} />
                )}
              </Pressable>
            );
          })}

          <View style={{ height: 32 }} />
        </ScrollView>

        <Paywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => setShowPaywall(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#3E2723',
  },
  headerTitleDark: { color: '#FFF' },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeRowDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    elevation: 0,
    shadowOpacity: 0,
  },
  themeIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  themeInfo: {
    flex: 1,
    gap: 8,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#2C1810',
  },
  themeNameDark: { color: '#FFF' },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
    letterSpacing: 0.3,
  },
  lockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  gradientBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
});
