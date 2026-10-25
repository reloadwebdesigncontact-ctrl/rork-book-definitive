import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { Check, Wand2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: W, height: H } = Dimensions.get('window');
const BTN = 72;
const BEAR_BASE = 'https://raw.githubusercontent.com/reloadwebdesigncontact-ctrl/rork-book-definitive/master/expo/assets/images/assistant-bear';

export type HighlightRule = {
  id: string;
  pattern: RegExp;
  color: string;
  bgColor: string;
  label: string;
};

export type AssistantCommand = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  rules: HighlightRule[];
};

export const ASSISTANT_COMMANDS: AssistantCommand[] = [
  {
    id: 'dates',
    label: 'dates',
    description: 'dates_desc',
    emoji: '📅',
    rules: [{
      id: 'dates',
      pattern: /\b(\d{4}|\d{1,2}(er|ème|e)?\s+siècle|XIXe?|XVIIIe?|XXe?|\d{4}s?)\b/gi,
      color: '#C0392B', bgColor: '#FADBD8', label: 'Date',
    }],
  },
  {
    id: 'lieux',
    label: 'lieux',
    description: 'lieux_desc',
    emoji: '📍',
    rules: [{
      id: 'lieux',
      pattern: /\b(Paris|France|Londres|Rome|Europe|Angleterre|Russie|Allemagne|Italie|Espagne|Amérique|New York|Tokyo|Japon|Chine|Afrique|Orient|Occident|province|ville|village|pays|région|château|manoir|forêt|mer|océan|fleuve|rivière|montagne)\b/gi,
      color: '#7D3C98', bgColor: '#F0E6F6', label: 'Lieu',
    }],
  },
  {
    id: 'personnages',
    label: 'personnages',
    description: 'personnages_desc',
    emoji: '👤',
    rules: [{
      id: 'personnages',
      pattern: /\b(?!(?:Le|La|Les|Un|Une|Des|Du|De|En|Au|Aux|Et|Ou|Car|Mais|Il|Elle|Ils|Elles|Ce|Cet|Cette|Ces|Mon|Ma|Mes|Son|Sa|Ses|Leur|Leurs|Tout|Tous|Toute|Toutes|Plus|Très|Bien|Mal|Non|Oui|Par|Sur|Sous|Dans|Avec|Sans|Vers|Pour|Que|Qui|Quoi|Dont|Où|Si|Alors|Ainsi|Après|Avant|Comme|Même|Puis|Donc|Or|Ni)\b)([A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]{2,}(?:\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]{2,})?)\b/g,
      color: '#1A5276', bgColor: '#D6EAF8', label: 'Personnage',
    }],
  },
  {
    id: 'themes',
    label: 'themes',
    description: 'themes_desc',
    emoji: '💡',
    rules: [{
      id: 'themes',
      pattern: /\b(amour|mort|liberté|justice|pouvoir|trahison|honneur|destin|société|guerre|paix|vérité|mensonge|identité|solitude|espoir|désespoir|rédemption|vengeance|sacrifice|famille|religion|foi|nature|art|beauté|temps|mémoire)\b/gi,
      color: '#1E8449', bgColor: '#D5F5E3', label: 'Thème',
    }],
  },
  {
    id: 'dates_lieux',
    label: 'dates_lieux',
    description: 'dates_lieux_desc',
    emoji: '🗺️',
    rules: [
      { id: 'dates', pattern: /\b(\d{4}|\d{1,2}(er|ème|e)?\s+siècle|XIXe?|XVIIIe?|XXe?|\d{4}s?)\b/gi, color: '#C0392B', bgColor: '#FADBD8', label: 'Date' },
      { id: 'lieux', pattern: /\b(Paris|France|Londres|Rome|Europe|Angleterre|Russie|Allemagne|Italie|Espagne|Amérique|New York|Tokyo|Japon|Chine|Afrique|Orient|Occident|province|ville|village|pays|région|château|manoir|forêt|mer|océan|fleuve|rivière|montagne)\b/gi, color: '#7D3C98', bgColor: '#F0E6F6', label: 'Lieu' },
    ],
  },
  {
    id: 'reset',
    label: 'reset',
    description: 'reset_desc',
    emoji: '🔄',
    rules: [],
  },
];

// Traductions des labels et descriptions selon la langue
const CMD_I18N: Record<string, Record<string, string>> = {
  fr: {
    dates: 'Surligner les dates',
    dates_desc: 'Toutes les années, siècles et dates',
    lieux: 'Surligner les lieux',
    lieux_desc: 'Villes, pays, régions mentionnés',
    personnages: 'Surligner les personnages',
    personnages_desc: 'Noms propres de personnes',
    themes: 'Surligner les thèmes',
    themes_desc: 'Mots-clés thématiques importants',
    dates_lieux: 'Dates + Lieux',
    dates_lieux_desc: 'Combiner les deux surlignages',
    reset: 'Réinitialiser',
    reset_desc: 'Retirer tous les surlignages',
    headerSub: 'Assistant de lecture',
  },
  en: {
    dates: 'Highlight dates',
    dates_desc: 'All years, centuries and dates',
    lieux: 'Highlight places',
    lieux_desc: 'Cities, countries, regions mentioned',
    personnages: 'Highlight characters',
    personnages_desc: 'Proper names of people',
    themes: 'Highlight themes',
    themes_desc: 'Important thematic keywords',
    dates_lieux: 'Dates + Places',
    dates_lieux_desc: 'Combine both highlights',
    reset: 'Reset',
    reset_desc: 'Remove all highlights',
    headerSub: 'Reading assistant',
  },
};

interface FicheAssistantProps {
  onCommandSelect: (command: AssistantCommand) => void;
  activeCommandId: string | null;
  bearImage?: number | { uri: string } | null;
}

export function FicheAssistant({ onCommandSelect, activeCommandId }: FicheAssistantProps) {
  const { isDarkMode, colors, appTheme } = useTheme();
  const { language } = useLanguage();
  const i18n = CMD_I18N[language] ?? CMD_I18N['fr'];
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const bearUri = `${BEAR_BASE}/assistant-bear-${appTheme}.png`;

  const isDragging = useRef(false);
  const posX = useRef(W - BTN - 20);
  const posY = useRef(H * 0.55);
  const animX = useRef(new Animated.Value(posX.current)).current;
  const animY = useRef(new Animated.Value(posY.current)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowLogoAnim = useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowLogoAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowLogoAnim, { toValue: 0.35, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim, glowLogoAnim]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
    onPanResponderGrant: () => { isDragging.current = false; },
    onPanResponderMove: (_, gs) => {
      if (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5) isDragging.current = true;
      animX.setValue(posX.current + gs.dx);
      animY.setValue(posY.current + gs.dy);
    },
    onPanResponderRelease: (_, gs) => {
      if (!isDragging.current) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setModalOpen(true);
        return;
      }
      const nx = posX.current + gs.dx;
      const ny = posY.current + gs.dy;
      const sx = nx < W / 2 ? 16 : W - BTN - 16;
      const sy = Math.max(80, Math.min(ny, H - BTN - 80));
      posX.current = sx; posY.current = sy;
      Animated.spring(animX, { toValue: sx, useNativeDriver: false, friction: 7 }).start();
      Animated.spring(animY, { toValue: sy, useNativeDriver: false, friction: 7 }).start();
    },
  })).current;

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[styles.fab, { left: animX, top: animY }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.bearWrap, { transform: [{ translateY: floatAnim }] }]}>
          <Image
            source={{ uri: bearUri }}
            style={{ width: BTN + 16, height: BTN + 16 }}
            resizeMode="contain"
          />
          {/* Zone de tap invisible superposée sur la croix de l'image (coin haut-droit) */}
          <Pressable
            style={styles.closeBtn}
            onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setVisible(false); }}
          />
          {activeCommandId && activeCommandId !== 'reset' && <View style={styles.dot} />}
        </Animated.View>
      </Animated.View>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.sheet, isDarkMode && styles.sheetDark]} onPress={() => {}}>
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerCenter}>
                <Image
                  source={require('@/assets/images/teddy-ai-logo.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.headerSub}>{i18n.headerSub}</Text>
              </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {ASSISTANT_COMMANDS.map((cmd) => {
                const isActive = activeCommandId === cmd.id;
                const cardBg = isActive
                  ? `${colors.primary}12`
                  : isDarkMode ? 'rgba(255,255,255,0.07)' : '#FFF';
                const cardBorder = isActive ? colors.primary : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                const cardBorderWidth = isActive ? 2 : 1.5;

                return (
                  <View
                    key={cmd.id}
                    style={[
                      styles.card,
                      {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderWidth: cardBorderWidth,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCommandSelect(cmd); setModalOpen(false); }}
                      activeOpacity={0.7}
                      style={styles.cardInner}
                    >
                      <View style={[styles.emojiWrap, { backgroundColor: `${colors.primary}18` }]}>
                        <Text style={styles.emoji}>{cmd.emoji}</Text>
                      </View>
                      <View style={styles.cardText}>
                        <Text style={[styles.cardLabel, isDarkMode && styles.cardLabelDark, isActive && { color: colors.primary }]}>{i18n[cmd.label] ?? cmd.label}</Text>
                        <Text style={[styles.cardDesc, isDarkMode && styles.cardDescDark]}>{i18n[cmd.description] ?? cmd.description}</Text>
                      </View>
                      <View style={styles.cardRight}>
                        {cmd.rules.length > 0 && (
                          <View style={styles.dots}>
                            {cmd.rules.map(r => <View key={r.id} style={[styles.colorDot, { backgroundColor: r.bgColor, borderColor: r.color, borderWidth: 1 }]} />)}
                          </View>
                        )}
                        {isActive
                          ? <View style={[styles.check, { backgroundColor: colors.primary }]}><Check size={12} color="#FFF" strokeWidth={3} /></View>
                          : <View style={[styles.arrow, isDarkMode && styles.arrowDark]}><Text style={[styles.arrowTxt, { color: isDarkMode ? '#666' : '#CCC' }]}>›</Text></View>
                        }
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', zIndex: 999 },
  bearWrap: {
    position: 'relative',
  },
  fabBtn: {
    width: BTN,
    height: BTN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: (BTN + 16) * 0.3,
    height: (BTN + 16) * 0.3,
    zIndex: 10,
    // Invisible — zone de tap sur la croix dessinée dans le PNG
  },
  dot: {
    position: 'absolute', top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF',
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FAFAFA', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 32, maxHeight: H * 0.82, overflow: 'hidden',
  },
  sheetDark: { backgroundColor: '#161616' },
  header: { paddingBottom: 20, paddingHorizontal: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'center',
    marginTop: 10, marginBottom: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerCenter: {
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  headerIcon: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  headerLogo: { width: 240, height: 60 },
  logoGlow: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -110,
    width: 220,
    height: 72,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 0,
  },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 4, textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 10, paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 18, padding: 0,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  cardDark: { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.08)', shadowOpacity: 0, elevation: 0 },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: 'transparent',
  },
  emojiWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 22 },
  cardText: { flex: 1, gap: 3 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardLabelDark: { color: '#FFF' },
  cardDesc: { fontSize: 12, color: '#8D6E63', lineHeight: 16 },
  cardDescDark: { color: '#999' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dots: { flexDirection: 'row', gap: 4 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  check: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  arrow: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  arrowDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  arrowTxt: { fontSize: 18, fontWeight: '600', marginTop: -2 },
});
