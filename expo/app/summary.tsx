import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, FileText, Loader2, User, Sparkles, Volume2, Maximize2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { generateText } from "@/utils/openai";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Paywall } from "@/components/Paywall";

interface BookInfo {
  title: string;
  author: string;
  coverUrl?: string;
  coverUrlFallback?: string;
  description?: string;
}

type SummaryType = 'normal' | 'chapter' | null;

async function convertImageToBase64(uri: string): Promise<string> {
  console.log("[ImageConvert] Converting image, platform:", Platform.OS, "uri:", uri.substring(0, 80));

  if (Platform.OS !== 'web') {
    try {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as FileSystem.EncodingType,
      });
      if (base64Data && base64Data.length > 0) {
        const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const result = `data:${mimeType};base64,${base64Data}`;
        console.log("[ImageConvert] Native base64 conversion OK, length:", result.length);
        return result;
      }
      throw new Error('Empty base64 result');
    } catch (fsError: unknown) {
      const fsMsg = fsError instanceof Error ? fsError.message : String(fsError);
      console.error("[ImageConvert] Native FS failed:", fsMsg);
      throw new Error(`Impossible de lire l'image: ${fsMsg}`);
    }
  }

  // Web fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(uri, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
    const blob = await response.blob();
    if (blob.size === 0) throw new Error('Empty blob received');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && reader.result.length > 100) resolve(reader.result);
        else reject(new Error('FileReader result is empty or invalid'));
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
    console.log("[ImageConvert] Web fetch+FileReader OK, length:", base64.length);
    return base64;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[ImageConvert] Web conversion failed:", errMsg);
    throw new Error(`Impossible de lire l'image: ${errMsg}`);
  }
}

export default function SummaryScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { t, language } = useLanguage();
  const [textSize, setTextSize] = useState(16);
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>(null);
  const [selectedSummary, setSelectedSummary] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);
  const [pendingAction, setPendingAction] = useState<'chapter' | 'fiche' | 'audio' | 'flashcards' | null>(null);
  const [copyrightError, setCopyrightError] = useState(false);
  const { isPremium } = useSubscription();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const buttonScale1 = React.useRef(new Animated.Value(1)).current;
  const buttonScale2 = React.useRef(new Animated.Value(1)).current;
  const cardSlideAnim = React.useRef(new Animated.Value(50)).current;
  const loadingRotation = React.useRef(new Animated.Value(0)).current;
  const coverScale = React.useRef(new Animated.Value(0.8)).current;
  const textSizeButtonScale1 = React.useRef(new Animated.Value(1)).current;
  const textSizeButtonScale2 = React.useRef(new Animated.Value(1)).current;
  const backButtonScale = React.useRef(new Animated.Value(1)).current;
  const ficheButtonPulse = React.useRef(new Animated.Value(1)).current;
  const optionScale1 = React.useRef(new Animated.Value(1)).current;
  const optionScale2 = React.useRef(new Animated.Value(1)).current;
  const flashcardButtonScale = React.useRef(new Animated.Value(1)).current;
  const selectionFade = React.useRef(new Animated.Value(1)).current;
  const expandButtonScale = React.useRef(new Animated.Value(1)).current;
  const loadingPulse = React.useRef(new Animated.Value(0.4)).current;
  const loadingDotScale1 = React.useRef(new Animated.Value(0)).current;
  const loadingDotScale2 = React.useRef(new Animated.Value(0)).current;
  const loadingDotScale3 = React.useRef(new Animated.Value(0)).current;
  const summaryCardFade = React.useRef(new Animated.Value(0)).current;
  const summaryCardSlide = React.useRef(new Animated.Value(30)).current;
  const actionsCardFade = React.useRef(new Animated.Value(0)).current;
  const actionsCardSlide = React.useRef(new Animated.Value(40)).current;
  const bookCardShine = React.useRef(new Animated.Value(0)).current;

  const { mutate: analyzeMutation, isPending: isAnalyzing, isError } = useMutation({
    mutationFn: async (uri: string) => {
      console.log("[Analyze] Starting book cover analysis...");
      console.log("[Analyze] URI:", uri.substring(0, 100));
      
      let imageBase64 = uri;
      if (!uri.startsWith("data:")) {
        imageBase64 = await convertImageToBase64(uri);
      }
      
      console.log("[ImageConvert] Final length:", imageBase64.length, "starts with data:?", imageBase64.startsWith("data:"));
      
      if (!imageBase64 || imageBase64.length < 100) {
        throw new Error("Impossible de convertir l'image.");
      }

      console.log("Image prepared for AI analysis");

      const extractionResult = await generateText({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: imageBase64,
              },
              {
                type: "text",
                text: language === 'fr' 
                  ? "Analyse cette couverture de livre et identifie le titre et l'auteur. Réponds UNIQUEMENT au format JSON: {\"title\": \"titre du livre\", \"author\": \"nom de l'auteur\"}"
                  : "Analyze this book cover and identify the title and author. Respond ONLY in JSON format: {\"title\": \"book title\", \"author\": \"author name\"}",
              },
            ],
          },
        ],
      });

      console.log("Extraction result:", extractionResult);
      
      let parsedInfo: { title: string; author: string };
      try {
        const cleanedJson = extractionResult.trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        console.log("[JSON Clean] Cleaned JSON:", cleanedJson.substring(0, 200));
        parsedInfo = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("[JSON Parse] Failed to parse extraction result:", parseErr);
        parsedInfo = {
          title: language === 'fr' ? "Le titre n'a pas pu être identifié" : "Title could not be identified",
          author: language === 'fr' ? "Auteur inconnu" : "Unknown author",
        };
      }

      console.log("Searching Google Books API...");
      const searchQuery = encodeURIComponent(
        `${parsedInfo.title} ${parsedInfo.author}`
      );
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
      
      let bookData: BookInfo = {
        title: parsedInfo.title,
        author: parsedInfo.author,
      };

      try {
        const response = await fetch(googleBooksUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const book = data.items[0].volumeInfo;
          let coverUrl = book.imageLinks?.extraLarge || 
                        book.imageLinks?.large || 
                        book.imageLinks?.medium || 
                        book.imageLinks?.thumbnail || 
                        book.imageLinks?.smallThumbnail;
          
          if (coverUrl) {
            coverUrl = coverUrl.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
          }

          const isbn = book.industryIdentifiers?.find((id: { type: string; identifier: string }) => id.type === 'ISBN_13')?.identifier ||
                       book.industryIdentifiers?.find((id: { type: string; identifier: string }) => id.type === 'ISBN_10')?.identifier;
          const openLibraryCover = isbn
            ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
            : undefined;
          
          bookData = {
            title: book.title || parsedInfo.title,
            author: book.authors?.[0] || parsedInfo.author,
            coverUrl: coverUrl,
            coverUrlFallback: openLibraryCover || coverUrl,
            description: book.description,
          };
        }
      } catch (error) {
        console.error("Google Books API error:", error);
      }

      return bookData;
    },
    onSuccess: (data) => {
      setBookInfo(data);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(coverScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
          delay: 200,
        }),
      ]).start();
    },
  });

  const { mutate: generateSummary, isPending: isGeneratingSummary, isError: isSummaryError } = useMutation({
    mutationFn: async (type: SummaryType) => {
      if (!bookInfo || !type) throw new Error('Missing book info or type');
      
      console.log(`Generating ${type} summary with AI...`);

      let summaryPrompt = '';
      
      if (type === 'normal') {
        summaryPrompt = language === 'fr'
          ? bookInfo.description
            ? `Écris un résumé concis du livre "${bookInfo.title}" de ${bookInfo.author} en environ 10 lignes. Voici la description officielle: ${bookInfo.description}. Rends le résumé clair, structuré et fidèle au livre. IMPORTANT: Ne réponds qu'avec le résumé uniquement, sans introduction, sans message conversationnel, sans demander si je veux poursuivre. Commence directement par le contenu du résumé.`
            : `Écris un résumé concis du livre "${bookInfo.title}" de ${bookInfo.author} en environ 10 lignes. Base-toi sur tes connaissances du livre. Rends le résumé clair, structuré et fidèle au livre. IMPORTANT: Ne réponds qu'avec le résumé uniquement, sans introduction, sans message conversationnel, sans demander si je veux poursuivre. Commence directement par le contenu du résumé.`
          : bookInfo.description
            ? `Write a concise summary of the book "${bookInfo.title}" by ${bookInfo.author} in about 10 lines. Here is the official description: ${bookInfo.description}. Make the summary clear, structured and faithful to the book. IMPORTANT: Only respond with the summary, without introduction, without conversational messages, without asking if I want to continue. Start directly with the summary content.`
            : `Write a concise summary of the book "${bookInfo.title}" by ${bookInfo.author} in about 10 lines. Base it on your knowledge of the book. Make the summary clear, structured and faithful to the book. IMPORTANT: Only respond with the summary, without introduction, without conversational messages, without asking if I want to continue. Start directly with the summary content.`;
      } else {
        summaryPrompt = language === 'fr'
          ? bookInfo.description
            ? `Génère un résumé détaillé chapitre par chapitre du livre "${bookInfo.title}" de ${bookInfo.author}. Voici la description officielle: ${bookInfo.description}. Pour chaque chapitre, indique le titre du chapitre (s'il existe) et un résumé de 3-4 lignes. Structure le résumé avec des titres clairs pour chaque chapitre. Utilise le format:\n\n**Chapitre 1: [Titre]**\n[Résumé du chapitre]\n\nSois précis et fidèle au livre. IMPORTANT: Ne réponds qu'avec le résumé chapitre par chapitre uniquement, sans introduction comme "Voici un résumé détaillé", sans conclusion, sans message conversationnel, sans demander si je veux poursuivre. Commence directement par le Chapitre 1.`
            : `Génère un résumé détaillé chapitre par chapitre du livre "${bookInfo.title}" de ${bookInfo.author}. Pour chaque chapitre, indique le titre du chapitre (s'il existe) et un résumé de 3-4 lignes. Structure le résumé avec des titres clairs pour chaque chapitre. Utilise le format:\n\n**Chapitre 1: [Titre]**\n[Résumé du chapitre]\n\nSois précis et fidèle au livre. IMPORTANT: Ne réponds qu'avec le résumé chapitre par chapitre uniquement, sans introduction comme "Voici un résumé détaillé", sans conclusion, sans message conversationnel, sans demander si je veux poursuivre. Commence directement par le Chapitre 1.`
          : bookInfo.description
            ? `Generate a detailed chapter-by-chapter summary of the book "${bookInfo.title}" by ${bookInfo.author}. Here is the official description: ${bookInfo.description}. For each chapter, indicate the chapter title (if any) and a 3-4 line summary. Structure the summary with clear titles for each chapter. Use the format:\n\n**Chapter 1: [Title]**\n[Chapter summary]\n\nBe precise and faithful to the book. IMPORTANT: Only respond with the chapter-by-chapter summary, without introduction like "Here is a detailed summary", without conclusion, without conversational messages, without asking if I want to continue. Start directly with Chapter 1.`
            : `Generate a detailed chapter-by-chapter summary of the book "${bookInfo.title}" by ${bookInfo.author}. For each chapter, indicate the chapter title (if any) and a 3-4 line summary. Structure the summary with clear titles for each chapter. Use the format:\n\n**Chapter 1: [Title]**\n[Chapter summary]\n\nBe precise and faithful to the book. IMPORTANT: Only respond with the chapter-by-chapter summary, without introduction like "Here is a detailed summary", without conclusion, without conversational messages, without asking if I want to continue. Start directly with Chapter 1.`;
      }

      const summary = await generateText(summaryPrompt);
      return summary;
    },
    onSuccess: (data, variables) => {
      const copyrightKeywords = [
        'copyright', 'droits d\'auteur', 'droit d\'auteur',
        'je ne peux pas', 'I cannot', 'I can\'t',
        'unable to provide', 'cannot provide',
        'protected', 'protégé', 'restriction',
        'not able to', 'pas en mesure',
        'legal reasons', 'raisons légales'
      ];
      
      const lowerData = data.toLowerCase();
      const isCopyrightIssue = variables === 'chapter' && copyrightKeywords.some(keyword => 
        lowerData.includes(keyword.toLowerCase())
      );
      
      if (isCopyrightIssue) {
        setCopyrightError(true);
        return;
      }
      
      setSelectedSummary(data);
      Animated.timing(selectionFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      summaryCardFade.setValue(0);
      summaryCardSlide.setValue(30);
      actionsCardFade.setValue(0);
      actionsCardSlide.setValue(40);

      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(summaryCardFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(summaryCardSlide, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(actionsCardFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(actionsCardSlide, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      Animated.loop(
        Animated.timing(bookCardShine, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(ficheButtonPulse, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ficheButtonPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale2, {
            toValue: 1.02,
            duration: 1700,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale2, {
            toValue: 1,
            duration: 1700,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(flashcardButtonScale, {
            toValue: 1.02,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(flashcardButtonScale, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    },
  });

const { mutate: generateFiche, isPending: isGeneratingFiche } = useMutation({
    mutationFn: async () => {
      if (!bookInfo) return "";
      
      console.log("Génération de la fiche de lecture complète...");
      
      const fichePrompt = language === 'fr'
        ? `Génère une fiche de lecture complète et détaillée pour le livre "${bookInfo.title}" de ${bookInfo.author}.

La fiche doit suivre EXACTEMENT ce format avec des sections claires et structurées:

**Fiche de Lecture : ${bookInfo.title}**

**Informations Générales**
- **Auteur**: [nom de l'auteur]
- **Date de publication**: [année]
- **Genre**: [genre littéraire]
- **Cadre spatio-temporel**: [lieu et époque]

**Contexte et Mouvement**
[Paragraphe sur le contexte historique et le mouvement littéraire]

**Personnages Clés**
[Liste des personnages principaux avec descriptions détaillées]

**Résumé de l'Intrigue**
[Résumé détaillé en plusieurs paragraphes]

**Thèmes Principaux**
[Liste des thèmes avec explications]

Sois précis, détaillé et fidèle au livre. Utilise tes connaissances approfondies du livre pour créer une fiche de lecture académique complète.`
        : `Generate a complete and detailed reading sheet for the book "${bookInfo.title}" by ${bookInfo.author}.

The sheet must follow EXACTLY this format with clear and structured sections:

**Reading Sheet: ${bookInfo.title}**

**General Information**
- **Author**: [author name]
- **Publication date**: [year]
- **Genre**: [literary genre]
- **Setting**: [place and time period]

**Context and Movement**
[Paragraph on historical context and literary movement]

**Key Characters**
[List of main characters with detailed descriptions]

**Plot Summary**
[Detailed summary in multiple paragraphs]

**Main Themes**
[List of themes with explanations]

Be precise, detailed and faithful to the book. Use your in-depth knowledge of the book to create a complete academic reading sheet.`;

      const fiche = await generateText(fichePrompt);
      return fiche;
    },
    onSuccess: (data) => {
      router.push({
        pathname: "/fiche",
        params: {
          content: data,
          title: bookInfo?.title || (language === 'fr' ? "Fiche de Lecture" : "Reading Sheet"),
        },
      });
    },
  });

  useEffect(() => {
    if (imageUri) {
      analyzeMutation(imageUri);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  useEffect(() => {
    if (isAnalyzing || isGeneratingSummary) {
      Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulse, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(loadingPulse, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      const dotLoop = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 400,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      dotLoop(loadingDotScale1, 0);
      dotLoop(loadingDotScale2, 200);
      dotLoop(loadingDotScale3, 400);
    }
  }, [isAnalyzing, isGeneratingSummary, loadingRotation, loadingPulse, loadingDotScale1, loadingDotScale2, loadingDotScale3]);

  const handleSelectSummaryType = (type: SummaryType) => {
    if (type === 'chapter' && !isPremium) {
      setPendingAction('chapter');
      setShowPaywall(true);
      return;
    }
    setSummaryType(type);
    generateSummary(type);
  };

  const handleGenerateFiche = () => {
    if (!isPremium) {
      setPendingAction('fiche');
      setShowPaywall(true);
      return;
    }
    animateButton(buttonScale1);
    generateFiche();
  };

  const handleAudioReading = () => {
    if (!isPremium) {
      setPendingAction('audio');
      setShowPaywall(true);
      return;
    }
    animateButton(buttonScale2);
    router.push({
      pathname: "/lyrics-reader",
      params: {
        summary: selectedSummary || '',
        title: bookInfo?.title || '',
        author: bookInfo?.author || '',
      },
    });
  };

  const handlePaywallSuccess = () => {
    if (pendingAction === 'chapter') {
      setSummaryType('chapter');
      generateSummary('chapter');
    } else if (pendingAction === 'fiche') {
      generateFiche();
    } else if (pendingAction === 'audio') {
      router.push({
        pathname: "/lyrics-reader",
        params: {
          summary: selectedSummary || '',
          title: bookInfo?.title || '',
          author: bookInfo?.author || '',
        },
      });
    } else if (pendingAction === 'flashcards') {
      router.push({
        pathname: "/flashcards",
        params: {
          summary: selectedSummary || '',
          title: bookInfo?.title || '',
          author: bookInfo?.author || '',
        },
      });
    }
    setPendingAction(null);
  };

const animateButton = (scale: Animated.Value) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGenerateFlashcards = () => {
    if (!isPremium) {
      setPendingAction('flashcards');
      setShowPaywall(true);
      return;
    }

    animateButton(flashcardButtonScale);
    router.push({
      pathname: "/flashcards",
      params: {
        summary: selectedSummary || '',
        title: bookInfo?.title || '',
        author: bookInfo?.author || '',
      },
    });
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
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>{t.summary.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingIconWrap, { opacity: loadingPulse }]}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: loadingRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <Loader2 size={48} color={colors.primary} />
              </Animated.View>
            </Animated.View>
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
              {t.summary.generating}
            </Text>
            <Text style={[styles.loadingSubtext, isDarkMode && styles.loadingSubtextDark]}>
              {language === 'fr' ? 'Identification du livre et génération du résumé' : 'Book identification and summary generation'}
            </Text>
            <View style={styles.loadingDotsRow}>
              {[loadingDotScale1, loadingDotScale2, loadingDotScale3].map((dot, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.loadingDot,
                    { backgroundColor: colors.primary, opacity: dot, transform: [{ scale: dot }] },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <BookOpen size={48} color={colors.primary} />
            <Text style={[styles.errorTitle, isDarkMode && styles.errorTitleDark]}>{t.summary.error}</Text>
            <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
              {language === 'fr'
                ? "Impossible d'analyser la couverture. Veuillez réessayer avec une image plus claire."
                : "Unable to analyze the cover. Please try again with a clearer image."}
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={styles.retryButton}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t.summary.retry}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : bookInfo && !summaryType ? (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: cardSlideAnim }] }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={[styles.bookCard, isDarkMode && styles.bookCardDark]}>
                {(bookInfo.coverUrl || bookInfo.coverUrlFallback) && (
                  <Animated.View style={{ transform: [{ scale: coverScale }] }}>
                    <Image
                      source={{ uri: coverLoadFailed ? (bookInfo.coverUrlFallback || bookInfo.coverUrl) : bookInfo.coverUrl }}
                      style={styles.coverImage}
                      contentFit="cover"
                      onError={() => {
                        console.log('Cover image failed to load, trying fallback...');
                        if (!coverLoadFailed) setCoverLoadFailed(true);
                      }}
                      cachePolicy="memory-disk"
                    />
                  </Animated.View>
                )}
                <View style={styles.bookInfo}>
                  <View style={styles.infoRow}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={[styles.bookTitle, isDarkMode && styles.bookTitleDark]}>{bookInfo.title}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <User size={18} color={colors.secondary} />
                    <Text style={[styles.bookAuthor, isDarkMode && styles.bookAuthorDark]}>{bookInfo.author}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.selectionCard, isDarkMode && styles.selectionCardDark]}>
                <Text style={[styles.selectionTitle, isDarkMode && styles.selectionTitleDark]}>{t.summary.selectType}</Text>
                
                <Animated.View style={{ transform: [{ scale: optionScale1 }] }}>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleSelectSummaryType('normal');
                    }}
                    onPressIn={() => {
                      Animated.spring(optionScale1, {
                        toValue: 0.95,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(optionScale1, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                      }).start();
                    }}
                    style={styles.summaryOption}
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.optionGradient}
                    >
                      <FileText size={32} color="#FFF" strokeWidth={2} />
                      <Text style={styles.optionTitle}>{t.summary.normalSummary}</Text>
                      <Text style={styles.optionDesc}>{t.summary.normalDesc}</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: optionScale2 }] }}>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleSelectSummaryType('chapter');
                    }}
                    onPressIn={() => {
                      Animated.spring(optionScale2, {
                        toValue: 0.95,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(optionScale2, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                      }).start();
                    }}
                    style={styles.summaryOption}
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.optionGradient}
                    >
                      <View style={styles.premiumBadge}>
                        <Sparkles size={12} color="#FFF" />
                        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                      </View>
                      <BookOpen size={32} color="#FFF" strokeWidth={2} />
                      <Text style={styles.optionTitle}>{t.summary.chapterSummary}</Text>
                      <Text style={styles.optionDesc}>{t.summary.chapterDesc}</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </ScrollView>
          </Animated.View>
        ) : copyrightError ? (
          <View style={styles.errorContainer}>
            <BookOpen size={48} color={colors.primary} />
            <Text style={[styles.errorTitle, isDarkMode && styles.errorTitleDark]}>{t.summary.copyrightError}</Text>
            <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
              {t.summary.copyrightErrorMessage}
            </Text>
            <Pressable
              onPress={() => {
                setCopyrightError(false);
                setSummaryType(null);
                setSelectedSummary('');
              }}
              style={styles.retryButton}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t.summary.backToSelection}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : isSummaryError ? (
          <View style={styles.errorContainer}>
            <BookOpen size={48} color={colors.primary} />
            <Text style={[styles.errorTitle, isDarkMode && styles.errorTitleDark]}>{t.summary.error}</Text>
            <Text style={[styles.errorText, isDarkMode && styles.errorTextDark]}>
              {language === 'fr'
                ? "Impossible de générer le résumé. Veuillez réessayer."
                : "Unable to generate the summary. Please try again."}
            </Text>
            <Pressable
              onPress={() => {
                setSummaryType(null);
                setSelectedSummary('');
              }}
              style={styles.retryButton}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t.summary.retry}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : isGeneratingSummary ? (
          <View style={styles.loadingContainer}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: loadingRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Loader2 size={48} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
              {t.summary.generating}
            </Text>
            <Text style={[styles.loadingSubtext, isDarkMode && styles.loadingSubtextDark]}>
              {language === 'fr' 
                ? summaryType === 'chapter' 
                  ? 'Génération du résumé par chapitre' 
                  : 'Génération du résumé'
                : summaryType === 'chapter'
                  ? 'Generating chapter summary'
                  : 'Generating summary'}
            </Text>
          </View>
        ) : bookInfo && summaryType && selectedSummary ? (
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: cardSlideAnim }] }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={[styles.bookCard, isDarkMode && styles.bookCardDark]}>
                {(bookInfo.coverUrl || bookInfo.coverUrlFallback) && (
                  <Animated.View style={{ transform: [{ scale: coverScale }] }}>
                    <Image
                      source={{ uri: coverLoadFailed ? (bookInfo.coverUrlFallback || bookInfo.coverUrl) : bookInfo.coverUrl }}
                      style={styles.coverImage}
                      contentFit="cover"
                      onError={() => {
                        console.log('Cover image failed to load (summary view), trying fallback...');
                        if (!coverLoadFailed) setCoverLoadFailed(true);
                      }}
                      cachePolicy="memory-disk"
                    />
                  </Animated.View>
                )}
                <View style={styles.bookInfo}>
                  <View style={styles.infoRow}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={[styles.bookTitle, isDarkMode && styles.bookTitleDark]}>{bookInfo.title}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <User size={18} color={colors.secondary} />
                    <Text style={[styles.bookAuthor, isDarkMode && styles.bookAuthorDark]}>{bookInfo.author}</Text>
                  </View>
                </View>
              </View>

              <Animated.View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark, { opacity: summaryCardFade, transform: [{ translateY: summaryCardSlide }] }]}>
                <View style={styles.summaryHeader}>
                  <Text style={[styles.summaryTitle, isDarkMode && styles.summaryTitleDark]}>{t.summary.title}</Text>
                  <View style={styles.headerActions}>
                  <View style={styles.textSizer}>
                    <Animated.View style={{ transform: [{ scale: textSizeButtonScale1 }] }}>
                      <Pressable
                        onPress={() => {
                          setTextSize(prev => Math.max(12, prev - 2));
                          Animated.sequence([
                            Animated.spring(textSizeButtonScale1, {
                              toValue: 0.8,
                              useNativeDriver: true,
                            }),
                            Animated.spring(textSizeButtonScale1, {
                              toValue: 1,
                              friction: 3,
                              useNativeDriver: true,
                            }),
                          ]).start();
                        }}
                        style={[styles.textSizeButton, isDarkMode && styles.textSizeButtonDark]}
                      >
                        <Text style={[styles.textSizeLabel, isDarkMode && styles.textSizeLabelDark]}>A-</Text>
                      </Pressable>
                    </Animated.View>
                    <Animated.View style={{ transform: [{ scale: textSizeButtonScale2 }] }}>
                      <Pressable
                        onPress={() => {
                          setTextSize(prev => Math.min(24, prev + 2));
                          Animated.sequence([
                            Animated.spring(textSizeButtonScale2, {
                              toValue: 0.8,
                              useNativeDriver: true,
                            }),
                            Animated.spring(textSizeButtonScale2, {
                              toValue: 1,
                              friction: 3,
                              useNativeDriver: true,
                            }),
                          ]).start();
                        }}
                        style={[styles.textSizeButton, isDarkMode && styles.textSizeButtonDark]}
                      >
                        <Text style={[styles.textSizeLabel, { fontSize: 16 }, isDarkMode && styles.textSizeLabelDark]}>A+</Text>
                      </Pressable>
                    </Animated.View>
                  </View>
                  <Animated.View style={{ transform: [{ scale: expandButtonScale }] }}>
                    <Pressable
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({
                          pathname: "/full-summary",
                          params: {
                            summary: selectedSummary || '',
                            title: bookInfo?.title || '',
                            author: bookInfo?.author || '',
                            summaryType: summaryType || 'normal',
                          },
                        });
                      }}
                      style={[styles.expandButton, isDarkMode && styles.expandButtonDark]}
                      onPressIn={() => {
                        Animated.spring(expandButtonScale, { toValue: 0.85, useNativeDriver: true }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(expandButtonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
                      }}
                    >
                      <Maximize2 size={18} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
                    </Pressable>
                  </Animated.View>
                  </View>
                </View>
                <Text style={[styles.summaryText, { fontSize: textSize, lineHeight: textSize * 1.6 }, isDarkMode && styles.summaryTextDark]}>
                  {selectedSummary.replace(/\*/g, '')}
                </Text>
              </Animated.View>

              <Animated.View style={[styles.actionsSection, isDarkMode && styles.actionsSectionDark, { opacity: actionsCardFade, transform: [{ translateY: actionsCardSlide }] }]}>
                <View style={styles.actionsSectionHeader}>
                  <Text style={[styles.actionsSectionTitle, isDarkMode && styles.actionsSectionTitleDark]}>
                    {language === 'fr' ? 'Actions premium' : 'Premium actions'}
                  </Text>
                  <Text style={[styles.actionsSectionSubtitle, isDarkMode && styles.actionsSectionSubtitleDark]}>
                    {language === 'fr'
                      ? 'Accède plus vite à tes outils de révision.'
                      : 'Get faster access to your study tools.'}
                  </Text>
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScale1 }] }}>
                  <Pressable
                    onPress={handleGenerateFiche}
                    style={styles.primaryActionButton}
                    disabled={isGeneratingFiche}
                    testID="generate-fiche-button"
                  >
                    <LinearGradient
                      colors={colors.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryActionGradient}
                    >
                      <View style={styles.primaryActionIconWrap}>
                        {isGeneratingFiche ? (
                          <Loader2 size={22} color="#FFF" />
                        ) : (
                          <FileText size={22} color="#FFF" />
                        )}
                      </View>
                      <View style={styles.primaryActionContent}>
                        <Text style={styles.primaryActionTitle}>
                          {isGeneratingFiche
                            ? (language === 'fr' ? 'Génération en cours...' : 'Generating...')
                            : t.summary.generateFiche}
                        </Text>
                        <Text style={styles.primaryActionSubtitle}>
                          {language === 'fr'
                            ? 'Analyse complète, idées clés et axes de lecture.'
                            : 'Complete analysis, key ideas, and reading insights.'}
                        </Text>
                      </View>
                      <Sparkles size={18} color="#FFF" />
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <View style={styles.secondaryActionsRow}>
                  <Animated.View style={[styles.secondaryActionColumn, { transform: [{ scale: buttonScale2 }] }]}>
                    <Pressable
                      onPress={handleAudioReading}
                      style={styles.secondaryActionButton}
                      testID="audio-reading-button"
                    >
                      <View style={styles.glowingBorderPremium}>
                        <LinearGradient
                          colors={colors.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.secondaryActionGradient}
                        >
                          <Volume2 size={20} color="#FFF" />
                          <Text style={styles.secondaryActionTitle}>{t.summary.animatedReading}</Text>
                          <Text style={styles.secondaryActionSubtitle}>
                            {language === 'fr' ? 'Écoute le résumé' : 'Listen to the summary'}
                          </Text>
                        </LinearGradient>
                      </View>
                    </Pressable>
                  </Animated.View>

                  <Animated.View style={[styles.secondaryActionColumn, { transform: [{ scale: flashcardButtonScale }] }]}>
                    <Pressable
                      onPress={handleGenerateFlashcards}
                      style={styles.secondaryActionButton}
                      testID="flashcard-generate-button"
                    >
                      <View style={styles.glowingBorderPremium}>
                        <LinearGradient
                          colors={colors.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.secondaryActionGradient}
                        >
                          <Sparkles size={20} color="#FFF" />
                          <Text style={styles.secondaryActionTitle}>{t.summary.flashcards}</Text>
                          <Text style={styles.secondaryActionSubtitle}>
                            {language === 'fr' ? 'Teste ta compréhension avec des questions sur le livre.' : 'Test your understanding with questions about the book.'}
                          </Text>
                        </LinearGradient>
                      </View>
                    </Pressable>
                  </Animated.View>
                </View>
              </Animated.View>
            </ScrollView>
          </Animated.View>
        ) : null}
      </SafeAreaView>

      <Paywall
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          setPendingAction(null);
        }}
        onSuccess={handlePaywallSuccess}
      />
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
    zIndex: 0,
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#3E2723",
    textAlign: "center",
  },
  loadingTextDark: {
    color: "#FFF",
  },
  loadingSubtext: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
  },
  loadingSubtextDark: {
    color: "#E0E0E0",
  },
  loadingIconWrap: {
    marginBottom: 8,
  },
  loadingDotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  errorTitleDark: {
    color: "#FFF",
  },
  errorText: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
    lineHeight: 24,
  },
  errorTextDark: {
    color: "#E0E0E0",
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  coverImage: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    overflow: "hidden",
  },
  bookInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bookTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#3E2723",
  },
  bookTitleDark: {
    color: "#FFF",
  },
  bookAuthor: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#5D4037",
  },
  bookAuthorDark: {
    color: "#E0E0E0",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textSizer: {
    flexDirection: "row",
    gap: 8,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  expandButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  textSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  textSizeButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  textSizeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#3E2723",
  },
  textSizeLabelDark: {
    color: "#FFF",
  },
  summaryCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#3E2723",
    flex: 1,
  },
  summaryTitleDark: {
    color: "#FFF",
  },
  summaryText: {
    fontSize: 16,
    color: "#4E342E",
    lineHeight: 26,
  },
  summaryTextDark: {
    color: "#E0E0E0",
  },
  actionsSection: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  actionsSectionDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  actionsSectionHeader: {
    gap: 4,
  },
  actionsSectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#2F1E1A",
  },
  actionsSectionTitleDark: {
    color: "#FFF",
  },
  actionsSectionSubtitle: {
    fontSize: 14,
    color: "#6D4C41",
    lineHeight: 20,
  },
  actionsSectionSubtitleDark: {
    color: "#D7DCE5",
  },
  primaryActionButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  primaryActionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionContent: {
    flex: 1,
    gap: 4,
  },
  primaryActionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  primaryActionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.86)",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryActionColumn: {
    flex: 1,
  },
  secondaryActionButton: {
    borderRadius: 16,
  },
  secondaryActionGradient: {
    minHeight: 138,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  secondaryActionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.86)",
  },
  glowingBorder: {
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  glowingBorderPremium: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#AB47BC",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  premiumBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  selectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 20,
  },
  selectionCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#3E2723",
    textAlign: "center",
    marginBottom: 8,
  },
  selectionTitleDark: {
    color: "#FFF",
  },
  summaryOption: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  optionGradient: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
    textAlign: "center",
  },
  optionDesc: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    textAlign: "center",
  },
});
