import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Image } from 'react-native';

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pas de délai initial — on affiche immédiatement plein écran
    // puis on laisse 1400ms avant de faire le fade-out
    Animated.sequence([
      Animated.delay(1400),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.image}
        resizeMode="cover"
        // Affichage immédiat sans attendre le chargement réseau
        fadeDuration={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
