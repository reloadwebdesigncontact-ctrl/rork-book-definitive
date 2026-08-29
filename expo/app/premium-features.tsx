import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, FileText, Volume2, Sparkles, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Paywall } from '@/components/Paywall';

export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const features = [
    {
      key: 'summary',
      icon: BookOpen,
      title: language === 'fr' ? 'Résumé par chapitres' : 'Chapter summary',
      desc: language === 'fr' ? 'Résumé détaillé chapitre par chapitre' : 'Detailed chapter-by-chapter summary',
      color: colors.primary,
    },
    {
      key: 'fiche',
      icon: FileText,
      title: language === 'fr' ? 'Fiche de lecture' : 'Reading sheet',
      desc: language === 'fr' ? 'Fiche complète au format académique' : 'Complete sheet in academic format',
      color: colors.secondary,
    },
    {
      key: 'audio',
      icon: Volume2,
      title: language === 'fr' ? 'Lecture audio' : 'Audio reading',
      desc: language === 'fr' ? 'Écoute le résumé lu à voix haute' : 'Listen to the summary read aloud',
      color: colors.tertiary,
    },
    {
      key: 'flashcards',
      icon: Sparkles,
      title: language === 'fr' ? 'Flash cards' : 'Flash cards',
      desc: language === 'fr' ? 'Mémorise les points clés du livre' : 'Memorize the key points of the book',
      color: colors.primary,
    },
  ];

  const handleFeaturePress = (featureKey: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    router.push({
      pathname: '/scan',
      params: { feature: featureKey },
    });
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={[styles.bg, { backgroundColor: '#0D0D0D' }]} />
      ) : (
        <LinearGradient colors={['#F7E9E3', '#F0DDD5', '#E8D0C5']} style={styles.bg} />
      )}
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={isDarkMode ? '#FFF' : '#3E2723'} strokeWidth={2.5} />
          </Pressable>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            {language === 'fr' ? 'Fonctions Premium' : 'Premium Features'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
            {language === 'fr'
              ? 'Choisis une fonction, scanne un livre et obtiens le résultat instantanément.'
              : 'Choose a feature, scan a book and get the result instantly.'}
          </Text>

          {features.map((feature) => (
            <Pressable
              key={feature.key}
              onPress={() => handleFeaturePress(feature.key)}
              style={({ pressed }) => [
                styles.featureCard,
                isDarkMode && styles.featureCardDark,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${feature.color}20` }]}>
                <feature.icon size={28} color={feature.color} strokeWidth={2} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, isDarkMode && styles.featureTitleDark]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, isDarkMode && styles.featureDescDark]}>
                  {feature.desc}
                </Text>
              </View>
              <ChevronRight size={20} color={isDarkMode ? '#666' : '#CCC'} />
            </Pressable>
          ))}

          {/* Bouton scanner directement */}
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/scan');
            }}
            style={styles.scanButton}
          >
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanButtonGradient}
            >
              <Text style={styles.scanButtonText}>
                {language === 'fr' ? '📷 Scanner un livre' : '📷 Scan a book'}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
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
  bg: { position: 'absolute', width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 20, fontWeight: '700' as const, color: '#3E2723',
    flex: 1, textAlign: 'center',
  },
  headerTitleDark: { color: '#FFF' },
  content: { padding: 20, gap: 14 },
  subtitle: {
    fontSize: 14, color: '#8D6E63', textAlign: 'center',
    lineHeight: 20, marginBottom: 8,
  },
  subtitleDark: { color: '#999' },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#FFF', borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  featureCardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    shadowOpacity: 0, elevation: 0,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  featureInfo: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 16, fontWeight: '700' as const, color: '#3E2723' },
  featureTitleDark: { color: '#FFF' },
  featureDesc: { fontSize: 13, color: '#8D6E63' },
  featureDescDark: { color: '#999' },
  scanButton: { borderRadius: 16, overflow: 'hidden', marginTop: 8, elevation: 6 },
  scanButtonGradient: {
    paddingVertical: 16, alignItems: 'center',
  },
  scanButtonText: { fontSize: 16, fontWeight: '700' as const, color: '#FFF' },
});
