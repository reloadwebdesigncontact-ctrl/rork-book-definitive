import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Volume2, Sparkles, Crown, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Paywall } from '@/components/Paywall';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48 - 12) / 2;

export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);

  // Animations d'entrée
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(headerAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(titleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card1Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card2Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card3Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    // Couronne flottante
    Animated.loop(
      Animated.sequence([
        Animated.timing(crownAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(crownAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const features = [
    {
      key: 'fiche',
      icon: FileText,
      title: language === 'fr' ? 'Fiche de\nlecture' : 'Reading\nSheet',
      emoji: '📝',
      anim: card1Anim,
      gradientIndex: 0,
    },
    {
      key: 'audio',
      icon: Volume2,
      title: language === 'fr' ? 'Lecture\naudio' : 'Audio\nReading',
      emoji: '🎧',
      anim: card2Anim,
      gradientIndex: 1,
    },
    {
      key: 'flashcards',
      icon: Sparkles,
      title: language === 'fr' ? 'Flash\ncards' : 'Flash\nCards',
      emoji: '⚡',
      anim: card3Anim,
      gradientIndex: 2,
    },
  ];

  // Couleurs de gradient par carte
  const cardGradients = [
    [colors.primary, colors.secondary] as [string, string],
    [colors.secondary, colors.tertiary] as [string, string],
    [colors.tertiary, colors.primary] as [string, string],
    [colors.primary, colors.tertiary] as [string, string],
  ];

  const handleFeaturePress = (featureKey: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    router.push({ pathname: '/scan', params: { feature: featureKey } });
  };

  const crownTranslateY = crownAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0A0A' }]} />
      ) : (
        <LinearGradient colors={['#F7E9E3', '#EDD5C5', '#E0C0A8']} style={StyleSheet.absoluteFill} />
      )}
      <AnimatedBackground />

      {/* Cercles décoratifs en arrière-plan */}
      <View style={[styles.bgCircle1, { backgroundColor: `${colors.primary}18` }]} />
      <View style={[styles.bgCircle2, { backgroundColor: `${colors.secondary}12` }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[styles.header, {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          }]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, isDarkMode && styles.backBtnDark]}
          >
            <ArrowLeft size={22} color={isDarkMode ? '#FFF' : '#3E2723'} strokeWidth={2.5} />
          </Pressable>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Titre hero */}
        <Animated.View
          style={[styles.heroSection, {
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}
        >
          <Animated.View style={[styles.crownWrap, { transform: [{ translateY: crownTranslateY }] }]}>
            <LinearGradient colors={colors.gradient} style={styles.crownCircle}>
              <Crown size={28} color="#FFF" strokeWidth={2} />
            </LinearGradient>
            <View style={[styles.crownGlow, { backgroundColor: colors.primary }]} />
          </Animated.View>

          <Text style={[styles.heroTitle, isDarkMode && styles.heroTitleDark]}>
            {language === 'fr' ? 'Fonctionnalités' : 'Advanced'}
          </Text>
          <Text style={[styles.heroTitleAccent, { color: colors.primary }]}>
            {language === 'fr' ? 'Avancées' : 'Features'}
          </Text>
          <Text style={[styles.heroSubtitle, isDarkMode && styles.heroSubtitleDark]}>
            {language === 'fr'
              ? 'Choisis une fonctionnalité et scanne un livre'
              : 'Choose a feature and scan a book'}
          </Text>
        </Animated.View>

        {/* Grille 2x2 */}
        <View style={styles.grid}>
          {features.map((feature, index) => {
            const CardIcon = feature.icon;
            const gradColors = cardGradients[feature.gradientIndex];
            return (
              <Animated.View
                key={feature.key}
                style={{
                  opacity: feature.anim,
                  transform: [
                    { scale: feature.anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                    { translateY: feature.anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                  ],
                }}
              >
                <Pressable
                  onPress={() => handleFeaturePress(feature.key)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <LinearGradient
                    colors={gradColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { width: CARD_SIZE, height: CARD_SIZE }]}
                  >
                    {/* Badge lock si non premium */}
                    {!isPremium && (
                      <View style={styles.lockBadge}>
                        <Lock size={10} color="#FFF" strokeWidth={2.5} />
                      </View>
                    )}

                    {/* Emoji grand */}
                    <Text style={styles.cardEmoji}>{feature.emoji}</Text>

                    {/* Icône */}
                    <View style={styles.cardIconWrap}>
                      <CardIcon size={22} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                    </View>

                    {/* Titre */}
                    <Text style={styles.cardTitle}>{feature.title}</Text>

                    {/* Flèche */}
                    <View style={styles.cardArrow}>
                      <Text style={styles.cardArrowText}>›</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Mention premium en bas */}
        {!isPremium && (
        <Animated.View style={[styles.premiumHint, { opacity: card3Anim }]}>
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={[styles.premiumHintBtn, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
            >
              <Crown size={14} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.premiumHintText, { color: colors.primary }]}>
                {language === 'fr' ? 'Débloquer avec Premium' : 'Unlock with Premium'}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 60,
    left: -60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 4,
  },
  crownWrap: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  crownGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 20,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#3E2723',
    letterSpacing: -0.5,
  },
  heroTitleDark: { color: '#EEE' },
  heroTitleAccent: {
    fontSize: 42,
    fontWeight: '900' as const,
    letterSpacing: -1,
    marginTop: -4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  heroSubtitleDark: { color: '#999' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFF',
    lineHeight: 22,
    marginTop: 6,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArrowText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
    lineHeight: 24,
    marginTop: -2,
  },
  premiumHint: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  premiumHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  premiumHintText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
