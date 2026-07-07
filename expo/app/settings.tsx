import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Globe, Moon, Sun, Palette, Scale, ChevronRight, Info, Crown, Sparkles, Smartphone } from "lucide-react-native";
import Constants from 'expo-constants';
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { APP_THEMES, AppTheme } from "@/constants/appThemes";
import { Paywall } from "@/components/Paywall";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { resolveThemeIcon } from "@/utils/themeIcon";
import { changeAppIcon, getSavedIcon, ICON_OPTIONS, ICON_PREVIEWS, type AppIconKey } from "@/utils/appIcon";

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors, appTheme, changeAppTheme, animatedBackground, toggleAnimatedBackground } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { isPremium, restorePurchases, isRestoring, customerInfo } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<AppIconKey>('orange');

  React.useEffect(() => {
    void getSavedIcon().then(icon => setSelectedIcon(icon as AppIconKey));
  }, []);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const section4Opacity = useRef(new Animated.Value(0)).current;
  const section4Slide = useRef(new Animated.Value(30)).current;
  const sliderPosition = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const moonScale = useRef(new Animated.Value(isDarkMode ? 1.2 : 0.8)).current;
  const sunScale = useRef(new Animated.Value(isDarkMode ? 0.8 : 1.2)).current;
  const glowOpacity = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const section1Opacity = useRef(new Animated.Value(0)).current;
  const section2Opacity = useRef(new Animated.Value(0)).current;
  const section3Opacity = useRef(new Animated.Value(0)).current;
  const section1Slide = useRef(new Animated.Value(30)).current;
  const section2Slide = useRef(new Animated.Value(30)).current;
  const section3Slide = useRef(new Animated.Value(30)).current;
  const backBtnScale = useRef(new Animated.Value(1)).current;
  const headerTitleFade = useRef(new Animated.Value(0)).current;
  const frOptionScale = useRef(new Animated.Value(1)).current;
  const enOptionScale = useRef(new Animated.Value(1)).current;
  const colorPreviewScale = useRef(new Animated.Value(1)).current;
  const legalOption1Scale = useRef(new Animated.Value(1)).current;
  const legalOption2Scale = useRef(new Animated.Value(1)).current;
  const legalOption3Scale = useRef(new Animated.Value(1)).current;
  const versionFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sliderPosition, {
        toValue: isDarkMode ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.spring(moonScale, {
        toValue: isDarkMode ? 1.2 : 0.8,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(sunScale, {
        toValue: isDarkMode ? 0.8 : 1.2,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(glowOpacity, {
        toValue: isDarkMode ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDarkMode, sliderPosition, moonScale, sunScale, glowOpacity]);

  useEffect(() => {
    Animated.timing(headerTitleFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(section1Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(section1Slide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(section2Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(section2Slide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(section3Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(section3Slide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(section4Opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(section4Slide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(versionFade, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [section1Opacity, section2Opacity, section3Opacity, section4Opacity, section1Slide, section2Slide, section3Slide, section4Slide, headerTitleFade, versionFade]);

  const animateOptionPress = (scale: Animated.Value) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={[styles.backgroundImage, { backgroundColor: '#0D0D0D' }]} />
      ) : (
        <LinearGradient
          colors={["#F7E9E3", "#F0DDD5", "#E8D0C5"]}
          style={styles.gradient}
        />
      )}
      <AnimatedBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              onPressIn={() => {
                Animated.spring(backBtnScale, { toValue: 0.85, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(backBtnScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
              }}
            >
              <ArrowLeft size={24} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
          <Animated.Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark, { opacity: headerTitleFade }]}>
            {t.settings.title}
          </Animated.Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section1Opacity, transform: [{ translateY: section1Slide }] }]}>
            <View style={styles.sectionHeader}>
              <Globe size={24} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {t.settings.language}
              </Text>
            </View>
            <View style={styles.optionGroup}>
              <Animated.View style={{ transform: [{ scale: frOptionScale }] }}>
                <Pressable
                  onPress={() => {
                    animateOptionPress(frOptionScale);
                    void changeLanguage('fr');
                  }}
                  style={[
                    styles.option,
                    isDarkMode && styles.optionDark,
                    language === 'fr' && { backgroundColor: `${colors.primary}1F` },
                  ]}
                >
                  <Text style={[styles.optionText, isDarkMode && styles.optionTextDark]}>
                    {t.settings.french}
                  </Text>
                  {language === 'fr' && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: enOptionScale }] }}>
                <Pressable
                  onPress={() => {
                    animateOptionPress(enOptionScale);
                    void changeLanguage('en');
                  }}
                  style={[
                    styles.option,
                    isDarkMode && styles.optionDark,
                    language === 'en' && { backgroundColor: `${colors.primary}1F` },
                  ]}
                >
                  <Text style={[styles.optionText, isDarkMode && styles.optionTextDark]}>
                    {t.settings.english}
                  </Text>
                  {language === 'en' && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section2Opacity, transform: [{ translateY: section2Slide }] }]}>
            <View style={styles.sectionHeader}>
              {isDarkMode ? (
                <Sun size={24} color={colors.tertiary} strokeWidth={2.5} />
              ) : (
                <Moon size={24} color={colors.primary} strokeWidth={2.5} />
              )}
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {t.settings.theme}
              </Text>
            </View>
            <View style={[styles.themeSliderContainer, isDarkMode && styles.themeSliderContainerDark]}>
              <Pressable
                onPress={toggleTheme}
                style={styles.themeSliderTrack}
              >
                <View style={styles.themeIconsRow}>
                  <Animated.View style={[styles.iconWrapper, { transform: [{ scale: sunScale }] }]}>
                    <Sun 
                      size={28} 
                      color={!isDarkMode ? "#FFA500" : "#666"} 
                      strokeWidth={2.5} 
                      fill={!isDarkMode ? "#FFA500" : "transparent"}
                    />
                  </Animated.View>
                  <Animated.View style={[styles.iconWrapper, { transform: [{ scale: moonScale }] }]}>
                    <Moon 
                      size={28} 
                      color={isDarkMode ? "#4A90E2" : "#666"} 
                      strokeWidth={2.5}
                      fill={isDarkMode ? "#4A90E2" : "transparent"}
                    />
                  </Animated.View>
                </View>
                
                <Animated.View
                  style={[
                    styles.sliderIndicator,
                    {
                      transform: [
                        {
                          translateX: sliderPosition.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 120],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#1a237e', '#283593', '#3949ab'] : ['#FFD700', '#FFA500', '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sliderIndicatorInner}
                  >
                    <Animated.View style={{ opacity: glowOpacity }}>
                      <View style={styles.indicatorGlow} />
                    </Animated.View>
                  </LinearGradient>
                </Animated.View>
              </Pressable>
              
              <View style={styles.modeLabelsRow}>
                <Text style={[styles.modeLabel, !isDarkMode && styles.modeLabelActive, isDarkMode && styles.modeLabelDark]}>
                  {t.settings.lightMode}
                </Text>
                <Text style={[styles.modeLabel, isDarkMode && styles.modeLabelActiveDark, !isDarkMode && styles.modeLabelLight]}>
                  {t.settings.darkMode}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section3Opacity, transform: [{ translateY: section3Slide }] }]}>
            <View style={styles.sectionHeader}>
              <Palette size={24} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {t.settings.appColor}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ scale: colorPreviewScale }] }}>
              <Pressable
                onPress={() => {
                  animateOptionPress(colorPreviewScale);
                  router.push('/theme-picker');
                }}
                style={[styles.colorPreview, isDarkMode && styles.colorPreviewDark]}
              >
                <View style={styles.colorPreviewContent}>
                  <Image
                    source={resolveThemeIcon(colors.icon, appTheme)}
                    style={styles.currentIcon}
                    contentFit="contain"
                  />
                  <Text style={[styles.colorPreviewText, isDarkMode && styles.colorPreviewTextDark]}>
                    Changer la couleur
                  </Text>
                </View>
                <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Section fond animé — supprimée, le fond animé est toujours actif */}

          {/* Section Icône de l'app */}
          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section3Opacity, transform: [{ translateY: section3Slide }] }]}>
            <View style={styles.sectionHeader}>
              <Smartphone size={24} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {language === 'fr' ? 'Icône de l\'app' : 'App icon'}
              </Text>
              {!isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
                  <Crown size={10} color="#FFF" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </View>
            {!isPremium ? (
              <Pressable
                onPress={() => setShowPaywall(true)}
                style={[styles.option, isDarkMode && styles.optionDark]}
              >
                <Text style={[styles.optionText, isDarkMode && styles.optionTextDark]}>
                  {language === 'fr' ? 'Déverrouillez avec Premium' : 'Unlock with Premium'}
                </Text>
                <Crown size={18} color={colors.primary} strokeWidth={2.5} />
              </Pressable>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.iconGrid}
              >
                {ICON_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={async () => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIcon(option.key);
                      await changeAppIcon(option.key);
                    }}
                    style={[
                      styles.iconOption,
                      selectedIcon === option.key && {
                        borderColor: colors.primary,
                        borderWidth: 3,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.5,
                        shadowRadius: 6,
                        elevation: 6,
                      },
                    ]}
                  >
                    <Image
                      source={ICON_PREVIEWS[option.key]}
                      style={styles.iconPreviewImg}
                      contentFit="contain"
                    />
                    {selectedIcon === option.key && (
                      <View style={[styles.iconCheckBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.iconCheckText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section4Opacity, transform: [{ translateY: section4Slide }] }]}> 
            <View style={styles.sectionHeader}>
              <Crown size={24} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {language === 'fr' ? 'Mon abonnement' : 'My subscription'}
              </Text>
            </View>
            <View style={[styles.debugCard, isDarkMode && styles.debugCardDark]}>
              <View style={styles.debugBadgeRow}>
                <View style={[styles.debugBadge, { backgroundColor: isPremium ? colors.primary : "#8C8C8C" }]}>
                  <Text style={styles.debugBadgeText}>
                    {isPremium ? 'Premium' : (language === 'fr' ? 'Gratuit' : 'Free')}
                  </Text>
                </View>
                {isPremium && (
                  <View style={[styles.storeBadge, { borderColor: colors.primary }]}>
                    <Crown size={14} color={colors.primary} strokeWidth={2.5} />
                    <Text style={[styles.storeBadgeText, { color: colors.primary }]}>
                      {language === 'fr' ? 'Actif' : 'Active'}
                    </Text>
                  </View>
                )}
              </View>

              {isPremium ? (
                <>
                  <Text style={[styles.debugDescription, isDarkMode && styles.debugDescriptionDark]}>
                    {language === 'fr' ? 'Vous bénéficiez de toutes les fonctionnalités premium.' : 'You have access to all premium features.'}
                  </Text>
                  {(() => {
                    const activeEntitlements = customerInfo?.entitlements.active;
                    const firstEntitlement = activeEntitlements
                      ? Object.values(activeEntitlements)[0]
                      : null;
                    const purchaseDate = firstEntitlement?.latestPurchaseDate
                      || firstEntitlement?.originalPurchaseDate;
                    if (!purchaseDate) return null;
                    return (
                      <Text style={[styles.subscriptionDate, isDarkMode && styles.subscriptionDateDark]}>
                        {language === 'fr' ? '📅 Abonné depuis le ' : '📅 Subscribed since '}
                        {new Date(purchaseDate).toLocaleDateString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </Text>
                    );
                  })()}
                </>
              ) : (
                <>
                  <Text style={[styles.debugDescription, isDarkMode && styles.debugDescriptionDark]}>
                    {language === 'fr' ? 'Plan gratuit — 3 scans par jour.' : 'Free plan — 3 scans per day.'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setShowPaywall(true);
                    }}
                    style={styles.upgradeButton}
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.upgradeButtonGradient}
                    >
                      <Sparkles size={18} color="#FFF" />
                      <Text style={styles.upgradeButtonText}>
                        {language === 'fr' ? 'Passer à Premium' : 'Upgrade to Premium'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={() => void restorePurchases()}
                    style={[styles.restoreButton, isDarkMode && styles.restoreButtonDark]}
                  >
                    <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
                      {isRestoring
                        ? (language === 'fr' ? 'Restauration...' : 'Restoring...')
                        : (language === 'fr' ? 'Restaurer les achats' : 'Restore purchases')}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Animated.View>

          <Paywall
            visible={showPaywall}
            onClose={() => setShowPaywall(false)}
            onSuccess={() => setShowPaywall(false)}
          />

          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section4Opacity, transform: [{ translateY: section4Slide }] }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.rateStarIcon}>⭐</Text>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {language === 'fr' ? 'Évaluer l\'application' : 'Rate the app'}
              </Text>
            </View>
            <Text style={[styles.rateDescription, isDarkMode && styles.rateDescriptionDark]}>
              {language === 'fr'
                ? 'Vous aimez Summshine ? Laissez un avis sur le Play Store, ça nous aide beaucoup !'
                : 'Enjoying Summshine? Leave a review on the Play Store, it helps us a lot!'}
            </Text>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                void Linking.openURL('https://play.google.com/store/apps/details?id=app.coverscan');
              }}
              style={styles.rateButton}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rateButtonGradient}
              >
                <Text style={styles.rateButtonText}>
                  {language === 'fr' ? '⭐ Laisser un avis' : '⭐ Leave a review'}
                </Text>
                <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.section, isDarkMode && styles.sectionDark, { opacity: section4Opacity, transform: [{ translateY: section4Slide }] }]}>
            <View style={styles.sectionHeader}>
              <Scale size={24} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                {t.settings.legal}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ scale: legalOption1Scale }] }}>
              <Pressable
                onPress={() => {
                  animateOptionPress(legalOption1Scale);
                  void Linking.openURL('https://magical-canvas-12e.notion.site/Mentions-l-gales-Cover-Scan-88931669eafa49ea8e573e24df0504a3?source=copy_link');
                }}
                style={[styles.legalOption, isDarkMode && styles.legalOptionDark]}
              >
                <Text style={[styles.legalOptionText, isDarkMode && styles.legalOptionTextDark]}>
                  {t.settings.legalNotices}
                </Text>
                <ChevronRight size={20} color={isDarkMode ? "#999" : "#666"} />
              </Pressable>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: legalOption2Scale }], marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  animateOptionPress(legalOption2Scale);
                  void Linking.openURL('https://magical-canvas-12e.notion.site/CGU-Cover-Scan-bf6e6e33cf2e42228a457d062826f5fa?source=copy_link');
                }}
                style={[styles.legalOption, isDarkMode && styles.legalOptionDark]}
              >
                <Text style={[styles.legalOptionText, isDarkMode && styles.legalOptionTextDark]}>
                  CGU
                </Text>
                <ChevronRight size={20} color={isDarkMode ? "#999" : "#666"} />
              </Pressable>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: legalOption3Scale }], marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  animateOptionPress(legalOption3Scale);
                  void Linking.openURL('https://magical-canvas-12e.notion.site/Politique-de-confidentialit-Cover-Scan-560c1875ff4f48bcaf79b62422a91500?source=copy_link');
                }}
                style={[styles.legalOption, isDarkMode && styles.legalOptionDark]}
              >
                <Text style={[styles.legalOptionText, isDarkMode && styles.legalOptionTextDark]}>
                  Politique de confidentialité
                </Text>
                <ChevronRight size={20} color={isDarkMode ? "#999" : "#666"} />
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.versionContainer, isDarkMode && styles.versionContainerDark, { opacity: versionFade }]}>
            <Info size={16} color={isDarkMode ? "#666" : "#999"} />
            <Text style={[styles.versionText, isDarkMode && styles.versionTextDark]}>
              Version {appVersion}
            </Text>
          </Animated.View>

        </ScrollView>

        
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerTitleDark: {
    color: "#FFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionDark: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  optionGroup: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  optionDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  optionTextDark: {
    color: "#FFF",
  },
  optionSubtext: {
    fontSize: 12,
    color: "#8D6E63",
    marginTop: 2,
  },
  optionSubtextDark: {
    color: "#999",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  themeSliderContainer: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    gap: 16,
  },
  themeSliderContainerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  themeSliderTrack: {
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
  },
  themeIconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    height: "100%",
    zIndex: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderIndicator: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 120,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderIndicatorInner: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  indicatorGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    position: "absolute",
  },
  modeLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#999",
  },
  modeLabelActive: {
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  modeLabelDark: {
    color: "#666",
  },
  modeLabelLight: {
    color: "#999",
  },
  modeLabelActiveDark: {
    fontWeight: "700" as const,
    color: "#FFF",
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  colorPreviewDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  colorPreviewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  colorPreviewText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  colorPreviewTextDark: {
    color: "#FFF",
  },
  arrow: {
    fontSize: 28,
    color: "#999",
    fontWeight: "300" as const,
  },
  arrowDark: {
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContentDark: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#3E2723",
    marginBottom: 20,
    textAlign: "center",
  },
  modalTitleDark: {
    color: "#FFF",
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  themeOption: {
    width: 80,
    height: 80,
    position: "relative",
  },
  themeIconPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeIconSelected: {
    borderColor: "#000",
    borderWidth: 3,
  },
  selectedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  selectedBadgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  debugCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  debugCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  debugBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  debugBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  debugBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  storeBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  debugDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5D4037",
  },
  debugDescriptionDark: {
    color: "#E0E0E0",
  },
  debugButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  debugButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  debugButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  debugSecondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(62, 39, 35, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  debugSecondaryButtonDark: {
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  debugSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  debugSecondaryButtonTextDark: {
    color: "#FFF",
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  restoreButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  animBgHint: {
    fontSize: 12,
    color: '#8D6E63',    marginTop: 8,
    fontStyle: 'italic',
  },
  animBgHintDark: {
    color: '#999',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  subscriptionDate: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '500' as const,
    marginTop: 4,
  },
  subscriptionDateDark: {
    color: '#999',
  },
  legalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  legalOptionDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  legalOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  legalOptionTextDark: {
    color: "#FFF",
  },
  legalModalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  legalModalContainerDark: {
    backgroundColor: "#1a1a2e",
  },
  legalModalSafeArea: {
    flex: 1,
  },
  legalModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  legalModalHeaderDark: {
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  legalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  legalModalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  legalModalTitleDark: {
    color: "#FFF",
  },
  legalScrollView: {
    flex: 1,
  },
  legalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  legalMainTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#3E2723",
    marginBottom: 24,
    textAlign: "center",
  },
  legalSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#3E2723",
    marginTop: 20,
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
    marginBottom: 8,
  },
  legalTextDark: {
    color: "#CCC",
  },
  legalBullet: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
    marginBottom: 4,
    paddingLeft: 8,
  },
  legalSubBullet: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666",
    marginBottom: 2,
    paddingLeft: 16,
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  iconOption: {
    width: 70,
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconPreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  iconCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCheckText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  versionContainerDark: {
    opacity: 0.8,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500" as const,
  },
  versionTextDark: {
    color: "#666",
  },
  rateButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  rateButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
    letterSpacing: 0.3,
  },
  rateStarIcon: {
    fontSize: 22,
  },
  rateDescription: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 16,
  },
  rateDescriptionDark: {
    color: '#CCC',
  },
  premiumBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  iconGrid: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  iconOption: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  iconPreviewImg: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: 14,
  },
  iconCheckBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  iconCheckText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
});


