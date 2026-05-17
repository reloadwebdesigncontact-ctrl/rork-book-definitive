import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Share2 } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FicheScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const { content, title } = useLocalSearchParams<{ content: string; title: string }>();
  const [isSharing, setIsSharing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shareButtonScale = useRef(new Animated.Value(1)).current;
  const shareButtonRotate = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.95)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, contentScale]);

  const shareText = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const cleanedContent = (content || "").replace(/\*\*/g, '').trim();
      const shareContent = `${title || t.fiche.title}\n\n${cleanedContent}`;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: title || t.fiche.title,
          text: shareContent,
        });
        Alert.alert(t.fiche.pdfSuccess, t.fiche.shareSuccess);
      } else {
        const result = await Share.share({
          message: shareContent,
          title: title || t.fiche.title,
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

  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        elements.push(<View key={`space-${key++}`} style={styles.lineSpace} />);
        return;
      }

      const parts: React.ReactElement[] = [];
      let lastIndex = 0;
      const boldPattern = /\*\*([^*]+)\*\*/g;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`text-${key++}`} style={[styles.normalText, isDarkMode && styles.normalTextDark]}>
              {line.substring(lastIndex, match.index)}
            </Text>
          );
        }

        parts.push(
          <Text
            key={`bold-${key++}`}
            style={[
              dynamicStyles.boldText,
              isDarkMode && dynamicStyles.boldTextDark,
            ]}
          >
            {match[1]}
          </Text>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(
          <Text key={`text-${key++}`} style={[styles.normalText, isDarkMode && styles.normalTextDark]}>
            {line.substring(lastIndex)}
          </Text>
        );
      }

      const isSectionTitle = line.startsWith('**') && line.endsWith('**');
      const isListItem = line.trim().startsWith('-') || line.trim().startsWith('•');

      elements.push(
        <Text
          key={`line-${lineIndex}`}
          style={[
            styles.textLine,
            isSectionTitle && styles.sectionTitle,
            isListItem && styles.listItem,
            isDarkMode && styles.textLineDark,
            isDarkMode && isSectionTitle && styles.sectionTitleDark,
          ]}
        >
          {parts}
        </Text>
      );
    });

    return elements;
  };

  const dynamicStyles = {
    boldText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.primary,
      backgroundColor: `${colors.primary}1F`,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    boldTextDark: {
      color: colors.tertiary,
      backgroundColor: `${colors.tertiary}33`,
    },
    titleContainerDynamic: {
      marginBottom: 32,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    titleContainerDynamicDark: {
      borderBottomColor: colors.tertiary,
    },
  };

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <Image
          source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={["#FFF8F0", "#F5EBE0", "#E8D5C4"]}
          style={styles.gradient}
        />
      )}
      <AnimatedBackground />
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
              <ArrowLeft size={24} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]} numberOfLines={1}>{t.fiche.title}</Text>
          <Animated.View style={{ transform: [{ scale: shareButtonScale }, { rotate: shareButtonRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) }] }}>
            <Pressable 
              onPress={shareText} 
              style={styles.exportButton}
              disabled={isSharing}
              onPressIn={() => {
                Animated.parallel([
                  Animated.spring(shareButtonScale, {
                    toValue: 0.85,
                    useNativeDriver: true,
                  }),
                  Animated.spring(shareButtonRotate, {
                    toValue: 1,
                    useNativeDriver: true,
                  }),
                ]).start();
              }}
              onPressOut={() => {
                Animated.parallel([
                  Animated.spring(shareButtonScale, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }),
                  Animated.spring(shareButtonRotate, {
                    toValue: 0,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }),
                ]).start();
              }}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Share2 size={24} color={colors.primary} strokeWidth={2.5} />
              )}
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.animatedContainer,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }, { scale: contentScale }] 
            }
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[
              dynamicStyles.titleContainerDynamic,
              isDarkMode && dynamicStyles.titleContainerDynamicDark,
            ]}>
              <Text style={[styles.mainTitle, isDarkMode && styles.mainTitleDark]}>{title || t.fiche.title}</Text>
            </View>

            <View style={styles.contentContainer}>
              {renderFormattedText(content || "")}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerTitleDark: {
    color: "#FFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  exportButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
  },
  titleContainerDark: {},
  mainTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#3E2723",
    textAlign: "center",
    lineHeight: 36,
  },
  mainTitleDark: {
    color: "#FFF",
  },
  contentContainer: {
    gap: 4,
  },
  textLine: {
    fontSize: 16,
    lineHeight: 28,
    color: "#4E342E",
    marginBottom: 4,
  },
  textLineDark: {
    color: "#E0E0E0",
  },
  normalText: {
    fontSize: 16,
    color: "#4E342E",
  },
  normalTextDark: {
    color: "#E0E0E0",
  },
  boldText: {},
  boldTextDark: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#3E2723",
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 0,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  listItem: {
    paddingLeft: 16,
    marginVertical: 2,
  },
  lineSpace: {
    height: 12,
  },
});
