import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, Crown, Loader2, Sparkles, XCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateText } from "@/utils/openai";
import { useMutation } from "@tanstack/react-query";
import { Paywall } from "@/components/Paywall";
import { AnimatedBackground } from "@/components/AnimatedBackground";
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

  const optionLetters = ["A", "B", "C"];



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDarkMode ? ["#0D0D0D", "#1A1A2E", "#16213E"] : ["#FFF8F0", "#F5EBE0", "#E8D5C4"]}
        style={StyleSheet.absoluteFill}
      />
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, isDarkMode && styles.backButtonDark]}
              testID="flashcards-back-button"
              onPressIn={() => Animated.spring(backButtonScale, { toValue: 0.88, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(backButtonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
            >
              <ArrowLeft size={22} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]} numberOfLines={1}>
              {title || t.summary.flashcards}
            </Text>
            {author ? (
              <Text style={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]} numberOfLines={1}>
                {author}
              </Text>
            ) : null}
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={handleRegenerate}
              style={[styles.refreshButton, isDarkMode && styles.refreshButtonDark]}
              testID="flashcard-regenerate-button"
              disabled={!isPremium || isPending}
            >
              {isPending ? (
                <Loader2 size={18} color={colors.primary} />
              ) : (
                <Sparkles size={18} color={colors.primary} />
              )}
            </Pressable>
          </Animated.View>
        </View>

        {/* Progress bar */}
        {flashcards.length > 0 && (
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressTrack, isDarkMode && styles.progressTrackDark]}>
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressLabel, isDarkMode && styles.progressLabelDark]}>
              {`${currentFlashcardIndex + 1} / ${flashcards.length}`}
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Loading */}
          {isPending && flashcards.length === 0 && (
            <View style={styles.centerContainer}>
              <Animated.View style={[styles.loadingIconWrap, {
                opacity: loadingShimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] }),
              }]}>
                <LinearGradient colors={colors.gradient} style={styles.loadingIconGradient}>
                  <Sparkles size={32} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
                {t.summary.flashcardsGenerating}
              </Text>
              <View style={styles.shimmerRow}>
                {[0, 1, 2].map((i) => (
                  <Animated.View key={i} style={[styles.shimmerBar, isDarkMode && styles.shimmerBarDark, {
                    opacity: loadingShimmer.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: i === 1 ? [0.3, 0.8, 0.3] : [0.5, 0.3, 0.5],
                    }),
                  }]} />
                ))}
              </View>
            </View>
          )}

          {/* Error */}
          {isError && (
            <View style={[styles.messageCard, isDarkMode && styles.messageCardDark]}>
              <Text style={[styles.messageTitle, isDarkMode && styles.messageTitleDark]}>{t.summary.error}</Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>
                {error instanceof Error ? error.message : t.summary.retry}
              </Text>
              <Pressable onPress={handleRegenerate} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.retryButtonText}>{t.summary.retry}</Text>
              </Pressable>
            </View>
          )}

          {/* Not premium */}
          {!isPremium && (
            <View style={[styles.messageCard, isDarkMode && styles.messageCardDark]}>
              <Crown size={32} color={colors.primary} />
              <Text style={[styles.messageTitle, isDarkMode && styles.messageTitleDark]}>
                {language === "fr" ? "Fonction premium" : "Premium feature"}
              </Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>
                {language === "fr"
                  ? "Les flash cards sont incluses dans l'abonnement premium."
                  : "Flash cards are included in the premium subscription."}
              </Text>
            </View>
          )}

          {/* Flashcard */}
          {currentFlashcard && isPremium && (
            <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardEntrance }] }}>

              {/* Question card */}
              <View style={[styles.questionCard, isDarkMode && styles.questionCardDark]}>
                <Animated.Text style={[styles.questionText, isDarkMode && styles.questionTextDark, { opacity: questionFade }]}>
                  {currentFlashcard.question}
                </Animated.Text>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentFlashcard.options.map((option, index) => {
                  const isSelected = selectedFlashcardAnswer === option;
                  const isCorrect = currentFlashcard.correctAnswer === option;
                  const showResult = selectedFlashcardAnswer != null;
                  const letter = optionLetters[index];

                  let optionBg = isDarkMode ? "rgba(255,255,255,0.07)" : "#FFF";
                  let letterBg = isDarkMode ? "rgba(255,255,255,0.1)" : `${colors.primary}18`;
                  let letterColor = colors.primary;
                  let borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

                  if (showResult && isCorrect) {
                    optionBg = "#22C55E";
                    letterBg = "rgba(255,255,255,0.25)";
                    letterColor = "#FFF";
                    borderColor = "#22C55E";
                  } else if (showResult && isSelected && !isCorrect) {
                    optionBg = "#EF4444";
                    letterBg = "rgba(255,255,255,0.25)";
                    letterColor = "#FFF";
                    borderColor = "#EF4444";
                  }

                  return (
                    <Animated.View key={option} style={{
                      opacity: optionEntrance[index] ?? 1,
                      transform: [
                        { scale: optionScales[index] ?? new Animated.Value(1) },
                        { translateY: optionSlide[index] ?? new Animated.Value(0) },
                        ...(showResult && isSelected && !isCorrect ? [{
                          translateX: wrongShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] }),
                        }] : []),
                      ],
                    }}>
                      <Pressable
                        onPress={() => handleSelectFlashcardAnswer(option, index)}
                        disabled={showResult}
                        style={[styles.optionRow, { backgroundColor: optionBg, borderColor }]}
                        testID={`flashcard-option-${index}`}
                      >
                        <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                          <Text style={[styles.optionLetterText, { color: letterColor }]}>{letter}</Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isDarkMode && styles.optionTextDark,
                            showResult && (isCorrect || isSelected) && styles.optionTextActive,
                          ]}
                          numberOfLines={3}
                        >
                          {option}
                        </Text>
                        {showResult && isCorrect ? <CheckCircle2 size={20} color="#FFF" /> : null}
                        {showResult && isSelected && !isCorrect ? <XCircle size={20} color="#FFF" /> : null}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Feedback */}
              {selectedFlashcardAnswer && (
                <View style={[styles.feedbackCard, isFlashcardAnswerCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                  <Text style={styles.feedbackEmoji}>{isFlashcardAnswerCorrect ? "🎉" : "💡"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feedbackLabel}>
                      {isFlashcardAnswerCorrect
                        ? (language === "fr" ? "Bonne réponse !" : "Correct!")
                        : (language === "fr" ? "Bonne réponse :" : "Correct answer:")}
                    </Text>
                    {!isFlashcardAnswerCorrect && (
                      <Text style={styles.feedbackAnswer}>{currentFlashcard.correctAnswer}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Next button */}
              <Pressable
                onPress={handleNextFlashcard}
                disabled={!selectedFlashcardAnswer}
                style={[styles.nextButton, !selectedFlashcardAnswer && styles.nextButtonDisabled]}
                testID="flashcard-next-button"
              >
                <LinearGradient
                  colors={selectedFlashcardAnswer ? colors.gradient : ["#CCC", "#CCC"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {currentFlashcardIndex >= flashcards.length - 1
                      ? (language === "fr" ? "Recommencer" : "Restart")
                      : (language === "fr" ? "Question suivante →" : "Next question →")}
                  </Text>
                </LinearGradient>
              </Pressable>

            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Paywall
        visible={showPaywall}
        onClose={() => { setShowPaywall(false); if (!isPremium) router.back(); }}
        onSuccess={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  backButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  headerTitleDark: {
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#8D6E63",
    textAlign: "center",
    marginTop: 2,
  },
  headerSubtitleDark: {
    color: "#999",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  refreshButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  progressTrackDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#8D6E63",
    minWidth: 40,
    textAlign: "right",
  },
  progressLabelDark: {
    color: "#999",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centerContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingIconWrap: {
    marginBottom: 8,
  },
  loadingIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  loadingTextDark: {
    color: "#FFF",
  },
  shimmerRow: {
    gap: 10,
    width: "100%",
    marginTop: 8,
  },
  shimmerBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  shimmerBarDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  messageCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  messageCardDark: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  messageTitleDark: {
    color: "#FFF",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8D6E63",
    textAlign: "center",
  },
  messageTextDark: {
    color: "#999",
  },
  retryButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  questionCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    minHeight: 140,
    justifyContent: "center",
  },
  questionCardDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
    lineHeight: 30,
    textAlign: "center",
  },
  questionTextDark: {
    color: "#FFF",
  },
  optionsContainer: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: "800" as const,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#3E2723",
    lineHeight: 22,
  },
  optionTextDark: {
    color: "#E0E0E0",
  },
  optionTextActive: {
    color: "#FFF",
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  feedbackWrong: {
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  feedbackEmoji: {
    fontSize: 28,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#3E2723",
    marginBottom: 2,
  },
  feedbackAnswer: {
    fontSize: 14,
    color: "#5D4037",
    lineHeight: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: 0.3,
  },
});
