import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import type { AppTheme, ColorPalette } from "@/constants/appThemes";

interface TitleUnderlineProps {
  colors: ColorPalette;
  themeKey: AppTheme;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function TitleUnderline({ colors, themeKey, width = 220, style }: TitleUnderlineProps) {
  const height = Math.round(width * 0.18);
  const gradientStops = colors.gradient;
  const gradientId = `sig-${themeKey}`;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 45,
      useNativeDriver: true,
    }).start();
  }, [themeKey, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width, height },
        style,
        { transform: [{ scaleX: scaleAnim }] },
      ]}
    >
      <Svg width={width} height={height} viewBox="0 0 220 40" fill="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={gradientStops[0]} stopOpacity="0" />
            <Stop offset="0.15" stopColor={gradientStops[0]} stopOpacity="1" />
            <Stop offset="0.55" stopColor={gradientStops[1]} stopOpacity="1" />
            <Stop offset="0.88" stopColor={gradientStops[2]} stopOpacity="0.9" />
            <Stop offset="1" stopColor={gradientStops[2]} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Trait principal style signature — courbe fluide avec variation d'épaisseur */}
        <Path
          d="M 8 28
             C 20 26 40 22 70 19
             C 100 16 130 15 160 16.5
             C 185 17.5 200 19 210 20.5
             C 215 21.2 218 22 219 23
             C 216 22.5 200 20.5 170 19
             C 140 17.5 105 17 75 20
             C 45 23 22 27 9 30
             C 7.5 30.5 7 29.5 8 28 Z"
          fill={`url(#${gradientId})`}
        />

        {/* Petite boucle finale style signature */}
        <Path
          d="M 205 19.5 C 210 18.5 216 18 219 18.5 C 221 19 220 20.5 217 21.5 C 214 22.5 210 22.5 207 22"
          stroke={gradientStops[2]}
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />

        {/* Trait fin en dessous — ombre légère */}
        <Path
          d="M 30 31 C 80 27 140 26 190 28 C 200 28.5 210 29.5 215 30.5"
          stroke={gradientStops[1]}
          strokeWidth={0.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
  },
});
