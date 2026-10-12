import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import { Check, Wand2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BTN_SIZE = 56;

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
    label: 'Surligner les dates',
    description: 'Toutes les années, siècles et dates',
    emoji: '📅',
    rules: [
      {
        id: 'dates',
        pattern: /\b(\d{4}|\d{1,2}(er|ème|e)?\s+siècle|XIXe?|XVIIIe?|XXe?|\d{4}s?)\b/gi,
        color: '#C0392B',
        bgColor: '#FADBD8',
        label: 'Date',
      },
    ],
  },
  {
    id: 'lieux',
    label: 'Surligner les lieux',
    description: 'Villes, pays, régions mentionnés',
    emoji: '📍',
    rules: [
      {
        id: 'lieux',
        pattern: /\b(Paris|France|Londres|Rome|Europe|Angleterre|Russie|Allemagne|Italie|Espagne|Amérique|New York|Tokyo|Japon|Chine|Afrique|Orient|Occident|province|ville|village|pays|région|château|manoir|forêt|mer|océan|fleuve|rivière|montagne)\b/gi,
        color: '#7D3C98',
        bgColor: '#F0E6F6',
        label: 'Lieu',
      },
    ],
  },
  {
    id: 'personnages',
    label: 'Surligner les personnages',
    description: 'Noms propres de personnes',
    emoji: '👤',
    rules: [
      {
        id: 'personnages',
        pattern: /\b([A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]+(?:\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâéèêëîïôùûüç]+)*)\b/g,
        color: '#1A5276',
        bgColor: '#D6EAF8',
        label: 'Personnage',
      },
    ],
  },
  {
    id: 'themes',
    label: 'Surligner les thèmes',
    description: 'Mots-clés thématiques importants',
    emoji: '💡',
    rules: [
      {
        id: 'themes',
        pattern: /\b(amour|mort|liberté|justice|pouvoir|trahison|honneur|destin|société|guerre|paix|vérité|mensonge|identité|solitude|espoir|désespoir|rédemption|vengeance|sacrifice|famille|religion|foi|nature|art|beauté|temps|mémoire)\b/gi,
        color: '#1E8449',
        bgColor: '#D5F5E3',
        label: 'Thème',
      },
    ],
  },
  {
    id: 'dates_lieux',
    label: 'Dates + Lieux',
    description: 'Combiner les deux surlignages',
    emoji: '🗺️',
    rules: [
      {
        id: 'dates',
        pattern: /\b(\d{4}|\d{1,2}(er|ème|e)?\s+siècle|XIXe?|XVIIIe?|XXe?|\d{4}s?)\b/gi,
        color: '#C0392B',
        bgColor: '#FADBD8',
        label: 'Date',
      },
      {
        id: 'lieux',
        pattern: /\b(Paris|France|Londres|Rome|Europe|Angleterre|Russie|Allemagne|Italie|Espagne|Amérique|New York|Tokyo|Japon|Chine|Afrique|Orient|Occident|province|ville|village|pays|région|château|manoir|forêt|mer|océan|fleuve|rivière|montagne)\b/gi,
        color: '#7D3C98',
        bgColor: '#F0E6F6',
        label: 'Lieu',
      },
    ],
  },
  {
    id: 'reset',
    label: 'Réinitialiser',
    description: 'Retirer tous les surlignages',
    emoji: '🔄',
    rules: [],
  },
];

interface FicheAssistantProps {
  onCommandSelect: (command: AssistantCommand) => void;
  activeCommandId: string | null;
  bearImage?: number | null;
}

export function FicheAssistant({ onCommandSelect, activeCommandId, bearImage }: FicheAssistantProps) {
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isDragging = useRef(false);
  const posX = useRef(SCREEN_WIDTH - BTN_SIZE - 20);
  const posY = useRef(SCREEN_HEIGHT * 0.55);
  const animX = useRef(new Animated.Value(posX.current)).current;
  const animY = useRef(new Animated.Value(posY.current)).current;

  // Animation de lévitation
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        isDragging.current = false;
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5) {
          isDragging.current = true;
        }
        animX.setValue(posX.current + gs.dx);
        animY.setValue(posY.current + gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (!isDragging.current) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalOpen(true);
          return;
        }
        const newX = posX.current + gs.dx;
        const newY = posY.current + gs.dy;
        const snapX = newX < SCREEN_WIDTH / 2 ? 16 : SCREEN_WIDTH - BTN_SIZE - 16;
        const snapY = Math.max(80, Math.min(newY, SCREEN_HEIGHT - BTN_SIZE - 80));
        posX.current = snapX;
        posY.current = snapY;
        Animated.spring(animX, { toValue: snapX, useNativeDriver: false, friction: 7 }).start();
        Animated.spring(animY, { toValue: snapY, useNativeDriver: false, friction: 7 }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[styles.floatingBtn, { left: animX, top: animY }]}
        {...panResponder.panHandlers}
      >
        {/* Bouton principal — ours ou baguette magique */}
        <Animated.View style={[styles.bearWrap, { transform: [{ translateY: floatAnim }] }]}>
          {bearImage ? (
            <Image
              source={bearImage}
              style={styles.bearImage}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainBtn}
            >
              <Wand2 size={24} color="#FFF" strokeWidth={2} />
            </LinearGradient>
          )}

          {/* Croix superposée sur le coin haut-droit de l'image */}
          <Pressable
            style={styles.closeBtn}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setVisible(false);
            }}
          />
        </Animated.View>
        {activeCommandId && activeCommandId !== 'reset' && (
          <View style={styles.activeDot} />
        )}
      </Animated.View>

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.sheet, isDarkMode && styles.sheetDark]} onPress={() => {}}>

            {/* Header avec dégradé */}
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sheetHeaderGradient}
            >
              <View style={styles.sheetHeaderRow}>
                {bearImage && (
                  <Image source={bearImage} style={styles.sheetBearImage} resizeMode="contain" />
                )}
                <View style={styles.sheetHeaderTexts}>
                  <Text style={styles.sheetTitleWhite}>Teddy AI</Text>
                  <Text style={styles.sheetSubtitleWhite}>Assistant de lecture</Text>
                </View>
              </View>
              <Text style={styles.sheetDesc}>
                Choisis ce que tu veux mettre en évidence dans ta fiche
              </Text>
              {/* Handle blanc */}
              <View style={styles.handle} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {ASSISTANT_COMMANDS.map((cmd) => {
                const isActive = activeCommandId === cmd.id;
                return (
                  <Pressable
                    key={cmd.id}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onCommandSelect(cmd);
                      setModalOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.cmdCard,
                      isDarkMode && styles.cmdCardDark,
                      isActive && { borderColor: colors.primary, borderWidth: 2, backgroundColor: `${colors.primary}12` },
                      pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    {/* Emoji dans cercle coloré */}
                    <View style={[styles.cmdEmojiWrap, { backgroundColor: `${colors.primary}18` }]}>
                      <Text style={styles.cmdEmoji}>{cmd.emoji}</Text>
                    </View>
                    <View style={styles.cmdText}>
                      <Text style={[styles.cmdLabel, isDarkMode && styles.cmdLabelDark, isActive && { color: colors.primary }]}>
                        {cmd.label}
                      </Text>
                      <Text style={[styles.cmdDesc, isDarkMode && styles.cmdDescDark]}>{cmd.description}</Text>
                    </View>
                    <View style={styles.cmdRight}>
                      {cmd.rules.length > 0 && (
                        <View style={styles.dots}>
                          {cmd.rules.map((r) => (
                            <View key={r.id} style={[styles.dot, { backgroundColor: r.bgColor }]} />
                          ))}
                        </View>
                      )}
                      {isActive ? (
                        <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                          <Check size={12} color="#FFF" strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={[styles.arrowCircle, isDarkMode && styles.arrowCircleDark]}>
                          <Text style={[styles.arrowText, { color: isDarkMode ? '#888' : '#CCC' }]}>›</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
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
  floatingBtn: {
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
  },
  bearWrap: {
    position: 'relative',
    width: BTN_SIZE + 20,
    height: BTN_SIZE + 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: (BTN_SIZE + 20) * 0.32,
    height: (BTN_SIZE + 20) * 0.32,
    zIndex: 10,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mainBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bearImage: {
    width: BTN_SIZE + 20,
    height: BTN_SIZE + 20,
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.82,
    overflow: 'hidden',
  },
  sheetDark: { backgroundColor: '#161616' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetHeaderGradient: {
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sheetBearImage: {
    width: 60,
    height: 60,
  },
  sheetHeaderTexts: {
    flex: 1,
    gap: 2,
  },
  sheetTitleWhite: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  sheetSubtitleWhite: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  sheetDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
    marginTop: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sheetTitleDark: { color: '#FFF' },
  sheetSubtitle: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 1,
  },
  sheetSubtitleDark: { color: '#999' },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    paddingBottom: 20,
  },
  cmdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cmdCardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  cmdEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cmdEmoji: { fontSize: 22 },
  cmdText: { flex: 1, gap: 3 },
  cmdLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cmdLabelDark: { color: '#FFF' },
  cmdDesc: { fontSize: 12, color: '#8D6E63', lineHeight: 16 },
  cmdDescDark: { color: '#999' },
  cmdRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircleDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2,
  },
  activeCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
