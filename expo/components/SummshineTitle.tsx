import React, { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import type { ColorPalette, AppTheme } from "@/constants/appThemes";
import { useTheme } from "@/contexts/ThemeContext";

interface SummshineProps {
  colors: ColorPalette;
  themeKey: AppTheme;
}

function lerp(a: string, b: string, t: number): string {
  const parse = (s: string) => {
    const h = s.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  };
  const [ar,ag,ab] = parse(a);
  const [br,bg,bb] = parse(b);
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

const FONT = 'Baloo2-SemiBold';
const FS = 44;

export function SummshineTitle({ colors, themeKey }: SummshineProps) {
  const { isDarkMode } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.88);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [themeKey]);

  const summColor = isDarkMode ? '#EDE8E3' : '#3B1F1A';
  const [c0, c1, c2] = colors.gradient;

  // Couleurs interpolées pour chaque lettre de "shine"
  const sc = {
    s: c0,
    h: lerp(c0, c1, 0.25),
    i: lerp(c0, c2, 0.5),
    n: lerp(c1, c2, 0.75),
    e: c2,
  };

  const base = {
    fontFamily: FONT,
    fontSize: FS,
    letterSpacing: -0.5,
    includeFontPadding: false,
  };

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      <View style={styles.row}>
        {/* "summ" en couleur sombre */}
        <Text style={[base, { color: summColor }]}>summ</Text>

        {/* "shine" en dégradé */}
        <Text style={[base, { color: sc.s }]}>s</Text>
        <Text style={[base, { color: sc.h }]}>h</Text>
        <Text style={[base, { color: sc.i }]}>i</Text>
        <Text style={[base, { color: sc.n }]}>n</Text>
        <Text style={[base, { color: sc.e }]}>e</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});
