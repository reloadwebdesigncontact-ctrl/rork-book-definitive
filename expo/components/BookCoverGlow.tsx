import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface BookCoverGlowProps {
  uri: string | undefined;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  onError?: () => void;
  cachePolicy?: 'memory-disk' | 'memory' | 'disk' | 'none';
  noMargin?: boolean;
}

export function BookCoverGlow({
  uri,
  width = '100%',
  height = 320,
  borderRadius = 12,
  onError,
  cachePolicy = 'memory-disk',
  noMargin = false,
}: BookCoverGlowProps) {
  const { colors, isDarkMode } = useTheme();
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulsation douce du glow
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  if (!uri) return null;

  // Couleur de glow basée sur le thème de l'app
  const glowColor = colors.primary;

  return (
    <View style={[styles.container, { width: width as any, height }, noMargin && { marginBottom: 0 }]}>
      {/* Couche de glow floue derrière l'image */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            borderRadius: borderRadius + 8,
            backgroundColor: glowColor,
            opacity: glowAnim.interpolate({
              inputRange: [0.6, 1],
              outputRange: [isDarkMode ? 0.45 : 0.25, isDarkMode ? 0.7 : 0.45],
            }),
            // Simule un blur avec plusieurs ombres empilées
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 24,
            elevation: 20,
          },
        ]}
      />

      {/* Deuxième couche pour amplifier l'effet */}
      <Animated.View
        style={[
          styles.glowLayerInner,
          {
            borderRadius: borderRadius + 4,
            backgroundColor: glowColor,
            opacity: glowAnim.interpolate({
              inputRange: [0.6, 1],
              outputRange: [isDarkMode ? 0.3 : 0.15, isDarkMode ? 0.5 : 0.3],
            }),
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 14,
            elevation: 14,
          },
        ]}
      />

      {/* Image par-dessus */}
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: width as any,
            height,
            borderRadius,
          },
        ]}
        contentFit="cover"
        onError={onError}
        cachePolicy={cachePolicy}
      />

      {/* Bordure lumineuse subtile sur l'image */}
      <Animated.View
        style={[
          styles.border,
          {
            borderRadius,
            borderColor: glowColor,
            opacity: glowAnim.interpolate({
              inputRange: [0.6, 1],
              outputRange: [0.4, 0.8],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowLayer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
  },
  glowLayerInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
  },
  image: {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    zIndex: 2,
  },
});
