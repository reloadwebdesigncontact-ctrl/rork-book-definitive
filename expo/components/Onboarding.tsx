import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { APP_THEMES, AppTheme } from "@/constants/appThemes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THEME_KEYS = Object.keys(APP_THEMES) as AppTheme[];

interface OnboardingProps {
  onComplete: () => void;
}

interface PageContent {
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  icon: React.ReactNode;
  gradient: readonly [string, string, string];
}

const FEATURE_PAGES: PageContent[] = [
  {
    titleFr: "Scannez une couverture",
    titleEn: "Scan a cover",
    descFr: "Pointez votre caméra vers n'importe quelle couverture de livre et obtenez un résumé instantané grâce à l'IA.",
    descEn: "Point your camera at any book cover and get an instant AI-powered summary in seconds.",
    icon: <Camera size={72} color="#fff" strokeWidth={1.5} />,
    gradient: ["#FF6B35", "#FF8C42", "#FFA07A"] as const,
  },
  {
    titleFr: "Résumé chapitre par chapitre",
    titleEn: "Chapter by chapter",
    descFr: "Explorez chaque chapitre en détail avec des résumés structurés qui capturent l'essentiel.",
    descEn: "Dive deep into each chapter with structured summaries that capture every key idea.",
    icon: <BookOpen size={72} color="#fff" strokeWidth={1.5} />,
    gradient: ["#7C3AED", "#9061F9", "#A78BFA"] as const,
  },
  {
    titleFr: "Fiche, flashcards & audio",
    titleEn: "Sheet, flashcards & audio",
    descFr: "Générez une fiche de lecture, des flashcards interactives et écoutez le résumé en audio.",
    descEn: "Generate a reading sheet, interactive flashcards, and listen to the summary as audio.",
    icon: <Sparkles size={72} color="#fff" strokeWidth={1.5} />,
    gradient: ["#FF3D8B", "#FF6B6B", "#FF8C42"] as const,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const { colors, appTheme, changeAppTheme, isDarkMode, toggleTheme, animatedBackground, toggleAnimatedBackground } = useTheme();

  const isFr = language === "fr";
  const TOTAL_PAGES = 7;
  const [currentPage, setCurrentPage] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -14, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const goToPage = (next: number) => {
    const direction = next > currentPage ? 1 : -1;
    slideAnim.setValue(direction * SCREEN_WIDTH);
    setCurrentPage(next);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
  };

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES - 1) goToPage(currentPage + 1);
    else handleComplete();
  };

  const handleSkip = () => goToPage(TOTAL_PAGES - 1);

  const handleComplete = async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  const pageGradient: readonly [string, string, string] =
    currentPage === 0 ? colors.gradient :
    currentPage >= 1 && currentPage <= 3 ? FEATURE_PAGES[currentPage - 1].gradient :
    currentPage === 4 ? ["#1a1a2e", "#16213e", "#0f3460"] as const :
    ["#0f0c29", "#302b63", "#24243e"] as const;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={[...pageGradient] as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.blob, styles.blobTopRight, { backgroundColor: pageGradient[1] + "55" }]} />
      <View style={[styles.blob, styles.blobBottomLeft, { backgroundColor: pageGradient[0] + "44" }]} />

      {currentPage < TOTAL_PAGES - 1 && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{isFr ? "Passer" : "Skip"}</Text>
        </Pressable>
      )}

      <Animated.View style={[styles.pageContainer, { transform: [{ translateX: slideAnim }] }]}>
        {currentPage === 0 && <WelcomePage isFr={isFr} pulseAnim={pulseAnim} floatAnim={floatAnim} />}
        {currentPage >= 1 && currentPage <= 3 && <FeaturePage page={FEATURE_PAGES[currentPage - 1]} isFr={isFr} />}
        {currentPage === 4 && <ThemePickerPage isFr={isFr} appTheme={appTheme} changeAppTheme={changeAppTheme} primaryColor={colors.primary} />}
        {currentPage === 5 && <DarkModePage isFr={isFr} isDarkMode={isDarkMode} toggleTheme={toggleTheme} primaryColor={colors.primary} />}
        {currentPage === 6 && <AnimatedBgPage isFr={isFr} animatedBackground={animatedBackground} toggleAnimatedBackground={toggleAnimatedBackground} primaryColor={colors.primary} />}
      </Animated.View>

      <View style={styles.bottomControls}>
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === currentPage ? [styles.dotActive, { backgroundColor: "#fff", width: 24 }] : { backgroundColor: "rgba(255,255,255,0.4)" }]} />
          ))}
        </View>
        <Pressable style={({ pressed }) => [styles.nextButton, { backgroundColor: "#fff", opacity: pressed ? 0.85 : 1 }]} onPress={handleNext}>
          {isLastPage ? (
            <Text style={[styles.nextButtonText, { color: colors.primary }]}>{isFr ? "Commencer" : "Get started"}</Text>
          ) : (
            <View style={styles.nextButtonInner}>
              <Text style={[styles.nextButtonText, { color: colors.primary }]}>{isFr ? "Suivant" : "Next"}</Text>
              <ChevronRight size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function WelcomePage({ isFr, pulseAnim, floatAnim }: { isFr: boolean; pulseAnim: Animated.Value; floatAnim: Animated.Value }) {
  return (
    <View style={styles.pageInner}>
      <Animated.View style={[styles.welcomeIconWrap, { transform: [{ scale: pulseAnim }, { translateY: floatAnim }] }]}>
        <View style={styles.welcomeIconBg}>
          <BookOpen size={80} color="#fff" strokeWidth={1.4} />
        </View>
        <View style={styles.orbitDot} />
        <View style={styles.orbitDot2} />
      </Animated.View>
      <Text style={styles.welcomeTitle}>{isFr ? "Bienvenue sur" : "Welcome to"}</Text>
      <Text style={styles.appName}>Cover Scan</Text>
      <Text style={styles.welcomeSubtitle}>
        {isFr
          ? "Transformez n'importe quelle couverture de livre en résumé instantané grâce à l'intelligence artificielle."
          : "Transform any book cover into an instant summary powered by artificial intelligence."}
      </Text>
      <View style={styles.pillsRow}>
        {(isFr ? ["📷 Scanner", "🤖 IA", "📚 Résumé"] : ["📷 Scan", "🤖 AI", "📚 Summary"]).map((label) => (
          <View key={label} style={styles.pill}>
            <Text style={styles.pillText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FeaturePage({ page, isFr }: { page: PageContent; isFr: boolean }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={styles.pageInner}>
      <Animated.View style={[styles.featureIconWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.featureIconBg}>{page.icon}</View>
      </Animated.View>
      <Text style={styles.featureTitle}>{isFr ? page.titleFr : page.titleEn}</Text>
      <Text style={styles.featureDesc}>{isFr ? page.descFr : page.descEn}</Text>
    </View>
  );
}

function ThemePickerPage({ isFr, appTheme, changeAppTheme, primaryColor }: { isFr: boolean; appTheme: AppTheme; changeAppTheme: (t: AppTheme) => void; primaryColor: string }) {
  return (
    <View style={styles.pageInner}>
      <View style={styles.settingsIconWrap}>
        <Layers size={64} color="#fff" strokeWidth={1.5} />
      </View>
      <Text style={styles.featureTitle}>{isFr ? "Choisissez votre couleur" : "Choose your color"}</Text>
      <Text style={styles.featureDesc}>
        {isFr ? "Personnalisez l'apparence de l'application avec votre couleur préférée." : "Personalize the app appearance with your favorite color."}
      </Text>
      <ScrollView contentContainerStyle={styles.themesGrid} showsVerticalScrollIndicator={false}>
        {THEME_KEYS.map((key) => {
          const palette = APP_THEMES[key];
          const isSelected = key === appTheme;
          return (
            <Pressable key={key} onPress={() => changeAppTheme(key)} style={[styles.themeCircle, isSelected && styles.themeCircleSelected]}>
              <LinearGradient colors={[...palette.gradient] as [string, string, ...string[]]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              {isSelected && <View style={styles.themeCheckOverlay}><Check size={16} color="#fff" strokeWidth={3} /></View>}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function DarkModePage({ isFr, isDarkMode, toggleTheme, primaryColor }: { isFr: boolean; isDarkMode: boolean; toggleTheme: () => void; primaryColor: string }) {
  return (
    <View style={styles.pageInner}>
      <View style={styles.modeIconRow}>
        <View style={[styles.modeIconBg, !isDarkMode && styles.modeIconActive]}>
          <Sun size={40} color={isDarkMode ? "rgba(255,255,255,0.4)" : "#fff"} strokeWidth={1.8} />
        </View>
        <View style={[styles.modeIconBg, isDarkMode && styles.modeIconActive]}>
          <Moon size={40} color={!isDarkMode ? "rgba(255,255,255,0.4)" : "#fff"} strokeWidth={1.8} />
        </View>
      </View>
      <Text style={styles.featureTitle}>{isFr ? "Mode d'affichage" : "Display mode"}</Text>
      <Text style={styles.featureDesc}>
        {isFr ? "Choisissez entre le mode clair et le mode sombre selon vos préférences." : "Choose between light and dark mode based on your preference."}
      </Text>
      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <Sun size={22} color={isDarkMode ? "rgba(255,255,255,0.5)" : "#fff"} />
          <Text style={styles.toggleLabel}>{isFr ? "Clair" : "Light"}</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: "rgba(255,255,255,0.3)", true: primaryColor }} thumbColor="#fff" />
          <Text style={styles.toggleLabel}>{isFr ? "Sombre" : "Dark"}</Text>
          <Moon size={22} color={!isDarkMode ? "rgba(255,255,255,0.5)" : "#fff"} />
        </View>
      </View>
    </View>
  );
}

function AnimatedBgPage({ isFr, animatedBackground, toggleAnimatedBackground, primaryColor }: { isFr: boolean; animatedBackground: boolean; toggleAnimatedBackground: () => void; primaryColor: string }) {
  return (
    <View style={styles.pageInner}>
      <View style={styles.settingsIconWrap}>
        <Zap size={64} color="#fff" strokeWidth={1.5} />
      </View>
      <Text style={styles.featureTitle}>{isFr ? "Fond animé" : "Animated background"}</Text>
      <Text style={styles.featureDesc}>
        {isFr ? "Activez un fond animé dynamique pour une expérience visuelle immersive." : "Enable a dynamic animated background for an immersive visual experience."}
      </Text>
      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <Zap size={22} color={animatedBackground ? "#fff" : "rgba(255,255,255,0.5)"} />
          <Text style={styles.toggleLabel}>{isFr ? "Fond animé" : "Animated bg"}</Text>
          <Switch value={animatedBackground} onValueChange={toggleAnimatedBackground} trackColor={{ false: "rgba(255,255,255,0.3)", true: primaryColor }} thumbColor="#fff" />
        </View>
      </View>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          {isFr
            ? "💡 Ces préférences sont modifiables à tout moment dans les Paramètres."
            : "💡 These preferences can be changed anytime in Settings."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000 },
  blob: { position: "absolute", borderRadius: 999, width: 280, height: 280 },
  blobTopRight: { top: -80, right: -80 },
  blobBottomLeft: { bottom: -80, left: -80 },
  skipButton: { position: "absolute", top: Platform.OS === "ios" ? 56 : 40, right: 24, zIndex: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  skipText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  pageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageInner: { flex: 1, width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: Platform.OS === "ios" ? 80 : 60, paddingBottom: 160 },
  welcomeIconWrap: { marginBottom: 32, alignItems: "center", justifyContent: "center" },
  welcomeIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  orbitDot: { position: "absolute", width: 14, height: 14, borderRadius: 7, top: 10, right: 10, backgroundColor: "#fff" },
  orbitDot2: { position: "absolute", width: 10, height: 10, borderRadius: 5, bottom: 14, left: 14, backgroundColor: "rgba(255,255,255,0.7)" },
  welcomeTitle: { fontSize: 22, color: "rgba(255,255,255,0.85)", fontWeight: "400", letterSpacing: 0.5, marginBottom: 4 },
  appName: { fontSize: 42, color: "#fff", fontWeight: "800", letterSpacing: -0.5, marginBottom: 20 },
  welcomeSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 24, marginBottom: 32 },
  pillsRow: { flexDirection: "row", gap: 10 },
  pill: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  pillText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  featureIconWrap: { marginBottom: 36 },
  featureIconBg: { width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  featureTitle: { fontSize: 28, color: "#fff", fontWeight: "800", textAlign: "center", marginBottom: 16, letterSpacing: -0.3 },
  featureDesc: { fontSize: 16, color: "rgba(255,255,255,0.82)", textAlign: "center", lineHeight: 25, maxWidth: 320 },
  settingsIconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 28, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  themesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingTop: 24, paddingBottom: 8 },
  themeCircle: { width: 52, height: 52, borderRadius: 26, overflow: "hidden" },
  themeCircleSelected: { borderWidth: 3, borderColor: "#fff" },
  themeCheckOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  modeIconRow: { flexDirection: "row", gap: 20, marginBottom: 32 },
  modeIconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  modeIconActive: { backgroundColor: "rgba(255,255,255,0.28)", borderColor: "rgba(255,255,255,0.6)" },
  toggleCard: { marginTop: 28, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 18, width: "100%", maxWidth: 340, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  toggleLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
  noteCard: { marginTop: 24, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, width: "100%", maxWidth: 340, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  noteText: { color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 20, textAlign: "center" },
  bottomControls: { position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: Platform.OS === "ios" ? 44 : 28, paddingHorizontal: 32, alignItems: "center", gap: 20 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4, width: 8 },
  dotActive: { height: 8, borderRadius: 4 },
  nextButton: { borderRadius: 28, paddingVertical: 16, paddingHorizontal: 40, minWidth: 180, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  nextButtonInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  nextButtonText: { fontSize: 17, fontWeight: "700", letterSpacing: 0.2 },
});
