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
        color: '#FFFFFF',
        bgColor: '#E53935',
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
        color: '#FFFFFF',
        bgColor: '#E91E8C',
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
        color: '#FFFFFF',
        bgColor: '#1565C0',
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
        color: '#FFFFFF',
        bgColor: '#6A1B9A',
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
        color: '#FFFFFF',
        bgColor: '#E53935',
        label: 'Date',
      },
      {
        id: 'lieux',
        pattern: /\b(Paris|France|Londres|Rome|Europe|Angleterre|Russie|Allemagne|Italie|Espagne|Amérique|New York|Tokyo|Japon|Chine|Afrique|Orient|Occident|province|ville|village|pays|région|château|manoir|forêt|mer|océan|fleuve|rivière|montagne)\b/gi,
        color: '#FFFFFF',
        bgColor: '#E91E8C',
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
}

export function FicheAssistant({ onCommandSelect, activeCommandId }: FicheAssistantProps) {
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isDragging = useRef(false);
  const posX = useRef(SCREEN_WIDTH - BTN_SIZE - 20);
  const posY = useRef(SCREEN_HEIGHT * 0.55);
  const animX = useRef(new Animated.Value(posX.current)).current;
  const animY = useRef(new Animated.Value(posY.current)).current;

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
        {/* Bouton fermer */}
        <Pressable
          style={styles.closeBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setVisible(false);
          }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>

        {/* Bouton principal */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainBtn}
        >
          <Wand2 size={24} color="#FFF" strokeWidth={2} />
          {activeCommandId && activeCommandId !== 'reset' && (
            <View style={styles.activeDot} />
          )}
        </LinearGradient>
      </Animated.View>

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.sheet, isDarkMode && styles.sheetDark]} onPress={() => {}}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconWrap, { backgroundColor: `${colors.primary}20` }]}>
                <Wand2 size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, isDarkMode && styles.sheetTitleDark]}>
                  Assistant de lecture
                </Text>
                <Text style={[styles.sheetSubtitle, isDarkMode && styles.sheetSubtitleDark]}>
                  Choisis ce que tu veux mettre en évidence
                </Text>
              </View>
            </View>

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
                      isActive && { borderColor: colors.primary, borderWidth: 2 },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.cmdEmoji}>{cmd.emoji}</Text>
                    <View style={styles.cmdText}>
                      <Text style={[styles.cmdLabel, isDarkMode && styles.cmdLabelDark]}>{cmd.label}</Text>
                      <Text style={[styles.cmdDesc, isDarkMode && styles.cmdDescDark]}>{cmd.description}</Text>
                    </View>
                    {isActive && (
                      <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                        <Check size={12} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                    {cmd.rules.length > 0 && (
                      <View style={styles.dots}>
                        {cmd.rules.map((r) => (
                          <View key={r.id} style={[styles.dot, { backgroundColor: r.bgColor }]} />
                        ))}
                      </View>
                    )}
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
  closeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700' as const,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  sheetDark: { backgroundColor: '#1A1A1A' },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
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
    fontWeight: '700' as const,
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
    gap: 10,
    paddingBottom: 16,
  },
  cmdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cmdCardDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
  cmdEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  cmdText: { flex: 1, gap: 2 },
  cmdLabel: { fontSize: 15, fontWeight: '600' as const, color: '#1A1A1A' },
  cmdLabelDark: { color: '#FFF' },
  cmdDesc: { fontSize: 12, color: '#8D6E63' },
  cmdDescDark: { color: '#999' },
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
