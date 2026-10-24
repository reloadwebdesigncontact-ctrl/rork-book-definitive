import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: W, height: H } = Dimensions.get('window');
const BTN = 72;
const BEAR_BASE =
  'https://raw.githubusercontent.com/reloadwebdesigncontact-ctrl/rork-book-definitive/master/expo/assets/images/assistant-bear';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyOption {
  id: Difficulty;
  emoji: string;
  label: string;
  description: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'easy',
    emoji: '🌱',
    label: 'Facile',
    description: 'Questions simples sur les grandes idées du livre',
  },
  {
    id: 'medium',
    emoji: '⚡',
    label: 'Moyen',
    description: 'Questions de compréhension avec des nuances',
  },
  {
    id: 'hard',
    emoji: '🔥',
    label: 'Difficile',
    description: 'Questions pointues sur les détails et analyses',
  },
];

interface FlashcardBearProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function FlashcardBear({ difficulty, onDifficultyChange }: FlashcardBearProps) {
  const { appTheme, colors, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const bearUri = `${BEAR_BASE}/assistant-bear-${appTheme}.png`;

  const isDragging = useRef(false);
  const posX = useRef(W - BTN - 20);
  const posY = useRef(H * 0.45);
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        isDragging.current = false;
      },
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
        posX.current = sx;
        posY.current = sy;
        Animated.spring(animX, { toValue: sx, useNativeDriver: false, friction: 7 }).start();
        Animated.spring(animY, { toValue: sy, useNativeDriver: false, friction: 7 }).start();
      },
    })
  ).current;

  // Label de la difficulté actuelle pour l'indicateur sur l'ours
  const currentDiff = DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)!;

  if (!visible) return null;

  return (
    <>
      {/* Ours flottant */}
      <Animated.View
        style={[styles.fab, { left: animX, top: animY }]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={{ transform: [{ translateY: floatAnim }], position: 'relative' }}>
          <Image
            source={{ uri: bearUri }}
            style={{ width: BTN + 16, height: BTN + 16 }}
            resizeMode="contain"
          />
          {/* Badge difficulté */}
          <View style={[styles.diffBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.diffBadgeEmoji}>{currentDiff.emoji}</Text>
          </View>
          {/* Croix de fermeture */}
          <Pressable
            style={styles.closeZone}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setVisible(false);
            }}
          />
        </Animated.View>
      </Animated.View>

      {/* Modal difficulté */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.sheet, isDarkMode && styles.sheetDark]} onPress={() => {}}>

            {/* Header dégradé */}
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.handle} />
              <View style={styles.headerCenter}>
                <Animated.View style={[styles.logoGlow, { opacity: glowLogoAnim }]} />
                <Image
                  source={require('@/assets/images/teddy-ai-logo.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.headerSub}>
                  {language === 'fr' ? 'Niveau de difficulté' : 'Difficulty level'}
                </Text>
              </View>
            </LinearGradient>

            {/* Liste des niveaux */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isActive = difficulty === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onDifficultyChange(opt.id);
                      setModalOpen(false);
                    }}
                    android_ripple={null}
                    style={({ pressed }) => [
                      styles.card,
                      isDarkMode && styles.cardDark,
                      isActive && {
                        borderColor: colors.primary,
                        borderWidth: 2,
                        backgroundColor: `${colors.primary}12`,
                      },
                      pressed && !isActive && { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)' },
                      pressed && isActive && { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <View style={[styles.emojiWrap, { backgroundColor: `${colors.primary}18` }]}>
                      <Text style={styles.emoji}>{opt.emoji}</Text>
                    </View>
                    <View style={styles.cardText}>
                      <Text
                        style={[
                          styles.cardLabel,
                          isDarkMode && styles.cardLabelDark,
                          isActive && { color: colors.primary },
                        ]}
                      >
                        {language === 'fr' ? opt.label : opt.id === 'easy' ? 'Easy' : opt.id === 'medium' ? 'Medium' : 'Hard'}
                      </Text>
                      <Text style={[styles.cardDesc, isDarkMode && styles.cardDescDark]}>
                        {language === 'fr'
                          ? opt.description
                          : opt.id === 'easy'
                            ? 'Simple questions about the main ideas'
                            : opt.id === 'medium'
                              ? 'Comprehension questions with nuance'
                              : 'Detailed questions on analysis and specifics'}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      {isActive ? (
                        <View style={[styles.check, { backgroundColor: colors.primary }]}>
                          <Check size={12} color="#FFF" strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={[styles.arrow, isDarkMode && styles.arrowDark]}>
                          <Text style={[styles.arrowTxt, { color: isDarkMode ? '#666' : '#CCC' }]}>›</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}

              {/* Note explicative */}
              <View style={[styles.note, isDarkMode && styles.noteDark]}>
                <Text style={[styles.noteText, isDarkMode && styles.noteTextDark]}>
                  {language === 'fr'
                    ? '💡 La difficulté sera appliquée à la prochaine génération de questions.'
                    : '💡 Difficulty will be applied on the next question generation.'}
                </Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', zIndex: 999 },
  diffBadge: {
    position: 'absolute',
    bottom: 4,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  diffBadgeEmoji: { fontSize: 10 },
  closeZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: (BTN + 16) * 0.3,
    height: (BTN + 16) * 0.3,
    zIndex: 10,
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
    maxHeight: H * 0.72,
    overflow: 'hidden',
  },
  sheetDark: { backgroundColor: '#161616' },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerCenter: {
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  },
  headerLogo: { width: 200, height: 48 },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    paddingBottom: 20,
  },
  card: {
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
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 22 },
  cardText: { flex: 1, gap: 3 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardLabelDark: { color: '#FFF' },
  cardDesc: { fontSize: 12, color: '#8D6E63', lineHeight: 16 },
  cardDescDark: { color: '#999' },
  cardRight: { flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  arrowTxt: { fontSize: 18, fontWeight: '600', marginTop: -2 },
  note: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noteDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
  noteText: { fontSize: 13, color: '#8D6E63', lineHeight: 18, textAlign: 'center' },
  noteTextDark: { color: '#999' },
});
