import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import type { AppTheme, ColorPalette } from "@/constants/appThemes";

interface TitleUnderlineProps {
  colors: ColorPalette;
  themeKey: AppTheme;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Trait de soulignement style coup de pinceau, en dégradé selon le thème actif.
 */
export function TitleUnderline({ colors, themeKey, width = 228, style }: TitleUnderlineProps) {
  const height = Math.round(width * 0.13);
  const gradientStops = colors.animatedGradient ?? colors.gradient;
  const gradientId = `title-underline-${themeKey}`;

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 260 32" fill="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={gradientStops[0]} />
            <Stop offset="0.45" stopColor={gradientStops[1]} />
            <Stop offset="1" stopColor={gradientStops[2]} />
          </LinearGradient>
        </Defs>

        {/* Corps principal — épais à gauche, effilé à droite */}
        <Path
          d="M 10 21.5 C 8 20.5 7.5 18.5 9.5 17.2 C 52 11.5 108 10 168 12.8 C 205 14.2 232 15.2 246 15.8 L 254 16.2 L 256 16.4 C 242 17.2 205 16 168 14.8 C 108 13.2 52 15.5 11 21.2 C 10.2 21.8 9.8 21.8 10 21.5 Z"
          fill={`url(#${gradientId})`}
        />

        {/* Mèches fines à l'extrémité droite */}
        <Path
          d="M 248 15.6 C 252 15.8 256 16.2 258.5 16.8"
          stroke={gradientStops[2]}
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <Path
          d="M 250 16.8 C 254 17 257.5 17.5 259.5 18.2"
          stroke={gradientStops[2]}
          strokeWidth={0.9}
          strokeLinecap="round"
          fill="none"
          opacity={0.65}
        />
        <Path
          d="M 251.5 18 C 255 18.3 258 18.8 260 19.5"
          stroke={gradientStops[1]}
          strokeWidth={0.55}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
  },
});
