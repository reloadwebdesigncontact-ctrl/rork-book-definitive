/**
 * AppText — wrapper de Text pour l'app.
 * Police système par défaut (Roboto sur Android).
 */
import React from 'react';
import { Text, TextProps } from 'react-native';

export function AppText({ style, ...props }: TextProps) {
  return <Text style={style} {...props} />;
}
