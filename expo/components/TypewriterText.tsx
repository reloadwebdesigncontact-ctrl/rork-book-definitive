import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, TextStyle } from 'react-native';

interface TypewriterTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  delay?: number;        // délai avant de commencer (ms)
  speed?: number;        // intervalle entre chaque lettre (ms)
  opacity?: Animated.Value;
  transform?: object[];
}

export function TypewriterText({
  text,
  style,
  delay = 900,
  speed = 38,
  opacity,
  transform,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);

  // Clignottement du curseur
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [cursorOpacity]);

  // Effet typewriter
  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    setStarted(false);

    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;

    if (indexRef.current >= text.length) return;

    const timer = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [started, text, speed]);

  const isFinished = displayed.length >= text.length;

  const animStyle = {
    ...(opacity !== undefined ? { opacity } : {}),
    ...(transform !== undefined ? { transform } : {}),
  };

  return (
    <Animated.Text style={[style, animStyle]}>
      {displayed}
      {!isFinished && (
        <Animated.Text style={{ opacity: cursorOpacity }}>|</Animated.Text>
      )}
    </Animated.Text>
  );
}
