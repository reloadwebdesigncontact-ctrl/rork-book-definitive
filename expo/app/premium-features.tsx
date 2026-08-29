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
import { ArrowLeft, FileText, Volume2, Sparkles, ChevronRight, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Paywall } from '@/components/Paywall';

const { width } = Dimensions.get('window');

function BackButton({ router, isDarkMode }: { router: any; isDarkMode: boolean }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => router.back()}
        onPressIn={() => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
        style={[styles.backBtn, isDarkMode && styles.backBtnDark]}
      >
        <ArrowLeft size={22} color={isDarkMode ? '#FFF' : '#3E2723'} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}

export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(titleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card1Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card2Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card3Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const features = [
    {
      key: 'fiche',
      icon: FileText,
      title: language === 'fr' ? 'Fiche de lecture' : 'Reading Sheet',
      desc: language === 'fr' ? 'Analyse complète au format académique' : 'Complete academic reading sheet',
      anim: card1Anim,
    },
    {
      key: 'audio',
      icon: Volume2,
      title: language === 'fr' ? 'Lecture audio' : 'Audio Reading',
      desc: language === 'fr' ? 'Écoute le résumé lu à voix haute' : 'Listen to the summary read aloud',
      anim: card2Anim,
    },
    {
      key: 'flashcards',
      icon: Sparkles,
      title: language === 'fr' ? 'Flash cards' : 'Flash Cards',
      desc: language === 'fr' ? 'Mémorise les points clés du livre' : 'Memorize the key points of the book',
      anim: card3Anim,
    },
  ];

  const handleFeaturePress = (featureKey: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    router.push({ pathname: '/scan', params: { feature: featureKey } });
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0D0D0D' }]} />
      ) : (
        <LinearGradient colors={['#F7E9E3', '#F0DDD5', '#E8D0C5']} style={StyleSheet.absoluteFill} />
      )}
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} isDarkMode={isDarkMode} />
        </View>

        {/* Titre */}
        <Animated.View
          style={[styles.titleSection, {
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }]}
        >
          <Text style={[styles.titleTop, isDarkMode && styles.titleTopDark]}>
            {language === 'fr' ? 'Fonctionnalités' : 'Advanced'}
          </Text>
          <Text style={[styles.titleBottom, { color: colors.primary }]}>
            {language === 'fr' ? 'Avancées' : 'Features'}
          </Text>
          <Text style={[styles.titleDesc, isDarkMode && styles.titleDescDark]}>
            {language === 'fr'
              ? 'Scanne un livre et obtiens instantanément'
              : 'Scan a book and instantly get'}
          </Text>
        </Animated.View>

        {/* Cards */}
        <View style={styles.cardList}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Animated.View
                key={feature.key}
                style={{
                  opacity: feature.anim,
                  transform: [{ translateY: feature.anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
                }}
              >
                <Pressable
                  onPress={() => handleFeaturePress(feature.key)}
                  style={({ pressed }) => [
                    styles.card,
                    isDarkMode && styles.cardDark,
                    pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  {/* Icône */}
                  <LinearGradient
                    colors={colors.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconWrap}
                  >
                    <Icon size={22} color="#FFF" strokeWidth={2} />
                  </LinearGradient>

                  {/* Texte */}
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isDarkMode && styles.cardTitleDark]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.cardDesc, isDarkMode && styles.cardDescDark]}>
                      {feature.desc}
                    </Text>
                  </View>

                  {/* Flèche ou cadenas */}
                  {isPremium ? (
                    <ChevronRight size={20} color={isDarkMode ? '#555' : '#CCC'} strokeWidth={2} />
                  ) : (
                    <Lock size={16} color={isDarkMode ? '#555' : '#CCC'} strokeWidth={2} />
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* CTA premium si non abonné */}
        {!isPremium && (
          <Animated.View style={[styles.ctaWrap, { opacity: card3Anim }]}>
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={styles.ctaBtn}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>
                  {language === 'fr' ? 'Débloquer avec Premium' : 'Unlock with Premium'}
                </Text>
                <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
              </LinearGradient>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
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
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 2,
  },
  titleTop: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: '#3E2723',
    letterSpacing: -0.3,
  },
  titleTopDark: { color: '#DDD' },
  titleBottom: {
    fontSize: 40,
    fontWeight: '900' as const,
    letterSpacing: -1,
    marginTop: -4,
  },
  titleDesc: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 8,
    lineHeight: 20,
  },
  titleDescDark: { color: '#888' },
  cardList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#3E2723',
  },
  cardTitleDark: { color: '#FFF' },
  cardDesc: {
    fontSize: 13,
    color: '#8D6E63',
    lineHeight: 18,
  },
  cardDescDark: { color: '#888' },
  ctaWrap: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  ctaBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
