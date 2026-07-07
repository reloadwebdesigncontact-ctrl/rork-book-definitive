import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import type { AppTheme, ColorPalette } from "@/constants/appThemes";

interface TitleUnderlineProps {
  colors: ColorPalette;
  themeKey: AppTheme;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function TitleUnderline({ colors, themeKey, width = 200, style }: TitleUnderlineProps) {
  const height = 18;
  const gradientStops = colors.gradient;
  const gradientId = `sig-${themeKey}`;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [themeKey, scaleAnim]);

  return (
    <Animated.View
      style={[
        { width, height, alignSelf: "center" },
        style,
        { transform: [{ scaleX: scaleAnim }] },
      ]}
    >
      <Svg width={width} height={height} viewBox="0 0 200 18" fill="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={gradientStops[0]} stopOpacity="0" />
            <Stop offset="0.1" stopColor={gradientStops[0]} stopOpacity="1" />
            <Stop offset="0.6" stopColor={gradientStops[1]} stopOpacity="1" />
            <Stop offset="0.9" stopColor={gradientStops[2]} stopOpacity="1" />
            <Stop offset="1" stopColor={gradientStops[2]} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Courbe fine style signature — monte légèrement puis se termine en pointe */}
        <Path
          d="M 5 12 C 40 10 80 6 130 4 C 160 3 180 3.5 196 4.5"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}
