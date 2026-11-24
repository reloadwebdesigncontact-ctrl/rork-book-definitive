import React from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { AppText } from "@/components/AppText";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView>
            <AppText style={styles.title}>App Error</AppText>
            <AppText style={styles.error}>
              {this.state.error?.message || 'Unknown error'}
            </AppText>
            <AppText style={styles.stack}>
              {this.state.error?.stack || ''}
            </AppText>
            <AppText style={styles.hint}>
              Relance l'app pour réessayer
            </AppText>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FF6B6B',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  stack: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  hint: {
    color: '#FFA726',
    fontSize: 14,
  },
});
