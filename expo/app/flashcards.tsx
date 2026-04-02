import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, Crown, Loader2, Sparkles, XCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useMutation } from "@tanstack/react-query";
import { Paywall } from "@/components/Paywall";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

interface FlashcardQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GenerateFlashcardsInput {
  mode: "initial" | "refresh";
  refreshToken: number;
  previousQuestions: string[];
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { t, language } = useLanguage();
  const { isPremium } = useSubscription();
  const { summary, title, author } = useLocalSearchParams<{
    summary?: string;
    title?: string;
    author?: string;
  }>();

  const [flashcards, setFlashcards] = useState<FlashcardQuestion[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [selectedFlashcardAnswer, setSelectedFlashcardAnswer] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(!isPremium);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const cardEntrance = useRef(new Animated.Value(24)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionScales = useRef<Animated.Value[]>([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const optionEntrance = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const optionSlide = useRef<Animated.Value[]>([
    new Animated.Value(20),
    new Animated.Value(20),
    new Animated.Value(20),
  ]).current;
  const correctCelebration = useRef(new Animated.Value(0)).current;
  const wrongShake = useRef(new Animated.Value(0)).current;
  const scorePopScale = useRef(new Animated.Value(0)).current;
  const questionFade = useRef(new Animated.Value(0)).current;
  const loadingShimmer = useRef(new Animated.Value(0)).current;
  const orbPulse1 = useRef(new Animated.Value(1)).current;
  const orbPulse2 = useRef(new Animated.Value(1)).current;

  const cleanedSummary = useMemo(() => {
    return typeof summary === "string" ? summary.replace(/\*/g, "") : "";
  }, [summary]);

  const currentFlashcard = useMemo(() => {
    return flashcards[currentFlashcardIndex] ?? null;
  }, [currentFlashcardIndex, flashcards]);

  const answeredCount = useMemo(() => {
    return selectedFlashcardAnswer ? currentFlashcardIndex + 1 : currentFlashcardIndex;
  }, [currentFlashcardIndex, selectedFlashcardAnswer]);

  const isFlashcardAnswerCorrect = selectedFlashcardAnswer != null && selectedFlashcardAnswer === currentFlashcard?.correctAnswer;

  useEffect(() => {
    setShowPaywall(!isPremium);
  }, [isPremium]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(cardEntrance, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse1, {
          toValue: 1.15,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse2, {
          toValue: 1.2,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse2, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(loadingShimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [cardEntrance, cardOpacity, heroFloat, orbPulse1, orbPulse2, loadingShimmer]);

  useEffect(() => {
    const progressValue = flashcards.length > 0 ? (currentFlashcardIndex + 1) / flashcards.length : 0;
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [currentFlashcardIndex, flashcards.length, progressAnim]);

  const animateFlashcardIn = useCallback(() => {
    questionFade.setValue(0);
    optionEntrance.forEach(a => a.setValue(0));
    optionSlide.forEach(a => a.setValue(20));

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(cardEntrance, {
        toValue: 0,
        friction: 8,
        tension: 44,
        useNativeDriver: true,
      }),
      Animated.timing(questionFade, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      ...optionEntrance.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: 200 + i * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ),
      ...optionSlide.map((anim, i) =>
        Animated.spring(anim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          delay: 200 + i * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [cardEntrance, cardOpacity, questionFade, optionEntrance, optionSlide]);

  useEffect(() => {
    if (flashcards.length === 0) {
      return;
    }

    animateFlashcardIn();
  }, [animateFlashcardIn, currentFlashcardIndex, flashcards.length]);

  const animateButton = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOptionPress = (index: number) => {
    const targetScale = optionScales[index];
    Animated.sequence([
      Animated.timing(targetScale, {
        toValue: 0.97,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(targetScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const { mutate: generateFlashcards, isPending, isError, error, reset } = useMutation<FlashcardQuestion[], Error, GenerateFlashcardsInput>({
    mutationFn: async ({ mode, refreshToken, previousQuestions }) => {
      if (!cleanedSummary) {
        throw new Error(language === "fr" ? "Résumé introuvable." : "Summary not found.");
      }

      console.log("Generating flash cards on dedicated screen...", {
        title,
        mode,
        refreshToken,
        previousQuestionsCount: previousQuestions.length,
      });

      const previousQuestionsText = previousQuestions.length > 0
        ? previousQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")
        : "";

      const flashcardPrompt = language === "fr"
        ? `À partir de ce résumé du livre "${title || "Livre"}" de ${author || "Auteur inconnu"}, génère 5 questions de révision sous forme de QCM. Chaque question doit avoir exactement 3 réponses possibles et une seule bonne réponse. Les mauvaises réponses doivent être crédibles. Réponds UNIQUEMENT avec un JSON valide au format suivant: {"questions":[{"question":"...","options":["...","...","..."],"correctAnswer":"..."}]}. Assure-toi que correctAnswer correspond exactement à l'une des options.${mode === "refresh" ? ` Ceci est une régénération. Génère un NOUVEAU lot avec des formulations et angles différents. N'utilise pas ces anciennes questions :\n${previousQuestionsText}\nUtilise ce token unique pour forcer une nouvelle génération : ${refreshToken}.` : ` Utilise ce token unique : ${refreshToken}.`} Résumé: ${cleanedSummary}`
        : `Based on this summary of the book "${title || "Book"}" by ${author || "Unknown author"}, generate 5 revision multiple-choice questions. Each question must have exactly 3 possible answers and only one correct answer. Wrong answers should still be plausible. Respond ONLY with valid JSON in this format: {"questions":[{"question":"...","options":["...","...","..."],"correctAnswer":"..."}]}. Make sure correctAnswer matches exactly one of the options.${mode === "refresh" ? ` This is a regeneration. Create a NEW batch with different wording and different focus. Do not reuse these previous questions:\n${previousQuestionsText}\nUse this unique token to force a fresh generation: ${refreshToken}.` : ` Use this unique token: ${refreshToken}.`} Summary: ${cleanedSummary}`;

      const response = await generateText(flashcardPrompt);
      console.log("Flash cards raw response on dedicated screen:", response);

      const cleanedResponse = response.trim().replace(/^```json\s*/i, "").replace(/^```/i, "").replace(/```$/i, "");
      const parsedResponse = JSON.parse(cleanedResponse) as { questions?: FlashcardQuestion[] };
      const questions = Array.isArray(parsedResponse.questions) ? parsedResponse.questions : [];
      const sanitizedQuestions = questions.filter((item) => {
        return typeof item.question === "string"
          && Array.isArray(item.options)
          && item.options.length === 3
          && typeof item.correctAnswer === "string"
          && item.options.includes(item.correctAnswer);
      });

      if (sanitizedQuestions.length === 0) {
        throw new Error(language === "fr" ? "Aucune flash card valide générée." : "No valid flash cards were generated.");
      }

      return sanitizedQuestions;
    },
    onSuccess: (data) => {
      setFlashcards(data);
      setCurrentFlashcardIndex(0);
      setSelectedFlashcardAnswer(null);
      reset();
      cardOpacity.setValue(0);
      cardEntrance.setValue(24);
      requestAnimationFrame(() => {
        animateFlashcardIn();
      });
    },
    onError: (mutationError) => {
      console.error("Flash cards generation error on dedicated screen:", mutationError);
    },
  });

  useEffect(() => {
    if (!isPremium) return;
    if (cleanedSummary && flashcards.length === 0 && !isPending) {
      generateFlashcards({
        mode: "initial",
        refreshToken: Date.now(),
        previousQuestions: [],
      });
    }
  }, [cleanedSummary, flashcards.length, generateFlashcards, isPending, isPremium]);

  const handleRegenerate = () => {
    animateButton();
    reset();
    setSelectedFlashcardAnswer(null);
    setCurrentFlashcardIndex(0);
    cardOpacity.setValue(0);
    cardEntrance.setValue(24);
    generateFlashcards({
      mode: "refresh",
      refreshToken: Date.now(),
      previousQuestions: flashcards.map((item) => item.question),
    });
  };

  const handleSelectFlashcardAnswer = (answerValue: string, index: number) => {
    if (selectedFlashcardAnswer) return;
    animateOptionPress(index);
    const isCorrect = answerValue === currentFlashcard?.correctAnswer;
    void Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    setSelectedFlashcardAnswer(answerValue);

    if (isCorrect) {
      correctCelebration.setValue(0);
      scorePopScale.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(correctCelebration, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(correctCelebration, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scorePopScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      wrongShake.setValue(0);
      Animated.sequence([
        Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(wrongShake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(wrongShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNextFlashcard = () => {
    if (flashcards.length === 0) return;
    void Haptics.selectionAsync();
    setSelectedFlashcardAnswer(null);
    cardOpacity.setValue(0);
    cardEntrance.setValue(24);
    setCurrentFlashcardIndex((previousValue) => {
      if (previousValue >= flashcards.length - 1) {
        return 0;
      }
      return previousValue + 1;
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const heroTranslateY = heroFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#09111F" : "#F6EFE5" }]}> 
      <LinearGradient
        colors={isDarkMode ? ["#09111F", "#13233D", "#1C3157"] : ["#FFF8F0", "#F5EBE0", "#E8D5C4"]}
        style={styles.background}
      />

      <Animated.View style={[styles.orb, styles.orbPrimary, { backgroundColor: isDarkMode ? "rgba(92, 122, 255, 0.22)" : "rgba(233, 133, 91, 0.22)", transform: [{ scale: orbPulse1 }] }]} />
      <Animated.View style={[styles.orb, styles.orbSecondary, { backgroundColor: isDarkMode ? "rgba(255, 169, 77, 0.14)" : "rgba(171, 71, 188, 0.14)", transform: [{ scale: orbPulse2 }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              testID="flashcards-back-button"
              onPressIn={() => {
                Animated.spring(backButtonScale, {
                  toValue: 0.88,
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
              <ArrowLeft size={22} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>{t.summary.flashcards}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ transform: [{ translateY: heroTranslateY }] }}>
            <View style={[styles.heroCard, isDarkMode && styles.heroCardDark]}>
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroBadge}>
                  <Sparkles size={16} color="#FFF" />
                  <Text style={styles.heroBadgeText}>{t.summary.flashcards}</Text>
                </View>
                <Text style={styles.heroTitle}>{title || t.summary.title}</Text>
                <Text style={styles.heroSubtitle}>{author || t.audio.author}</Text>
                <Text style={styles.heroDescription}>
                  {language === "fr"
                    ? "Teste ta compréhension avec des questions sur le livre."
                    : "Test your understanding with questions about the book."}
                </Text>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatPill}>
                    <Crown size={14} color="#FFF" />
                    <Text style={styles.heroStatText}>{language === "fr" ? "Premium" : "Premium"}</Text>
                  </View>
                  <View style={styles.heroStatPill}>
                    <Sparkles size={14} color="#FFF" />
                    <Text style={styles.heroStatText}>{`${flashcards.length || 5} ${language === "fr" ? "cartes" : "cards"}`}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable onPress={handleRegenerate} style={styles.actionButton} testID="flashcard-regenerate-button" disabled={!isPremium || isPending}>
              <View style={styles.glowingBorderPremium}>
                <LinearGradient
                  colors={colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  {isPending ? <Loader2 size={20} color="#FFF" /> : <Sparkles size={20} color="#FFF" />}
                  <Text style={styles.actionButtonText}>
                    {isPending ? t.summary.flashcardsGenerating : t.summary.generateMore}
                  </Text>
                </LinearGradient>
              </View>
            </Pressable>
          </Animated.View>

          <View style={[styles.progressCard, isDarkMode && styles.progressCardDark]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, isDarkMode && styles.progressTitleDark]}>
                {language === "fr" ? "Progression" : "Progress"}
              </Text>
              <Text style={[styles.progressCount, isDarkMode && styles.progressCountDark]}>
                {`${answeredCount}/${flashcards.length || 5}`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
            </View>
          </View>

          {!isPremium ? (
            <View style={[styles.messageCard, isDarkMode && styles.messageCardDark]} testID="flashcards-premium-card">
              <Text style={[styles.messageTitle, isDarkMode && styles.messageTitleDark]}>
                {language === "fr" ? "Fonction premium" : "Premium feature"}
              </Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>
                {language === "fr"
                  ? "Les flash cards sont incluses dans l’abonnement premium."
                  : "Flash cards are included in the premium subscription."}
              </Text>
            </View>
          ) : null}

          {isError ? (
            <View style={[styles.messageCard, isDarkMode && styles.messageCardDark]} testID="flashcards-error-card">
              <Text style={[styles.messageTitle, isDarkMode && styles.messageTitleDark]}>{t.summary.error}</Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>
                {error instanceof Error ? error.message : t.summary.retry}
              </Text>
              <Pressable onPress={handleRegenerate} style={styles.retryButton} testID="flashcards-retry-button">
                <Text style={styles.retryButtonText}>{t.summary.retry}</Text>
              </Pressable>
            </View>
          ) : null}

          {isPending && flashcards.length === 0 ? (
            <View style={[styles.messageCard, isDarkMode && styles.messageCardDark]} testID="flashcards-loading-card">
              <Text style={[styles.messageTitle, isDarkMode && styles.messageTitleDark]}>{t.summary.flashcardsGenerating}</Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>{t.summary.flashcardsSubtitle}</Text>
              <View style={styles.shimmerRow}>
                {[0, 1, 2].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.shimmerBar,
                      isDarkMode && styles.shimmerBarDark,
                      {
                        opacity: loadingShimmer.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: i === 1 ? [0.3, 0.7, 0.3] : [0.5, 0.3, 0.5],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {currentFlashcard && isPremium ? (
            <Animated.View
              style={{
                opacity: cardOpacity,
                transform: [{ translateY: cardEntrance }],
              }}
            >
              <View style={[styles.flashcardCard, isDarkMode && styles.flashcardCardDark]} testID="flashcard-card">
                <View style={styles.flashcardTopRow}>
                  <Text style={[styles.flashcardStep, isDarkMode && styles.flashcardStepDark]}>
                    {`${currentFlashcardIndex + 1}/${flashcards.length}`}
                  </Text>
                  <Text style={[styles.flashcardMiniLabel, isDarkMode && styles.flashcardMiniLabelDark]}>{t.summary.flashcards}</Text>
                </View>

                <Animated.Text style={[styles.flashcardQuestion, isDarkMode && styles.flashcardQuestionDark, { opacity: questionFade }]}>
                  {currentFlashcard.question}
                </Animated.Text>

                <View style={styles.flashcardOptions}>
                  {currentFlashcard.options.map((option, index) => {
                    const isSelected = selectedFlashcardAnswer === option;
                    const isCorrect = currentFlashcard.correctAnswer === option;
                    const showResult = selectedFlashcardAnswer != null;

                    return (
                      <Animated.View key={option} style={{
                        opacity: optionEntrance[index] ?? 1,
                        transform: [
                          { scale: optionScales[index] ?? new Animated.Value(1) },
                          { translateY: optionSlide[index] ?? new Animated.Value(0) },
                          ...(showResult && isSelected && !isCorrect ? [{ translateX: wrongShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-4, 0, 4] }) }] : []),
                        ],
                      }}>
                        <Pressable
                          onPress={() => handleSelectFlashcardAnswer(option, index)}
                          disabled={showResult}
                          style={[
                            styles.flashcardOption,
                            isDarkMode && styles.flashcardOptionDark,
                            showResult && isCorrect && styles.flashcardOptionCorrect,
                            showResult && isSelected && !isCorrect && styles.flashcardOptionWrong,
                          ]}
                          testID={`flashcard-option-${index}`}
                        >
                          <View style={styles.optionContent}>
                            <Text
                              style={[
                                styles.flashcardOptionText,
                                isDarkMode && styles.flashcardOptionTextDark,
                                showResult && (isCorrect || isSelected) && styles.flashcardOptionTextActive,
                              ]}
                            >
                              {option}
                            </Text>
                            {showResult && isCorrect ? <CheckCircle2 size={18} color="#FFF" /> : null}
                            {showResult && isSelected && !isCorrect ? <XCircle size={18} color="#FFF" /> : null}
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>

                {selectedFlashcardAnswer ? (
                  <View style={[styles.flashcardFeedback, isFlashcardAnswerCorrect ? styles.flashcardFeedbackCorrect : styles.flashcardFeedbackWrong]}>
                    <Text style={styles.flashcardFeedbackLabel}>
                      {isFlashcardAnswerCorrect ? t.summary.correctAnswer : t.summary.yourAnswer}
                    </Text>
                    <Text style={styles.flashcardFeedbackText}>
                      {isFlashcardAnswerCorrect
                        ? currentFlashcard.correctAnswer
                        : `${selectedFlashcardAnswer} • ${t.summary.correctAnswer}: ${currentFlashcard.correctAnswer}`}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleNextFlashcard}
                  style={[styles.flashcardNextButton, !selectedFlashcardAnswer && styles.flashcardNextButtonDisabled]}
                  disabled={!selectedFlashcardAnswer}
                  testID="flashcard-next-button"
                >
                  <Text style={styles.flashcardNextButtonText}>{t.summary.nextQuestion}</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Paywall
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          if (!isPremium) {
            router.back();
          }
        }}
        onSuccess={() => {
          setShowPaywall(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbPrimary: {
    width: 220,
    height: 220,
    top: 96,
    right: -60,
  },
  orbSecondary: {
    width: 180,
    height: 180,
    bottom: 120,
    left: -50,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  headerTitleDark: {
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  heroCardDark: {
    shadowOpacity: 0.28,
  },
  heroGradient: {
    padding: 22,
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.88)",
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.92)",
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  heroStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroStatText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  actionButton: {
    borderRadius: 14,
  },
  glowingBorderPremium: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#AB47BC",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  progressCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.84)",
  },
  progressCardDark: {
    backgroundColor: "rgba(13, 21, 37, 0.76)",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  progressTitleDark: {
    color: "#FFFFFF",
  },
  progressCount: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#667085",
  },
  progressCountDark: {
    color: "#D0D5DD",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.38)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  messageCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    gap: 10,
  },
  messageCardDark: {
    backgroundColor: "rgba(9, 17, 31, 0.72)",
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  messageTitleDark: {
    color: "#FFFFFF",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475467",
  },
  messageTextDark: {
    color: "#D0D5DD",
  },
  retryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#13233D",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  flashcardCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    gap: 16,
  },
  flashcardCardDark: {
    backgroundColor: "rgba(16, 24, 40, 0.82)",
  },
  flashcardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flashcardStep: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#5D6B82",
  },
  flashcardStepDark: {
    color: "#C7D7F2",
  },
  flashcardMiniLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#4C7DFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  flashcardMiniLabelDark: {
    color: "#D6E4FF",
  },
  flashcardQuestion: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "700" as const,
    color: "#1F2A3D",
  },
  flashcardQuestionDark: {
    color: "#FFFFFF",
  },
  flashcardOptions: {
    gap: 10,
  },
  flashcardOption: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F6F8FC",
    borderWidth: 1,
    borderColor: "#E6ECF5",
  },
  flashcardOptionDark: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  flashcardOptionCorrect: {
    backgroundColor: "#18A957",
    borderColor: "#18A957",
  },
  flashcardOptionWrong: {
    backgroundColor: "#D64545",
    borderColor: "#D64545",
  },
  flashcardOptionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: "#23324D",
  },
  flashcardOptionTextDark: {
    color: "#E8F0FF",
  },
  flashcardOptionTextActive: {
    color: "#FFFFFF",
  },
  flashcardFeedback: {
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  flashcardFeedbackCorrect: {
    backgroundColor: "rgba(24, 169, 87, 0.14)",
  },
  flashcardFeedbackWrong: {
    backgroundColor: "rgba(214, 69, 69, 0.14)",
  },
  flashcardFeedbackLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#5B6472",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  flashcardFeedbackText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: "#17202E",
  },
  flashcardNextButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#13233D",
  },
  flashcardNextButtonDisabled: {
    opacity: 0.4,
  },
  flashcardNextButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  shimmerRow: {
    gap: 10,
    marginTop: 12,
  },
  shimmerBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  shimmerBarDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
