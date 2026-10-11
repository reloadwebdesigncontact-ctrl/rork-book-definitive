import React, { useEffect } from 'react';

interface AnimatedSplashProps {
  onFinish: () => void;
}

// Splash screen désactivé — on passe directement à l'app
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  useEffect(() => {
    onFinish();
  }, []);

  return null;
}
