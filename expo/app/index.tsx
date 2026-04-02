import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera, Settings, User, LogOut } from "lucide-react-native";
import React, { useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { APP_THEMES, AppTheme } from "@/constants/appThemes";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, colors, appTheme, changeAppTheme } = useTheme();
  const { t } = useLanguage();
  const { user, isSignedIn, signOut } = useUser();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const logoScale = React.useRef(new Animated.Value(0)).current;
  const titleOpacity = React.useRef(new Animated.Value(0)).current;
  const contentSlide = React.useRef(new Animated.Value(30)).current;
  const [showThemeModal, setShowThemeModal] = useState(false);
  const themeChangeAnim = React.useRef(new Animated.Value(0)).current;
  const themeCircle1 = React.useRef(new Animated.Value(0)).current;
  const themeCircle2 = React.useRef(new Animated.Value(0)).current;
  const themeCircle3 = React.useRef(new Animated.Value(0)).current;
  const prevTheme = React.useRef(appTheme);
  const logoFloat = React.useRef(new Animated.Value(0)).current;
  const feature1Slide = React.useRef(new Animated.Value(40)).current;
  const feature2Slide = React.useRef(new Animated.Value(40)).current;
  const feature3Slide = React.useRef(new Animated.Value(40)).current;
  const feature1Opacity = React.useRef(new Animated.Value(0)).current;
  const feature2Opacity = React.useRef(new Animated.Value(0)).current;
  const feature3Opacity = React.useRef(new Animated.Value(0)).current;
  const buttonGlow = React.useRef(new Animated.Value(0)).current;
  const subtitleSlide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(contentSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.stagger(120, [
          Animated.parallel([
            Animated.spring(feature1Slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
            Animated.timing(feature1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(feature2Slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
            Animated.timing(feature2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(feature3Slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
            Animated.timing(feature3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
        ]),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale, titleOpacity, contentSlide, logoFloat, feature1Slide, feature2Slide, feature3Slide, feature1Opacity, feature2Opacity, feature3Opacity, buttonGlow, subtitleSlide]);

  React.useEffect(() => {
    if (prevTheme.current !== appTheme) {
      prevTheme.current = appTheme;
      
      themeChangeAnim.setValue(0);
      themeCircle1.setValue(0);
      themeCircle2.setValue(0);
      themeCircle3.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(themeCircle1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(themeCircle1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(themeCircle2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(themeCircle2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(themeCircle3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(themeCircle3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(themeChangeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(themeChangeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [appTheme, themeChangeAnim, themeCircle1, themeCircle2, themeCircle3]);

  const handlePressIn = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleScan = () => {
    router.push("/scan");
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <Image
          source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={["#F7E9E3", "#F0DDD5", "#E8D0C5"]}
          style={styles.gradient}
        />
      )}
      
      <Animated.View
        style={[
          styles.themeChangeCircle,
          {
            opacity: themeCircle1,
            transform: [
              {
                scale: themeCircle1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.circle, { backgroundColor: colors.primary, opacity: 0.3 }]} />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.themeChangeCircle,
          {
            opacity: themeCircle2,
            transform: [
              {
                scale: themeCircle2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 3],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.circle, { backgroundColor: colors.secondary, opacity: 0.3 }]} />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.themeChangeCircle,
          {
            opacity: themeCircle3,
            transform: [
              {
                scale: themeCircle3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 2.5],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.circle, { backgroundColor: colors.tertiary, opacity: 0.3 }]} />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.themeChangeOverlay,
          {
            opacity: themeChangeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={colors.gradient}
          style={styles.overlayGradient}
        />
      </Animated.View>
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.topButtons, { opacity: titleOpacity }]}>
          {isSignedIn && user && (
            <TopButton onPress={signOut} isDarkMode={isDarkMode}>
              <LogOut size={20} color={colors.primary} strokeWidth={2.5} />
            </TopButton>
          )}
          <TopButton onPress={() => router.push('/settings')} isDarkMode={isDarkMode}>
            <Settings size={20} color={colors.primary} strokeWidth={2.5} />
          </TopButton>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: logoScale }, { translateY: logoFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
              <Image
                source={{ uri: colors.icon }}
                style={styles.logo}
                contentFit="contain"
              />
            </Animated.View>
            <Animated.Text style={[styles.title, isDarkMode && styles.titleDark, { opacity: titleOpacity }]}>{t.home.title}</Animated.Text>
            <Animated.Text style={[styles.subtitle, isDarkMode && styles.subtitleDark, { opacity: titleOpacity, transform: [{ translateY: subtitleSlide }] }]}>
              {t.home.subtitle}
            </Animated.Text>
            
            {isSignedIn && user && (
              <View style={[styles.userInfoCard, isDarkMode && styles.userInfoCardDark]}>
                <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                  <User size={20} color="#FFF" strokeWidth={2.5} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>{user?.name}</Text>
                  <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>{user?.email}</Text>
                </View>
              </View>
            )}
          </Animated.View>

          <View style={styles.featureContainer}>
            <Animated.View style={{ opacity: feature1Opacity, transform: [{ translateX: feature1Slide }] }}>
              <FeatureItem
                icon="1"
                text={t.home.feature1}
                color={colors.primary}
                isDark={isDarkMode}
              />
            </Animated.View>
            <Animated.View style={{ opacity: feature2Opacity, transform: [{ translateX: feature2Slide }] }}>
              <FeatureItem
                icon="2"
                text={t.home.feature2}
                color={colors.primary}
                isDark={isDarkMode}
              />
            </Animated.View>
            <Animated.View style={{ opacity: feature3Opacity, transform: [{ translateX: feature3Slide }] }}>
              <FeatureItem
                icon="3"
                text={t.home.feature3}
                color={colors.primary}
                isDark={isDarkMode}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Pressable
              onPress={handleScan}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.scanButton}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Animated.View style={{ opacity: buttonGlow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }), transform: [{ scale: buttonGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
                  <Camera size={28} color="#FFF" strokeWidth={2.5} />
                </Animated.View>
                <Text style={styles.buttonText}>{t.home.scanButton}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowThemeModal(false)}
          >
            <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>{t.settings.appColor}</Text>
              <View style={styles.themeGrid}>
                {(Object.keys(APP_THEMES) as AppTheme[]).map((theme) => (
                  <Pressable
                    key={theme}
                    onPress={() => {
                      void changeAppTheme(theme);
                      setShowThemeModal(false);
                    }}
                    style={styles.themeOption}
                  >
                    <Image
                      source={{ uri: APP_THEMES[theme].icon }}
                      style={[
                        styles.themeIconPreview,
                        appTheme === theme && styles.themeIconSelected,
                      ]}
                      contentFit="contain"
                    />
                    {appTheme === theme && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function TopButton({ onPress, isDarkMode, children }: { onPress: () => void; isDarkMode: boolean; children: React.ReactNode }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const rotation = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.85,
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '10deg'] }) }] }}>
      <Pressable
        style={styles.themeButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.themeButtonInner, isDarkMode && styles.themeButtonInnerDark]}>
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function FeatureItem({
  icon,
  text,
  color,
  isDark,
  highlighted = false,
}: {
  icon: string;
  text: string;
  color: string;
  isDark?: boolean;
  highlighted?: boolean;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const underlineWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(underlineWidth, {
      toValue: 1,
      delay: 300,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [underlineWidth]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.featureItem, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.featureItemInner,
          highlighted && styles.featureItemInnerHighlighted,
          highlighted && isDark && styles.featureItemInnerHighlightedDark,
        ]}
        testID={`home-feature-${icon}`}
      >
        <View style={[styles.featureNumber, { backgroundColor: color }]}>
          <Text style={styles.featureNumberText}>{icon}</Text>
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={[styles.featureText, highlighted && styles.featureTextHighlighted, isDark && styles.featureTextDark]}>{text}</Text>
          <Animated.View style={[styles.highlightUnderline, { backgroundColor: color, transform: [{ scaleX: underlineWidth }] }]} />
        </View>
      </Pressable>
    </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#3E2723",
    marginBottom: 16,
    textAlign: "center",
  },
  titleDark: {
    color: "#FFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 26,
  },
  subtitleDark: {
    color: "#E0E0E0",
  },
  featureContainer: {
    gap: 20,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureItemInnerHighlighted: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  featureItemInnerHighlightedDark: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  featureTextContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  featureNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureNumberText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  featureText: {
    fontSize: 17,
    color: "#4E342E",
    fontWeight: "500" as const,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  featureTextHighlighted: {
    fontWeight: "700" as const,
  },
  featureTextDark: {
    color: "#FFF",
  },
  highlightUnderline: {
    position: "absolute",
    bottom: 0,
    left: -2,
    right: -2,
    height: 14,
    opacity: 0.4,
    borderRadius: 8,
    transformOrigin: "left",
  },
  buttonContainer: {
    marginTop: 32,
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  topButtons: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    gap: 12,
  },
  themeButton: {},
  themeButtonInner: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  themeButtonInnerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
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
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  googleButtonTextDark: {
    color: "#FFF",
  },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  userNameDark: {
    color: "#FFF",
  },
  userEmail: {
    fontSize: 14,
    color: "#5D4037",
    marginTop: 2,
  },
  userEmailDark: {
    color: "#E0E0E0",
  },
  themeChangeCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -100,
    marginLeft: -100,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  circle: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  themeChangeOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 99,
  },
  overlayGradient: {
    flex: 1,
  },
});
