import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

export type VoiceType = 'male' | 'female';

export const [VoiceProvider, useVoice] = createContextHook(() => {
  const [voiceType, setVoiceType] = useState<VoiceType>('female');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoice();
  }, []);

  const loadVoice = async () => {
    try {
      const storedVoice = await AsyncStorage.getItem("voiceType");
      if (storedVoice !== null) {
        setVoiceType(storedVoice as VoiceType);
      }
    } catch (error) {
      logger.error("Error loading voice type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeVoice = async (newVoice: VoiceType) => {
    setVoiceType(newVoice);
    try {
      await AsyncStorage.setItem("voiceType", newVoice);
    } catch (error) {
      logger.error("Error saving voice type:", error);
    }
  };

  return {
    voiceType,
    changeVoice,
    isLoading,
  };
});

