import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Share2, Pause, Play } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Speech from 'expo-speech';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const darkenColor = (color: string, percent: number = 30): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const darkenValue = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));
  
  const newR = darkenValue(r).toString(16).padStart(2, '0');
  const newG = darkenValue(g).toString(16).padStart(2, '0');
  const newB = darkenValue(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
};

export default function LyricsReaderScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, t } = useLanguage();
  const { voiceType } = useVoice();
  const { summary, title, author } = useLocalSearchParams<{
    summary: string;
    title: string;
    author: string;
  }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const paragraphRefs = useRef<{ [key: number]: any }>({});
  const isPlayingRef = useRef(false);
  const [isSharing, setIsSharing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const shareButtonScale = useRef(new Animated.Value(1)).current;
  const paragraphAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
  
  const activeColor = colors.primary;
  const darkenedColor = darkenColor(activeColor, 20);

  useEffect(() => {
    if (summary) {
      const cleanedText = summary.replace(/\*/g, '');
      const paragraphArray = cleanedText
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      setParagraphs(paragraphArray);
      
      paragraphArray.forEach((_, index) => {
        paragraphAnimations[index] = new Animated.Value(0);
      });
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      Object.values(paragraphAnimations).forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 100,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    }, 300);
  }, [summary, fadeAnim, paragraphAnimations]);

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(playButtonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      startReading();
    }
  };

  const startReading = () => {
    if (!summary || paragraphs.length === 0) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    setCurrentParagraphIndex(-1);

    const languageCode = language === 'fr' ? 'fr-FR' : 'en-US';
    const cleanedText = summary.replace(/\*/g, '');
    
    const voiceSettings = voiceType === 'male' 
      ? { pitch: 0.7, rate: 0.85 }
      : { pitch: 1.15, rate: 0.9 };

    const totalParagraphs = paragraphs.length;
    const avgCharsPerParagraph = cleanedText.length / totalParagraphs;
    const baseTimePerChar = 60;
    const rateMultiplier = 1 / voiceSettings.rate;
    const timePerParagraph = avgCharsPerParagraph * baseTimePerChar * rateMultiplier;

    let currentIndex = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startParagraphSync = () => {
      setCurrentParagraphIndex(0);
      currentIndex = 0;
      
      intervalId = setInterval(() => {
        if (currentIndex < totalParagraphs - 1 && isPlayingRef.current) {
          currentIndex++;
          setCurrentParagraphIndex(currentIndex);
          
          if (paragraphRefs.current[currentIndex]) {
            paragraphRefs.current[currentIndex]?.measureLayout(
              scrollViewRef.current as any,
              (x: number, y: number) => {
                scrollViewRef.current?.scrollTo({
                  y: Math.max(0, y - SCREEN_HEIGHT / 2 + 100),
                  animated: true,
                });
              },
              () => {}
            );
          }
        } else if (currentIndex >= totalParagraphs - 1) {
          if (intervalId) clearInterval(intervalId);
        }
      }, timePerParagraph);
    };

    setTimeout(startParagraphSync, 300);

    Speech.speak(cleanedText, {
      language: languageCode,
      pitch: voiceSettings.pitch,
      rate: voiceSettings.rate,
      onDone: () => {
        if (intervalId) clearInterval(intervalId);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentParagraphIndex(-1);
      },
      onStopped: () => {
        if (intervalId) clearInterval(intervalId);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentParagraphIndex(-1);
      },
      onError: () => {
        if (intervalId) clearInterval(intervalId);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentParagraphIndex(-1);
      },
    });
  };

  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        Speech.stop();
      }
    };
  }, []);

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(shareButtonScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(shareButtonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const cleanedText = summary?.replace(/\*/g, '').trim() || '';
      const shareContent = `${title || t.audio.title}\n${t.audio.by} ${author || t.audio.author}\n\n${cleanedText}`;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: title || t.audio.title,
          text: shareContent,
        });
        Alert.alert(t.fiche.pdfSuccess, t.fiche.shareSuccess);
      } else {
        const result = await Share.share({
          message: shareContent,
          title: title || t.audio.title,
        });
        
        if (result.action === Share.sharedAction) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('cancel') && !error.message.includes('dismissed')) {
        console.error("Error sharing text:", error);
        Alert.alert(t.fiche.pdfError, t.fiche.shareErrorMessage);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <Pressable 
              onPress={() => router.back()} 
              style={styles.backButton}
              onPressIn={() => {
                Animated.spring(backButtonScale, {
                  toValue: 0.85,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(backButtonScale, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <ArrowLeft size={24} color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{author}</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: shareButtonScale }] }}>
            <Pressable 
              onPress={handleShare} 
              style={styles.downloadButton} 
              disabled={isSharing}
              onPressIn={() => {
                Animated.spring(shareButtonScale, {
                  toValue: 0.85,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(shareButtonScale, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <Share2 size={24} color="#FFF" strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.lyricsContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.paragraphsWrapper}>
              {paragraphs.map((paragraph, index) => (
                <Animated.View
                  key={index}
                  ref={(ref) => { paragraphRefs.current[index] = ref; }}
                  style={[
                    styles.paragraphContainer,
                    {
                      opacity: paragraphAnimations[index] || 1,
                      transform: [{
                        translateY: paragraphAnimations[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }) || 0,
                      }],
                    },
                    currentParagraphIndex === index && {
                      backgroundColor: `${darkenedColor}40`,
                      borderLeftWidth: 4,
                      borderLeftColor: darkenedColor,
                      shadowColor: activeColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      elevation: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paragraph,
                      currentParagraphIndex === index && styles.paragraphTextActive,
                      currentParagraphIndex > index && styles.paragraphTextPassed,
                    ]}
                  >
                    {paragraph}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.controls}>
            <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
              <Pressable onPress={handlePlayPause} style={styles.playButton}>
                <View style={[styles.playButtonInner, { backgroundColor: activeColor }]}>
                  {isPlaying ? (
                    <Pause size={32} color="#FFF" fill="#FFF" />
                  ) : (
                    <Play size={32} color="#FFF" fill="#FFF" />
                  )}
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  lyricsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    minHeight: SCREEN_HEIGHT,
  },
  paragraphsWrapper: {
    width: "100%",
  },
  paragraphContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  paragraph: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 32,
    textAlign: "left",
  },
  paragraphTextActive: {
    color: "rgba(255, 255, 255, 1)",
    fontWeight: "600" as const,
  },
  paragraphTextPassed: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
