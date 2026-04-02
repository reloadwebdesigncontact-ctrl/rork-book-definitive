import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Type, Minus, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MIN_SIZE = 14;
const MAX_SIZE = 26;
const INITIAL_SIZE = 18;

export default function FullSummaryScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const { summary, title, author, summaryType } = useLocalSearchParams<{
    summary: string;
    title: string;
    author: string;
    summaryType: string;
  }>();

  const [textSize, setTextSize] = useState(INITIAL_SIZE);
  const [showTextSizer, setShowTextSizer] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const closeButtonScale = useRef(new Animated.Value(1)).current;
  const textSizeButtonScale = useRef(new Animated.Value(1)).current;
  const sizerFade = useRef(new Animated.Value(0)).current;
  const sizerSlide = useRef(new Animated.Value(-10)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.97)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const minusBtnScale = useRef(new Animated.Value(1)).current;
  const plusBtnScale = useRef(new Animated.Value(1)).current;
  const sizeTextPop = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value((INITIAL_SIZE - MIN_SIZE) / (MAX_SIZE - MIN_SIZE))).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, titleFade, titleSlide, footerFade, contentScale, headerFade]);

  const toggleTextSizer = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showTextSizer) {
      Animated.parallel([
        Animated.timing(sizerFade, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sizerSlide, {
          toValue: -10,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setShowTextSizer(false));
    } else {
      setShowTextSizer(true);
      sizerSlide.setValue(-10);
      Animated.parallel([
        Animated.timing(sizerFade, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sizerSlide, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTextSizer, sizerFade, sizerSlide]);

  const animateSizeChange = useCallback((newSize: number) => {
    const newProgress = (newSize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
    Animated.spring(progressAnim, {
      toValue: newProgress,
      friction: 10,
      tension: 80,
      useNativeDriver: false,
    }).start();

    sizeTextPop.setValue(1.3);
    Animated.spring(sizeTextPop, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [progressAnim, sizeTextPop]);

  const stepTextSize = useCallback((direction: 'up' | 'down') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTextSize(prev => {
      const newSize = direction === 'up'
        ? Math.min(MAX_SIZE, prev + 1)
        : Math.max(MIN_SIZE, prev - 1);
      animateSizeChange(newSize);
      return newSize;
    });
  }, [animateSizeChange]);

  const handleMinusPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(minusBtnScale, { toValue: 0.8, duration: 60, useNativeDriver: true }),
      Animated.spring(minusBtnScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
    stepTextSize('down');
  }, [stepTextSize, minusBtnScale]);

  const handlePlusPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(plusBtnScale, { toValue: 0.8, duration: 60, useNativeDriver: true }),
      Animated.spring(plusBtnScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();
    stepTextSize('up');
  }, [stepTextSize, plusBtnScale]);

  const wordCount = (summary || "").split(/\s+/).filter(Boolean).length;

  const displayTitle = summaryType === 'chapter'
    ? `${title || ''} - ${language === 'fr' ? 'Résumé par Chapitre' : 'Chapter by Chapter Summary'}`
    : `${title || ''} - ${language === 'fr' ? 'Résumé' : 'Summary'}`;

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        elements.push(<View key={`space-${key++}`} style={fStyles.lineSpace} />);
        return;
      }

      const parts: React.ReactElement[] = [];
      let lastIndex = 0;
      const boldPattern = /\*\*([^*]+)\*\*/g;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <Text key={`text-${key++}`} style={[fStyles.normalText, { fontSize: textSize, lineHeight: textSize * 1.7 }, isDarkMode && fStyles.normalTextDark]}>
              {line.substring(lastIndex, match.index)}
            </Text>
          );
        }
        parts.push(
          <Text key={`bold-${key++}`} style={[fStyles.boldText, { fontSize: textSize + 1, color: colors.primary }, isDarkMode && { color: colors.tertiary }]}>
            {match[1]}
          </Text>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(
          <Text key={`text-${key++}`} style={[fStyles.normalText, { fontSize: textSize, lineHeight: textSize * 1.7 }, isDarkMode && fStyles.normalTextDark]}>
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
            fStyles.textLine,
            { fontSize: textSize, lineHeight: textSize * 1.7 },
            isSectionTitle && fStyles.sectionTitle,
            isListItem && fStyles.listItem,
            isDarkMode && fStyles.textLineDark,
            isDarkMode && isSectionTitle && fStyles.sectionTitleDark,
          ]}
        >
          {parts}
        </Text>
      );
    });

    return elements;
  };

  const isAtMin = textSize <= MIN_SIZE;
  const isAtMax = textSize >= MAX_SIZE;

  return (
    <View style={fStyles.container}>
      {isDarkMode ? (
        <Image
          source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
          style={fStyles.backgroundImage}
          contentFit="cover"
        />
      ) : (
        <LinearGradient
          colors={["#FFF8F0", "#F5EBE0", "#E8D5C4"]}
          style={fStyles.gradient}
        />
      )}
      <SafeAreaView style={fStyles.safeArea}>
        <Animated.View style={[fStyles.header, { opacity: headerFade }]}>
          <Animated.View style={{ transform: [{ scale: closeButtonScale }] }}>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={[fStyles.headerButton, isDarkMode && fStyles.headerButtonDark]}
              onPressIn={() => {
                Animated.spring(closeButtonScale, { toValue: 0.85, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(closeButtonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
              }}
            >
              <X size={20} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>

          <View style={fStyles.headerRight}>
            <Animated.View style={{ transform: [{ scale: textSizeButtonScale }] }}>
              <Pressable
                onPress={toggleTextSizer}
                style={[
                  fStyles.headerButton,
                  isDarkMode && fStyles.headerButtonDark,
                  showTextSizer && { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : `${colors.primary}18` },
                ]}
                onPressIn={() => {
                  Animated.spring(textSizeButtonScale, { toValue: 0.85, useNativeDriver: true }).start();
                }}
                onPressOut={() => {
                  Animated.spring(textSizeButtonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
                }}
              >
                <Type size={18} color={showTextSizer ? colors.primary : (isDarkMode ? "#FFF" : "#3E2723")} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>

        {showTextSizer && (
          <Animated.View style={[
            fStyles.textSizerBar,
            isDarkMode && fStyles.textSizerBarDark,
            { opacity: sizerFade, transform: [{ translateY: sizerSlide }] },
          ]}>
            <Animated.View style={{ transform: [{ scale: minusBtnScale }] }}>
              <Pressable
                onPress={handleMinusPress}
                disabled={isAtMin}
                style={[
                  fStyles.stepButton,
                  isDarkMode && fStyles.stepButtonDark,
                  isAtMin && fStyles.stepButtonDisabled,
                ]}
              >
                <Minus size={16} color={isAtMin ? (isDarkMode ? '#555' : '#ccc') : (isDarkMode ? "#FFF" : colors.primary)} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>

            <View style={fStyles.sliderContainer}>
              <View style={[fStyles.progressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                <Animated.View
                  style={[
                    fStyles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Animated.View style={[fStyles.sizeLabel, { transform: [{ scale: sizeTextPop }] }]}>
                <Text style={[fStyles.sizeLabelText, { color: colors.primary }]}>{textSize}</Text>
              </Animated.View>
            </View>

            <Animated.View style={{ transform: [{ scale: plusBtnScale }] }}>
              <Pressable
                onPress={handlePlusPress}
                disabled={isAtMax}
                style={[
                  fStyles.stepButton,
                  isDarkMode && fStyles.stepButtonDark,
                  isAtMax && fStyles.stepButtonDisabled,
                ]}
              >
                <Plus size={16} color={isAtMax ? (isDarkMode ? '#555' : '#ccc') : (isDarkMode ? "#FFF" : colors.primary)} strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}

        <Animated.View style={[fStyles.contentWrap, { opacity: fadeAnim, transform: [{ scale: contentScale }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={fStyles.scrollContent}
          >
            <Animated.Text
              style={[
                fStyles.mainTitle,
                isDarkMode && fStyles.mainTitleDark,
                { opacity: titleFade, transform: [{ translateY: titleSlide }] },
              ]}
            >
              {displayTitle}
            </Animated.Text>

            <Animated.View style={[fStyles.textContainer, { transform: [{ translateY: slideAnim }] }]}>
              {renderFormattedText(summary || "")}
            </Animated.View>

            <Animated.View style={[fStyles.footer, { opacity: footerFade }]}>
              <View style={[fStyles.footerDivider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
              <Text style={[fStyles.footerText, isDarkMode && fStyles.footerTextDark]}>
                {wordCount} {language === 'fr' ? 'mots' : 'words'}
                {author ? ` · ${author}` : ''}
              </Text>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const fStyles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  headerButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  textSizerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 14,
  },
  textSizerBarDark: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    shadowOpacity: 0.2,
  },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  stepButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  sliderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  sizeLabel: {
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeLabelText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  contentWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    paddingTop: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#3E2723",
    lineHeight: 36,
    marginBottom: 28,
  },
  mainTitleDark: {
    color: "#FFF",
  },
  textContainer: {
    gap: 4,
  },
  textLine: {
    fontSize: 18,
    lineHeight: 32,
    color: "#4E342E",
    marginBottom: 4,
  },
  textLineDark: {
    color: "#E0E0E0",
  },
  normalText: {
    fontSize: 18,
    color: "#4E342E",
  },
  normalTextDark: {
    color: "#E0E0E0",
  },
  boldText: {
    fontWeight: "700" as const,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#3E2723",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  listItem: {
    paddingLeft: 16,
    marginVertical: 2,
  },
  lineSpace: {
    height: 14,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    gap: 12,
  },
  footerDivider: {
    width: 60,
    height: 2,
    borderRadius: 1,
  },
  footerText: {
    fontSize: 13,
    color: "#8D6E63",
    fontWeight: "500" as const,
  },
  footerTextDark: {
    color: "rgba(255,255,255,0.4)",
  },
});
