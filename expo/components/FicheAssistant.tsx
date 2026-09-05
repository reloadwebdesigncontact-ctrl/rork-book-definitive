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
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BTN_SIZE = 72;

// Map des ours par thème
const BEAR_IMAGES: Record<string, ReturnType<typeof require>> = {
  orange:    require('@/assets/images/assistant-bear/assistant-bear-orange.png'),
  red:       require('@/assets/images/assistant-bear/assistant-bear-red.png'),
  purple:    require('@/assets/images/assistant-bear/assistant-bear-purple.png'),
  turquoise: require('@/assets/images/assistant-bear/assistant-bear-turquoise.png'),
  pink:      require('@/assets/images/assistant-bear/assistant-bear-pink.png'),
  yellow:    require('@/assets/images/assistant-bear/assistant-bear-yellow.png'),
  coral:     require('@/assets/images/assistant-bear/assistant-bear-coral.png'),
  lime:      require('@/assets/images/assistant-bear/assistant-bear-lime.png'),
  sunset:    require('@/assets/images/assistant-bear/assistant-bear-sunset.png'),
  dreamy:    require('@/assets/images/assistant-bear/assistant-bear-dreamy.png'),
  neon:      require('@/assets/images/assistant-bear/assistant-bear-neon.png'),
  flamingo:  require('@/assets/images/assistant-bear/assistant-bear-flamingo.png'),
  aurora:    require('@/assets/images/assistant-bear/assistant-bear-aurora.png'),
  ocean:     require('@/assets/images/assistant-bear/assistant-bear-ocean.png'),
  silver:    require('@/assets/images/assistant-bear/assistant-bear-silver.png'),
  gold:      require('@/assets/images/assistant-bear/assistant-bear-gold.png'),
  tropical:  require('@/assets/images/assistant-bear/assistant-bear-tropical.png'),
  peach:     require('@/assets/images/assistant-bear/assistant-bear-peach.png'),
};

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
        pattern: /\b(\d{4}|\d{1,2}(er|ème|e)?\s+siècle|XIXe?|XVIIIe?|XXe?|au\s+\d{4}|\d{4}s?)\b/gi,
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
  const { isDarkMode, colors, appTheme } = useTheme();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Image de l'ours selon le thème actif
  const bearImage = BEAR_IMAGES[appTheme] ?? BEAR_IMAGES['orange'];

  // Position flottante
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BTN_SIZE - 20, y: SCREEN_HEIGHT * 0.55 })).current;

  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5) {
          isDragging.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gs);
      },
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        if (!isDragging.current) {
          // Tap simple → ouvrir le modal
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalOpen(true);
          return;
        }
        // Snap aux bords après drag
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        const snapX = currentX < SCREEN_WIDTH / 2 ? 16 : SCREEN_WIDTH - BTN_SIZE - 16;
        const snapY = Math.max(80, Math.min(currentY, SCREEN_HEIGHT - BTN_SIZE - 80));
        Animated.spring(pan, { toValue: { x: snapX, y: snapY }, useNativeDriver: false, friction: 7 }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <>
      {/* Bouton flottant */}
      <Animated.View
        style={[styles.floatingBtn, { transform: pan.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        {/* Image de l'ours (contient la croix dessinée en haut à droite) */}
        <Image
          source={bearImage}
          style={styles.bearImage}
          resizeMode="contain"
        />

        {/* Zone de tap invisible sur la croix en haut à droite de l'image */}
        <Pressable
          style={styles.crossHitArea}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setVisible(false);
          }}
        />

        {/* Point vert si un surlignage est actif */}
        {activeCommandId && activeCommandId !== 'reset' && (
          <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />
        )}
      </Animated.View>
      </Animated.View>

      {/* Modal des commandes */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={[styles.modalSheet, isDarkMode && styles.modalSheetDark]} onPress={() => {}}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Titre */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: `${colors.primary}20` }]}>
                <Sparkles size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <View>
                <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
                  Assistant de lecture
                </Text>
                <Text style={[styles.modalSubtitle, isDarkMode && styles.modalSubtitleDark]}>
                  Choisis ce que tu veux mettre en évidence
                </Text>
              </View>
            </View>

            {/* Commandes */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.commandList}>
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
                      styles.commandCard,
                      isDarkMode && styles.commandCardDark,
                      isActive && { borderColor: colors.primary, borderWidth: 2 },
                      pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <Text style={styles.commandEmoji}>{cmd.emoji}</Text>
                    <View style={styles.commandText}>
                      <Text style={[styles.commandLabel, isDarkMode && styles.commandLabelDark]}>
                        {cmd.label}
                      </Text>
                      <Text style={[styles.commandDesc, isDarkMode && styles.commandDescDark]}>
                        {cmd.description}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                        <Check size={12} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                    {/* Prévisualisation couleur pour les commandes de surlignage */}
                    {cmd.rules.length > 0 && (
                      <View style={styles.colorDots}>
                        {cmd.rules.map((r) => (
                          <View key={r.id} style={[styles.colorDot, { backgroundColor: r.bgColor }]} />
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
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  bearImage: {
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  // Zone de tap invisible sur la croix dessinée en haut à droite du PNG
  crossHitArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: BTN_SIZE * 0.35,
    height: BTN_SIZE * 0.35,
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  modalSheetDark: {
    backgroundColor: '#1A1A1A',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  modalTitleDark: { color: '#FFF' },
  modalSubtitle: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 1,
  },
  modalSubtitleDark: { color: '#999' },
  commandList: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 16,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  commandCardDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  commandEmoji: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  commandText: {
    flex: 1,
    gap: 2,
  },
  commandLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  commandLabelDark: { color: '#FFF' },
  commandDesc: {
    fontSize: 12,
    color: '#8D6E63',
  },
  commandDescDark: { color: '#999' },
  activeCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDots: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
