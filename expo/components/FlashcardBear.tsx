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
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBearTheme } from '@/utils/bearTheme';

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
  { id: 'easy',   emoji: '🌱', label: 'easy',   description: 'easy_desc' },
  { id: 'medium', emoji: '⚡', label: 'medium', description: 'medium_desc' },
  { id: 'hard',   emoji: '🔥', label: 'hard',   description: 'hard_desc' },
];

const DIFF_I18N: Record<string, Record<string, string>> = {
  fr: { easy: 'Facile', easy_desc: 'Questions simples sur les grandes idées du livre', medium: 'Moyen', medium_desc: 'Questions de compréhension avec des nuances', hard: 'Difficile', hard_desc: 'Questions pointues sur les détails et analyses', headerSub: 'Niveau de difficulté', note: '💡 La difficulté sera appliquée à la prochaine génération de questions.' },
  en: { easy: 'Easy', easy_desc: 'Simple questions about the main ideas', medium: 'Medium', medium_desc: 'Comprehension questions with nuance', hard: 'Hard', hard_desc: 'Detailed questions on analysis and specifics', headerSub: 'Difficulty level', note: '💡 Difficulty will be applied on the next question generation.' },
  es: { easy: 'Fácil', easy_desc: 'Preguntas simples sobre las ideas principales', medium: 'Medio', medium_desc: 'Preguntas de comprensión con matices', hard: 'Difícil', hard_desc: 'Preguntas detalladas sobre análisis', headerSub: 'Nivel de dificultad', note: '💡 La dificultad se aplicará en la próxima generación de preguntas.' },
  ar: { easy: 'سهل', easy_desc: 'أسئلة بسيطة عن الأفكار الرئيسية', medium: 'متوسط', medium_desc: 'أسئلة فهم مع فروق دقيقة', hard: 'صعب', hard_desc: 'أسئلة تفصيلية حول التحليل', headerSub: 'مستوى الصعوبة', note: '💡 سيتم تطبيق مستوى الصعوبة على الجولة القادمة.' },
  pt: { easy: 'Fácil', easy_desc: 'Perguntas simples sobre as ideias principais', medium: 'Médio', medium_desc: 'Perguntas de compreensão com nuances', hard: 'Difícil', hard_desc: 'Perguntas detalhadas sobre análise', headerSub: 'Nível de dificuldade', note: '💡 A dificuldade será aplicada na próxima geração de perguntas.' },
  de: { easy: 'Einfach', easy_desc: 'Einfache Fragen zu den Hauptideen', medium: 'Mittel', medium_desc: 'Verständnisfragen mit Nuancen', hard: 'Schwer', hard_desc: 'Detailfragen zur Analyse', headerSub: 'Schwierigkeitsgrad', note: '💡 Der Schwierigkeitsgrad wird bei der nächsten Generierung angewendet.' },
  ja: { easy: '簡単', easy_desc: 'メインアイデアに関するシンプルな質問', medium: '普通', medium_desc: 'ニュアンスのある理解問題', hard: '難しい', hard_desc: '分析に関する詳細な質問', headerSub: '難易度', note: '💡 難易度は次の問題生成に適用されます。' },
  zh: { easy: '简单', easy_desc: '关于主要思想的简单问题', medium: '中等', medium_desc: '有细微差别的理解问题', hard: '困难', hard_desc: '关于分析的详细问题', headerSub: '难度级别', note: '💡 难度将应用于下一次问题生成。' },
  ru: { easy: 'Легко', easy_desc: 'Простые вопросы об основных идеях', medium: 'Средне', medium_desc: 'Вопросы на понимание с нюансами', hard: 'Сложно', hard_desc: 'Детальные вопросы по анализу', headerSub: 'Уровень сложности', note: '💡 Сложность будет применена в следующем поколении вопросов.' },
  ko: { easy: '쉬움', easy_desc: '주요 아이디어에 대한 간단한 질문', medium: '보통', medium_desc: '뉘앙스가 있는 이해 질문', hard: '어려움', hard_desc: '분석에 관한 상세한 질문', headerSub: '난이도', note: '💡 난이도는 다음 질문 생성에 적용됩니다.' },
  hi: { easy: 'आसान', easy_desc: 'मुख्य विचारों पर सरल प्रश्न', medium: 'मध्यम', medium_desc: 'सूक्ष्मताओं के साथ समझ के प्रश्न', hard: 'कठिन', hard_desc: 'विश्लेषण पर विस्तृत प्रश्न', headerSub: 'कठिनाई स्तर', note: '💡 कठिनाई अगली प्रश्न पीढ़ी पर लागू होगी।' },
  it: { easy: 'Facile', easy_desc: 'Domande semplici sulle idee principali', medium: 'Medio', medium_desc: 'Domande di comprensione con sfumature', hard: 'Difficile', hard_desc: 'Domande dettagliate sull\'analisi', headerSub: 'Livello di difficoltà', note: '💡 La difficoltà sarà applicata alla prossima generazione di domande.' },
};

interface FlashcardBearProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function FlashcardBear({ difficulty, onDifficultyChange }: FlashcardBearProps) {
  const { appTheme, colors, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const d18n = DIFF_I18N[language] ?? DIFF_I18N['en'];
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const bearUri = `${BEAR_BASE}/assistant-bear-${getBearTheme(appTheme)}.png`;

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
                <Image
                  source={require('@/assets/images/teddy-ai-logo.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.headerSub}>{d18n.headerSub}</Text>
              </View>
            </LinearGradient>

            {/* Liste des niveaux */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isActive = difficulty === opt.id;
                const cardBg = isActive
                  ? (isDarkMode ? `${colors.primary}25` : `${colors.primary}18`)
                  : (isDarkMode ? 'rgba(255,255,255,0.07)' : '#FFF');
                const cardBorder = isActive ? colors.primary : 'transparent';
                const cardBorderWidth = isActive ? 2 : 0;

                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onDifficultyChange(opt.id);
                      setModalOpen(false);
                    }}
                    activeOpacity={1}
                    style={[
                      styles.card,
                      isDarkMode && styles.cardDark,
                      {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderWidth: cardBorderWidth,
                      },
                    ]}
                  >
                      <View style={[styles.emojiWrap, { backgroundColor: `${colors.primary}18` }]}>
                        <Text style={styles.emoji}>{opt.emoji}</Text>
                      </View>
                      <View style={styles.cardText}>
                        <Text style={[styles.cardLabel, isDarkMode && styles.cardLabelDark, isActive && { color: colors.primary }]}>
                          {d18n[opt.id]}
                        </Text>
                        <Text style={[styles.cardDesc, isDarkMode && styles.cardDescDark]}>
                          {d18n[`${opt.id}_desc`]}
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
                  </TouchableOpacity>
                );
              })}

              {/* Note explicative */}
              <View style={[styles.note, isDarkMode && styles.noteDark]}>
                <Text style={[styles.noteText, isDarkMode && styles.noteTextDark]}>
                  {d18n.note}
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
    paddingBottom: 10,
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
    marginTop: 8,
    marginBottom: 8,
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
  headerLogo: { width: 280, height: 70 },
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
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 2,
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
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: 'transparent',
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
