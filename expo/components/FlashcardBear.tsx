import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PanResponder } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');
const BTN = 72;
const BEAR_BASE = 'https://raw.githubusercontent.com/reloadwebdesigncontact-ctrl/rork-book-definitive/master/expo/assets/images/assistant-bear';

interface FlashcardBearProps {
  /** Appelé quand l'utilisateur tape sur l'ours (sans drag) — sera connecté plus tard */
  onPress?: () => void;
}

export function FlashcardBear({ onPress }: FlashcardBearProps) {
  const { appTheme } = useTheme();
  const [visible, setVisible] = useState(true);

  const bearUri = `${BEAR_BASE}/assistant-bear-${appTheme}.png`;

  const isDragging = useRef(false);
  const posX = useRef(W - BTN - 20);
  const posY = useRef(H * 0.45);
  const animX = useRef(new Animated.Value(posX.current)).current;
  const animY = useRef(new Animated.Value(posY.current)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
          // Tap simple → appeler onPress si fourni
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress?.();
          return;
        }
        // Snap sur le bord le plus proche
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

  if (!visible) return null;

  return (
    <Animated.View
      style={{ position: 'absolute', zIndex: 999, left: animX, top: animY }}
      {...panResponder.panHandlers}
    >
      <Animated.View style={{ transform: [{ translateY: floatAnim }], position: 'relative' }}>
        <Image
          source={{ uri: bearUri }}
          style={{ width: BTN + 16, height: BTN + 16 }}
          resizeMode="contain"
        />
        {/* Zone de tap sur la croix (coin haut-droit du PNG) */}
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: (BTN + 16) * 0.3,
            height: (BTN + 16) * 0.3,
            zIndex: 10,
          }}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setVisible(false);
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
