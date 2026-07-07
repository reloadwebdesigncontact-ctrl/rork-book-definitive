import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const DURATION = 3000;

// Une page du livre avec des lignes de texte
function BookPage({ color, lineColor }: { color: string; lineColor: string }) {
  return (
    <Svg width="80" height="110" viewBox="0 0 80 110">
      {/* Fond de la page */}
      <Rect x="0" y="0" width="80" height="110" rx="4" fill={color} />
      {/* Lignes de texte */}
      <Rect x="8" y="22" width="50" height="7" rx="3.5" fill={lineColor} />
      <Rect x="8" y="38" width="56" height="7" rx="3.5" fill={lineColor} />
      <Rect x="8" y="54" width="44" height="7" rx="3.5" fill={lineColor} />
      <Rect x="8" y="70" width="52" height="7" rx="3.5" fill={lineColor} />
      <Rect x="8" y="86" width="40" height="7" rx="3.5" fill={lineColor} />
    </Svg>
  );
}

// Page animée qui se retourne
function FlippingPage({
  progress,
  startAt,
  endAt,
  gradientColors,
  lineColor,
}: {
  progress: Animated.Value;
  startAt: number;
  endAt: number;
  gradientColors: [string, string];
  lineColor: string;
}) {
  const scaleX = progress.interpolate({
    inputRange: [startAt, (startAt + endAt) / 2, endAt],
    outputRange: [1, 0, -1],
    extrapolate: 'clamp',
  });

  const opacity = progress.interpolate({
    inputRange: [
      Math.max(0, startAt - 0.02),
      startAt,
      endAt,
      Math.min(1, endAt + 0.02),
    ],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.page, { opacity, transform: [{ scaleX }] }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pageGradient}
      >
        {/* Lignes de texte gauche */}
        <View style={styles.linesLeft}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.line, { backgroundColor: lineColor, width: 50 + i * 4 }]} />
          ))}
        </View>
        {/* Séparateur central */}
        <View style={[styles.spine, { backgroundColor: lineColor + '60' }]} />
        {/* Lignes de texte droite */}
        <View style={styles.linesRight}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.line, { backgroundColor: lineColor, width: 50 + i * 4 }]} />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function BookLoader() {
  const { colors } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const g = colors.gradient;
  const lineColor = g[0] + 'AA';

  return (
    <View style={styles.container}>
      {/* Ombre */}
      <View style={[styles.shadow, { backgroundColor: g[0] + '25' }]} />

      {/* Livre ouvert — fond dégradé */}
      <View style={styles.bookWrap}>
        <LinearGradient
          colors={[g[0], g[1], g[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.book}
        >
          {/* Page de base (toujours visible) */}
          <View style={styles.baseContent}>
            {/* Lignes gauche */}
            <View style={styles.linesLeft}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.line, { backgroundColor: 'rgba(255,255,255,0.35)', width: 52 + i * 4 }]} />
              ))}
            </View>
            {/* Séparateur */}
            <View style={[styles.spine, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
            {/* Lignes droite */}
            <View style={styles.linesRight}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.line, { backgroundColor: 'rgba(255,255,255,0.35)', width: 52 + i * 4 }]} />
              ))}
            </View>
          </View>

          {/* Pages animées */}
          {[
            { startAt: 0.1, endAt: 0.3 },
            { startAt: 0.25, endAt: 0.45 },
            { startAt: 0.4, endAt: 0.6 },
            { startAt: 0.55, endAt: 0.75 },
          ].map((cfg, i) => (
            <FlippingPage
              key={i}
              progress={progress}
              startAt={cfg.startAt}
              endAt={cfg.endAt}
              gradientColors={[g[0] + 'CC', g[2] + 'CC']}
              lineColor="rgba(255,255,255,0.5)"
            />
          ))}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shadow: {
    position: 'absolute',
    bottom: -8,
    width: 160,
    height: 20,
    borderRadius: 10,
  },
  bookWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  book: {
    width: 200,
    height: 140,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  baseContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
  },
  page: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pageGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  linesLeft: {
    flex: 1,
    gap: 10,
    alignItems: 'flex-start',
  },
  linesRight: {
    flex: 1,
    gap: 10,
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  line: {
    height: 7,
    borderRadius: 3.5,
  },
  spine: {
    width: 8,
    height: '70%',
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
