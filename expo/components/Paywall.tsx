import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Check, Sparkles, BookOpen, FileText, Volume2, Smartphone, Infinity as InfinityIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/utils/logger';
import { ICON_OPTIONS, ICON_PREVIEWS, changeAppIcon, getSavedIcon, type AppIconKey } from '@/utils/appIcon';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function Paywall({ visible, onClose, onSuccess }: PaywallProps) {
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const {
    currentOffering,
    purchasePackage,
    isPurchasing,
    isRestoring,
    isLoading,
    restorePurchases,
    isPremium,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [selectedIcon, setSelectedIcon] = React.useState<AppIconKey>('orange');

  React.useEffect(() => {
    if (visible && isPremium) {
      void getSavedIcon().then(icon => setSelectedIcon(icon as AppIconKey));
    }
  }, [visible, isPremium]);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const closeButtonScale = React.useRef(new Animated.Value(1)).current;
  const crownFloat = React.useRef(new Animated.Value(0)).current;
  const featureAnims = React.useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(crownFloat, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(crownFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      featureAnims.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: 100 + index * 80,
          useNativeDriver: true,
        }).start();
      });
    } else {
      featureAnims.forEach((anim) => anim.setValue(0));
      crownFloat.setValue(0);
    }
  }, [visible, crownFloat, featureAnims]);

  // Packages RevenueCat
  const monthlyPackage = currentOffering?.availablePackages.find(p => p.identifier === '$rc_monthly');
  const annualPackage  = currentOffering?.availablePackages.find(p => p.identifier === '$rc_annual');
  const lifetimePackage = currentOffering?.availablePackages.find(p => p.identifier === '$rc_lifetime');

  const selectedPackage =
    selectedPlan === 'monthly'  ? monthlyPackage  :
    selectedPlan === 'annual'   ? annualPackage   :
    lifetimePackage;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await purchasePackage(selectedPackage);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (!error.userCancelled) {
        logger.error('Purchase failed:', error);
      }
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const features = language === 'fr' ? [
    { icon: BookOpen,    text: 'Résumés chapitre par chapitre', desc: 'Analyse approfondie' },
    { icon: FileText,    text: 'Fiches de lecture complètes',   desc: 'Format académique' },
    { icon: Volume2,     text: 'Lecture audio illimitée',       desc: 'Écoute partout' },
    { icon: Sparkles,    text: 'Flash cards interactives',      desc: 'Teste tes connaissances' },
    { icon: Smartphone,  text: "Icône de l'app personnalisée",  desc: '17 icônes au choix' },
  ] : [
    { icon: BookOpen,    text: 'Chapter-by-chapter summaries', desc: 'In-depth analysis' },
    { icon: FileText,    text: 'Complete reading sheets',      desc: 'Academic format' },
    { icon: Volume2,     text: 'Unlimited audio reading',      desc: 'Listen anywhere' },
    { icon: Sparkles,    text: 'Interactive flash cards',      desc: 'Test your knowledge' },
    { icon: Smartphone,  text: 'Custom app icon',              desc: '17 icons to choose from' },
  ];

  const plans = [
    {
      key: 'monthly' as const,
      label: language === 'fr' ? 'Mensuel' : 'Monthly',
      price: language === 'fr' ? '4,99 €' : '€4.99',
      period: language === 'fr' ? '/mois' : '/mo',
      badge: null,
      icon: null,
    },
    {
      key: 'annual' as const,
      label: language === 'fr' ? 'Annuel' : 'Annual',
      price: language === 'fr' ? '30 €' : '€30',
      period: language === 'fr' ? '/an' : '/yr',
      badge: language === 'fr' ? '-50%' : '-50%',
      icon: null,
    },
    {
      key: 'lifetime' as const,
      label: language === 'fr' ? 'À vie' : 'Lifetime',
      price: language === 'fr' ? '70 €' : '€70',
      period: language === 'fr' ? 'une fois' : 'once',
      badge: language === 'fr' ? '♾️ À vie' : '♾️ Forever',
      icon: InfinityIcon,
    },
  ];

  const crownTranslateY = crownFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
          <LinearGradient
            colors={isDarkMode
              ? [`${colors.primary}15`, `${colors.secondary}08`, 'transparent']
              : [`${colors.primary}12`, `${colors.secondary}06`, 'transparent']}
            style={styles.headerGlow}
          />

          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={{ width: 40 }} />
            <View style={styles.pillBadge}>
              <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.pillGradient}>
                <Sparkles size={12} color="#FFF" />
                <Text style={styles.pillText}>PREMIUM</Text>
              </LinearGradient>
            </View>
            <Animated.View style={{ transform: [{ scale: closeButtonScale }] }}>
              <Pressable
                style={[styles.closeButton, isDarkMode && styles.closeButtonDark]}
                onPress={onClose}
                onPressIn={() => Animated.spring(closeButtonScale, { toValue: 0.85, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(closeButtonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
              >
                <X size={18} color={isDarkMode ? '#AAA' : '#999'} />
              </Pressable>
            </Animated.View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>

            {/* Header */}
            <View style={styles.header}>
              <Animated.View style={[styles.crownWrap, { transform: [{ translateY: crownTranslateY }] }]}>
                <LinearGradient colors={colors.gradient} style={styles.crownContainer}>
                  <Crown size={36} color="#FFF" strokeWidth={2} />
                </LinearGradient>
                <View style={[styles.crownGlow, { backgroundColor: colors.primary }]} />
              </Animated.View>
              <Text style={[styles.title, isDarkMode && styles.titleDark]}>
                {language === 'fr' ? 'Passez à' : 'Upgrade to'}
              </Text>
              <Text style={[styles.titleAccent, { color: colors.primary }]}>Premium</Text>
              <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
                {language === 'fr' ? 'Débloquez tout le potentiel de Summshine' : 'Unlock the full potential of Summshine'}
              </Text>
            </View>

            {/* Features */}
            <View style={[styles.featuresCard, isDarkMode && styles.featuresCardDark]}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: featureAnims[index],
                    transform: [{ translateX: featureAnims[index].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                  }}
                >
                  <View style={[styles.featureRow, index < features.length - 1 && styles.featureRowBorder, isDarkMode && index < features.length - 1 && styles.featureRowBorderDark]}>
                    <View style={[styles.featureIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                      <feature.icon size={18} color={colors.primary} />
                    </View>
                    <View style={styles.featureTextWrap}>
                      <Text style={[styles.featureText, isDarkMode && styles.featureTextDark]}>{feature.text}</Text>
                      <Text style={[styles.featureDesc, isDarkMode && styles.featureDescDark]}>{feature.desc}</Text>
                    </View>
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Check size={11} color="#FFF" strokeWidth={3} />
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Plans */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : isPremium ? (
              /* Déjà premium — sélecteur d'icône */
              <View style={[styles.iconPickerSection, isDarkMode && styles.iconPickerSectionDark]}>
                <Text style={[styles.iconPickerTitle, isDarkMode && styles.iconPickerTitleDark]}>
                  {language === 'fr' ? "🎨 Choisir l'icône de l'app" : '🎨 Choose app icon'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScrollContent}>
                  {ICON_OPTIONS.map((option) => (
                    <Pressable
                      key={option.key}
                      onPress={async () => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedIcon(option.key);
                        await changeAppIcon(option.key);
                      }}
                      style={[styles.iconOption, selectedIcon === option.key && { borderColor: colors.primary, borderWidth: 3 }]}
                    >
                      <Image source={ICON_PREVIEWS[option.key]} style={styles.iconPreviewImg} resizeMode="contain" />
                      {selectedIcon === option.key && (
                        <View style={[styles.iconCheckBadge, { backgroundColor: colors.primary }]}>
                          <Check size={9} color="#FFF" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <>
                {/* Sélecteur de plan */}
                <View style={styles.plansContainer}>
                  {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.key;
                    const isPopular = plan.key === 'annual';
                    return (
                      <Pressable
                        key={plan.key}
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedPlan(plan.key);
                        }}
                        style={[
                          styles.planCard,
                          isDarkMode && styles.planCardDark,
                          isSelected && { borderColor: colors.primary, borderWidth: 2 },
                          isPopular && styles.planCardPopular,
                        ]}
                      >
                        {isPopular && (
                          <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.popularBadgeText}>
                              {language === 'fr' ? '⭐ Populaire' : '⭐ Popular'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.planCardContent}>
                          <View style={[styles.planRadio, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                            {isSelected && <View style={styles.planRadioDot} />}
                          </View>
                          <View style={styles.planInfo}>
                            <Text style={[styles.planLabel, isDarkMode && styles.planLabelDark]}>{plan.label}</Text>
                            {plan.badge && plan.key !== 'lifetime' && (
                              <View style={[styles.planSaveBadge, { backgroundColor: `${colors.primary}20` }]}>
                                <Text style={[styles.planSaveBadgeText, { color: colors.primary }]}>{plan.badge}</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.planPriceWrap}>
                            <Text style={[styles.planPrice, { color: isSelected ? colors.primary : (isDarkMode ? '#FFF' : '#3E2723') }]}>
                              {plan.price}
                            </Text>
                            <Text style={[styles.planPeriod, isDarkMode && styles.planPeriodDark]}>{plan.period}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Bouton d'achat */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Pressable
                    onPress={() => { animateButton(); void handlePurchase(); }}
                    disabled={isPurchasing || isRestoring || !selectedPackage}
                    style={styles.purchaseButton}
                    testID="paywall-purchase-button"
                  >
                    <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                      {isPurchasing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Crown size={20} color="#FFF" />
                          <Text style={styles.buttonText}>
                            {selectedPlan === 'lifetime'
                              ? (language === 'fr' ? 'Acheter à vie' : 'Buy lifetime access')
                              : (language === 'fr' ? "S'abonner maintenant" : 'Subscribe now')}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </>
            )}

            <Text style={[styles.disclaimer, isDarkMode && styles.disclaimerDark]}>
              {selectedPlan === 'lifetime'
                ? (language === 'fr' ? 'Paiement unique. Accès illimité à vie.' : 'One-time payment. Lifetime access.')
                : (language === 'fr' ? 'Renouvellement automatique. Annulez à tout moment.' : 'Auto-renews. Cancel anytime.')}
            </Text>

            <Pressable
              onPress={async () => { try { await restorePurchases(); onSuccess?.(); onClose(); } catch {} }}
              style={styles.restoreButton}
            >
              <Text style={[styles.restoreText, isDarkMode && styles.restoreTextDark]}>
                {isRestoring
                  ? (language === 'fr' ? 'Restauration...' : 'Restoring...')
                  : (language === 'fr' ? 'Restaurer les achats' : 'Restore purchases')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  containerDark: { backgroundColor: '#1A1A1A' },
  headerGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, zIndex: 10,
  },
  pillBadge: { borderRadius: 20, overflow: 'hidden' },
  pillGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
  pillText: { fontSize: 11, fontWeight: '800' as const, color: '#FFF', letterSpacing: 1.5 },
  closeButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.06)' },
  closeButtonDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  crownWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  crownContainer: { width: 68, height: 68, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  crownGlow: { position: 'absolute', width: 68, height: 68, borderRadius: 22, opacity: 0.2, transform: [{ scale: 1.4 }] },
  title: { fontSize: 22, fontWeight: '600' as const, color: '#5D4037', marginBottom: 2 },
  titleDark: { color: '#CCC' },
  titleAccent: { fontSize: 34, fontWeight: '900' as const, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8D6E63', textAlign: 'center', lineHeight: 20 },
  subtitleDark: { color: '#999' },
  featuresCard: {
    backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6,
    marginBottom: 16, elevation: 0, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.06)',
  },
  featuresCardDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  featureRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  featureRowBorderDark: { borderBottomColor: 'rgba(255,255,255,0.08)' },
  featureIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTextWrap: { flex: 1, gap: 1 },
  featureText: { fontSize: 15, color: '#3E2723', fontWeight: '600' as const },
  featureTextDark: { color: '#FFF' },
  featureDesc: { fontSize: 12, color: '#8D6E63', fontWeight: '400' as const },
  featureDescDark: { color: '#888' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { height: 64, justifyContent: 'center', alignItems: 'center' },

  // Plans
  plansContainer: { gap: 10, marginBottom: 16 },
  planCard: {
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)', overflow: 'hidden',
  },
  planCardDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  planCardPopular: { marginTop: 4 },
  popularBadge: {
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
    borderBottomRightRadius: 10, borderTopLeftRadius: 14,
  },
  popularBadgeText: { fontSize: 11, fontWeight: '700' as const, color: '#FFF' },
  planCardContent: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  planRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  planRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  planInfo: { flex: 1, gap: 4 },
  planLabel: { fontSize: 15, fontWeight: '700' as const, color: '#3E2723' },
  planLabelDark: { color: '#FFF' },
  planSaveBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  planSaveBadgeText: { fontSize: 11, fontWeight: '700' as const },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '800' as const },
  planPeriod: { fontSize: 11, color: '#8D6E63', fontWeight: '500' as const },
  planPeriodDark: { color: '#999' },

  // Bouton
  purchaseButton: { borderRadius: 16, overflow: 'hidden', elevation: 8 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 32, gap: 10 },
  buttonText: { fontSize: 17, fontWeight: '700' as const, color: '#FFF', letterSpacing: 0.3 },
  disclaimer: { fontSize: 11, color: '#BDBDBD', textAlign: 'center', marginTop: 14, letterSpacing: 0.2 },
  disclaimerDark: { color: '#666' },
  restoreButton: { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  restoreText: { fontSize: 13, color: '#BDBDBD', textDecorationLine: 'underline' },
  restoreTextDark: { color: '#666' },

  // Icon picker (premium)
  iconPickerSection: {
    backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 18, padding: 16, marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.06)',
  },
  iconPickerSectionDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' },
  iconPickerTitle: { fontSize: 15, fontWeight: '600' as const, color: '#3E2723', marginBottom: 14, textAlign: 'center' },
  iconPickerTitleDark: { color: '#FFF' },
  iconScrollContent: { gap: 10, paddingHorizontal: 4 },
  iconOption: { width: 58, height: 58, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  iconPreviewImg: { width: '100%', height: '100%', borderRadius: 12 },
  iconCheckBadge: { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
});
