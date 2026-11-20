import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

// TEMPORAIREMENT DÉSACTIVÉ: expo-auth-session Google pour isoler crash
// WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TEMPORAIREMENT DÉSACTIVÉ: Google.useAuthRequest cause crash au démarrage
  // const [, response, promptAsync] = Google.useAuthRequest({...});
  const promptAsync = async () => {
    logger.log('Google Sign-In temporairement désactivé');
  };

  useEffect(() => {
    loadUser();
  }, []);

  // TEMPORAIREMENT DÉSACTIVÉ: response de Google Auth
  /*
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);
  */

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      logger.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await response.json();
      
      const userData: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      logger.error('Error fetching user info:', error);
    }
  };

  const signInWithGoogle = async () => {
    if (Platform.OS === 'web') {
      logger.log('Google Sign-In on web requires additional configuration');
      const mockUser: User = {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        picture: undefined,
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      return;
    }

    try {
      await promptAsync();
    } catch (error) {
      logger.error('Error signing in with Google:', error);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      logger.error('Error signing out:', error);
    }
  };

  return {
    user,
    isLoading,
    signInWithGoogle,
    signOut,
    isSignedIn: !!user,
  };
});

