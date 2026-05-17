import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export function AnimatedBackground() {
  const { colors, animatedBackground, isDarkMode, appTheme } = useTheme();

  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animatedBackground) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(anim1, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim1, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(anim2, { toValue: 1, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim2, { toValue: 0, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(anim3, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim3, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [animatedBackground, anim1, anim2, anim3, opacity, appTheme]);

  if (!animatedBackground) return null;

  const gradient = colors.animatedGradient ?? colors.gradient;
  const [c1, c2, c3] = gradient;
  const orbOpacity = appTheme === 'neon' || appTheme === 'flamingo' ? '75' : '60';

  const translateY1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const translateX1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const scale1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  const translateY2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [0, 80] });
  const translateX2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
  const scale2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });

  const translateY3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
  const translateX3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  const scale3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  const bgColor = isDarkMode ? '#0D0D0D' : '#FAFAFA';

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />

      {/* Orb 1 — top left */}
      <Animated.View style={[
        styles.orb,
        styles.orb1,
        { transform: [{ translateY: translateY1 }, { translateX: translateX1 }, { scale: scale1 }] },
      ]}>
        <LinearGradient
          colors={[`${c1}${orbOpacity}`, `${c2}35`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Orb 2 — bottom right */}
      <Animated.View style={[
        styles.orb,
        styles.orb2,
        { transform: [{ translateY: translateY2 }, { translateX: translateX2 }, { scale: scale2 }] },
      ]}>
        <LinearGradient
          colors={[`${c2}${orbOpacity === '75' ? '65' : '50'}`, `${c3}30`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Orb 3 — center */}
      <Animated.View style={[
        styles.orb,
        styles.orb3,
        { transform: [{ translateY: translateY3 }, { translateX: translateX3 }, { scale: scale3 }] },
      ]}>
        <LinearGradient
          colors={[`${c3}45`, `${c1}25`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  orb1: {
    width: 350,
    height: 350,
    top: -80,
    left: -80,
  },
  orb2: {
    width: 400,
    height: 400,
    bottom: -100,
    right: -100,
  },
  orb3: {
    width: 300,
    height: 300,
    top: '35%',
    left: '20%',
  },
});
