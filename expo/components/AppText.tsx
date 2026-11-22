/**
 * AppText — remplace <Text> partout dans l'app.
 * Applique Baloo2-Regular par défaut (arrondi, fin comme Roboto Regular).
 * Les styles inline passés en prop overrident le fontFamily si besoin.
 */
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function AppText({ style, ...props }: TextProps) {
  return <Text style={[styles.default, style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Baloo2-Regular',
  },
});
