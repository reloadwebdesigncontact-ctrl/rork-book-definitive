import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { colors, isDarkMode } = useTheme();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const scanLine = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(scanLine, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      Animated.delay(600),
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  const scanTranslate = scanLine.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
  const bgColors = isDarkMode
    ? ['#0D0D0D', '#1A1A2E'] as [string, string]
    : ['#FFF8F0', '#F5EBE0'] as [string, string];

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient
          colors={colors.gradient}
          style={[styles.logoContainer, { shadowColor: colors.primary }]}
        >
          <BookOpen size={48} color="#FFF" strokeWidth={2} />
          <Animated.View style={[styles.scanLine, {
            transform: [{ translateY: scanTranslate }],
            opacity: scanLine.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
          }]} />
        </LinearGradient>
        <View style={[styles.logoGlow, { backgroundColor: colors.primary }]} />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textSlide }], alignItems: 'center', gap: 6 }}>
        <Text style={[styles.appName, { color: isDarkMode ? '#FFF' : '#3E2723' }]}>
          <Text style={{ color: isDarkMode ? '#CCC' : '#3E2723' }}>summ</Text>
          <Text style={{ color: colors.primary }}>shine</Text>
        </Text>
        <Text style={[styles.tagline, { color: isDarkMode ? '#888' : '#8D6E63' }]}>
          Lis plus, retiens mieux
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    zIndex: 9999,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
    transform: [{ scale: 1.8 }],
  },
  appName: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
});
