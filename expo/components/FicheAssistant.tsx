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
import { getBearTheme } from '@/utils/bearTheme';

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
  es: {
    dates: 'Resaltar fechas',
    dates_desc: 'Todos los años, siglos y fechas',
    lieux: 'Resaltar lugares',
    lieux_desc: 'Ciudades, países, regiones mencionados',
    personnages: 'Resaltar personajes',
    personnages_desc: 'Nombres propios de personas',
    themes: 'Resaltar temas',
    themes_desc: 'Palabras clave temáticas importantes',
    dates_lieux: 'Fechas + Lugares',
    dates_lieux_desc: 'Combinar ambos resaltados',
    reset: 'Restablecer',
    reset_desc: 'Eliminar todos los resaltados',
    headerSub: 'Asistente de lectura',
  },
  ar: {
    dates: 'تمييز التواريخ',
    dates_desc: 'جميع السنوات والقرون والتواريخ',
    lieux: 'تمييز الأماكن',
    lieux_desc: 'المدن والبلدان والمناطق المذكورة',
    personnages: 'تمييز الشخصيات',
    personnages_desc: 'أسماء الأعلام',
    themes: 'تمييز المواضيع',
    themes_desc: 'الكلمات المفتاحية الموضوعية المهمة',
    dates_lieux: 'تواريخ + أماكن',
    dates_lieux_desc: 'دمج التمييزين معاً',
    reset: 'إعادة تعيين',
    reset_desc: 'إزالة جميع التمييزات',
    headerSub: 'مساعد القراءة',
  },
  pt: {
    dates: 'Destacar datas',
    dates_desc: 'Todos os anos, séculos e datas',
    lieux: 'Destacar lugares',
    lieux_desc: 'Cidades, países, regiões mencionados',
    personnages: 'Destacar personagens',
    personnages_desc: 'Nomes próprios de pessoas',
    themes: 'Destacar temas',
    themes_desc: 'Palavras-chave temáticas importantes',
    dates_lieux: 'Datas + Lugares',
    dates_lieux_desc: 'Combinar os dois destaques',
    reset: 'Redefinir',
    reset_desc: 'Remover todos os destaques',
    headerSub: 'Assistente de leitura',
  },
  de: {
    dates: 'Daten markieren',
    dates_desc: 'Alle Jahre, Jahrhunderte und Daten',
    lieux: 'Orte markieren',
    lieux_desc: 'Erwähnte Städte, Länder, Regionen',
    personnages: 'Charaktere markieren',
    personnages_desc: 'Eigennamen von Personen',
    themes: 'Themen markieren',
    themes_desc: 'Wichtige thematische Schlüsselwörter',
    dates_lieux: 'Daten + Orte',
    dates_lieux_desc: 'Beide Markierungen kombinieren',
    reset: 'Zurücksetzen',
    reset_desc: 'Alle Markierungen entfernen',
    headerSub: 'Lese-Assistent',
  },
  ja: {
    dates: '日付をハイライト',
    dates_desc: 'すべての年、世紀、日付',
    lieux: '場所をハイライト',
    lieux_desc: '言及された都市、国、地域',
    personnages: 'キャラクターをハイライト',
    personnages_desc: '人物の固有名詞',
    themes: 'テーマをハイライト',
    themes_desc: '重要なテーマキーワード',
    dates_lieux: '日付 + 場所',
    dates_lieux_desc: '両方のハイライトを組み合わせる',
    reset: 'リセット',
    reset_desc: 'すべてのハイライトを削除',
    headerSub: '読書アシスタント',
  },
  zh: {
    dates: '高亮日期',
    dates_desc: '所有年份、世纪和日期',
    lieux: '高亮地点',
    lieux_desc: '提到的城市、国家、地区',
    personnages: '高亮人物',
    personnages_desc: '人名专有名词',
    themes: '高亮主题',
    themes_desc: '重要的主题关键词',
    dates_lieux: '日期 + 地点',
    dates_lieux_desc: '合并两种高亮',
    reset: '重置',
    reset_desc: '删除所有高亮',
    headerSub: '阅读助手',
  },
  ru: {
    dates: 'Выделить даты',
    dates_desc: 'Все годы, века и даты',
    lieux: 'Выделить места',
    lieux_desc: 'Упомянутые города, страны, регионы',
    personnages: 'Выделить персонажей',
    personnages_desc: 'Имена собственные людей',
    themes: 'Выделить темы',
    themes_desc: 'Важные тематические ключевые слова',
    dates_lieux: 'Даты + Места',
    dates_lieux_desc: 'Объединить оба выделения',
    reset: 'Сбросить',
    reset_desc: 'Удалить все выделения',
    headerSub: 'Помощник по чтению',
  },
  ko: {
    dates: '날짜 강조',
    dates_desc: '모든 연도, 세기 및 날짜',
    lieux: '장소 강조',
    lieux_desc: '언급된 도시, 국가, 지역',
    personnages: '캐릭터 강조',
    personnages_desc: '사람의 고유명사',
    themes: '주제 강조',
    themes_desc: '중요한 주제 키워드',
    dates_lieux: '날짜 + 장소',
    dates_lieux_desc: '두 강조 결합',
    reset: '초기화',
    reset_desc: '모든 강조 제거',
    headerSub: '독서 도우미',
  },
  hi: {
    dates: 'तारीखें हाइलाइट करें',
    dates_desc: 'सभी वर्ष, सदियाँ और तारीखें',
    lieux: 'स्थान हाइलाइट करें',
    lieux_desc: 'उल्लिखित शहर, देश, क्षेत्र',
    personnages: 'पात्र हाइलाइट करें',
    personnages_desc: 'व्यक्तियों के उचित नाम',
    themes: 'विषय हाइलाइट करें',
    themes_desc: 'महत्वपूर्ण विषयगत कीवर्ड',
    dates_lieux: 'तारीखें + स्थान',
    dates_lieux_desc: 'दोनों हाइलाइट संयोजित करें',
    reset: 'रीसेट',
    reset_desc: 'सभी हाइलाइट हटाएं',
    headerSub: 'पठन सहायक',
  },
  it: {
    dates: 'Evidenzia le date',
    dates_desc: 'Tutti gli anni, secoli e date',
    lieux: 'Evidenzia i luoghi',
    lieux_desc: 'Città, paesi, regioni menzionati',
    personnages: 'Evidenzia i personaggi',
    personnages_desc: 'Nomi propri di persone',
    themes: 'Evidenzia i temi',
    themes_desc: 'Parole chiave tematiche importanti',
    dates_lieux: 'Date + Luoghi',
    dates_lieux_desc: 'Combina entrambe le evidenziazioni',
    reset: 'Ripristina',
    reset_desc: 'Rimuovi tutte le evidenziazioni',
    headerSub: 'Assistente di lettura',
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
  const i18n = CMD_I18N[language] ?? CMD_I18N['en'];
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const bearUri = `${BEAR_BASE}/assistant-bear-${getBearTheme(appTheme)}.png`;

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
                // Couleur pleine (pas de transparence) pour éviter les artefacts de rendu Android
                const cardBg = isActive
                  ? (isDarkMode ? `${colors.primary}25` : `${colors.primary}18`)
                  : (isDarkMode ? 'rgba(255,255,255,0.07)' : '#FFF');
                const cardBorder = isActive ? colors.primary : 'transparent';
                const cardBorderWidth = isActive ? 2 : 0;

                return (
                  <TouchableOpacity
                    key={cmd.id}
                    onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCommandSelect(cmd); setModalOpen(false); }}
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
  header: { paddingBottom: 10, paddingHorizontal: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'center',
    marginTop: 8, marginBottom: 8,
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
    elevation: 0,
  },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 2, textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 10, paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF', borderRadius: 18, padding: 14,
    borderWidth: 0, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardDark: { backgroundColor: 'rgba(255,255,255,0.07)', shadowOpacity: 0, elevation: 0 },
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
