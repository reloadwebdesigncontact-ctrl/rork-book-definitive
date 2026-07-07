import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Clock, Trash2, User } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BookCoverGlow } from "@/components/BookCoverGlow";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  clearHistory,
  getHistory,
  HistoryEntry,
  removeFromHistory,
} from "@/utils/history";

export default function HistoryScreen() {
  const router = useRouter();
  const { isDarkMode, colors } = useTheme();
  const { language } = useLanguage();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getHistory().then(setHistory);
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      language === 'fr' ? 'Supprimer' : 'Delete',
      language === 'fr' ? 'Supprimer ce livre de l\'historique ?' : 'Remove this book from history?',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel', style: 'cancel' },
        {
          text: language === 'fr' ? 'Supprimer' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeFromHistory(id);
            setHistory((prev) => prev.filter((h) => h.id !== id));
            if (selectedEntry?.id === id) setSelectedEntry(null);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      language === 'fr' ? 'Vider l\'historique' : 'Clear history',
      language === 'fr' ? 'Supprimer tous les livres de l\'historique ?' : 'Delete all books from history?',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel', style: 'cancel' },
        {
          text: language === 'fr' ? 'Tout supprimer' : 'Delete all',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
            setSelectedEntry(null);
          },
        },
      ]
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  // Detail view
  if (selectedEntry) {
    return (
      <View style={styles.container}>
        {isDarkMode ? (
          <Image
            source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        ) : (
          <LinearGradient colors={["#FFF8F0", "#F5EBE0", "#E8D5C4"]} style={styles.gradient} />
        )}
        <AnimatedBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => setSelectedEntry(null)} style={styles.backButton}>
              <ArrowLeft size={24} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
            </Pressable>
            <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]} numberOfLines={1}>
              {selectedEntry.title}
            </Text>
            <Pressable onPress={() => handleDelete(selectedEntry.id)} style={styles.backButton}>
              <Trash2 size={20} color="#EF4444" strokeWidth={2.5} />
            </Pressable>
          </View>

          <Animated.ScrollView
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cover + info */}
            <View style={[styles.detailCard, isDarkMode && styles.detailCardDark]}>
              {selectedEntry.coverUrl ? (
                <BookCoverGlow
                  uri={selectedEntry.coverUrl}
                  width={130}
                  height={180}
                  borderRadius={10}
                />
              ) : (
                <View style={[styles.detailCoverPlaceholder, { backgroundColor: colors.primary + '22' }]}>
                  <BookOpen size={48} color={colors.primary} />
                </View>
              )}
              <View style={styles.detailMeta}>
                <Text style={[styles.detailTitle, isDarkMode && styles.detailTitleDark]}>
                  {selectedEntry.title}
                </Text>
                <View style={styles.detailRow}>
                  <User size={14} color={colors.secondary} />
                  <Text style={[styles.detailAuthor, isDarkMode && styles.detailAuthorDark]}>
                    {selectedEntry.author}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color={isDarkMode ? '#888' : '#999'} />
                  <Text style={[styles.detailDate, isDarkMode && styles.detailDateDark]}>
                    {formatDate(selectedEntry.scannedAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Summary */}
            {selectedEntry.summary ? (
              <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
                <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                  {language === 'fr' ? 'Résumé' : 'Summary'}
                </Text>
                <Text style={[styles.summaryText, isDarkMode && styles.summaryTextDark]}>
                  {selectedEntry.summary}
                </Text>
              </View>
            ) : (
              <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
                <Text style={[styles.summaryText, isDarkMode && styles.summaryTextDark, { textAlign: 'center', opacity: 0.5 }]}>
                  {language === 'fr' ? 'Aucun résumé enregistré' : 'No summary saved'}
                </Text>
              </View>
            )}
          </Animated.ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <Image
          source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/boof1ttrhv3930fdbb014" }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      ) : (
        <LinearGradient colors={["#FFF8F0", "#F5EBE0", "#E8D5C4"]} style={styles.gradient} />
      )}
      <AnimatedBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={isDarkMode ? "#FFF" : "#3E2723"} strokeWidth={2.5} />
          </Pressable>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            {language === 'fr' ? 'Historique' : 'History'}
          </Text>
          {history.length > 0 ? (
            <Pressable onPress={handleClearAll} style={styles.backButton}>
              <Trash2 size={20} color="#EF4444" strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color={isDarkMode ? '#444' : '#CCC'} strokeWidth={1.5} />
            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
              {language === 'fr' ? 'Aucun livre scanné' : 'No books scanned yet'}
            </Text>
            <Text style={[styles.emptySubtext, isDarkMode && styles.emptySubtextDark]}>
              {language === 'fr'
                ? 'Vos livres scannés apparaîtront ici'
                : 'Your scanned books will appear here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedEntry(item)}
                style={[styles.historyItem, isDarkMode && styles.historyItemDark]}
              >
                {item.coverUrl ? (
                  <BookCoverGlow
                    uri={item.coverUrl}
                    width={64}
                    height={88}
                    borderRadius={8}
                    noMargin
                  />
                ) : (
                  <View style={[styles.historyCoverPlaceholder, { backgroundColor: colors.primary + '22' }]}>
                    <BookOpen size={24} color={colors.primary} />
                  </View>
                )}
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyTitle, isDarkMode && styles.historyTitleDark]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.historyAuthor, isDarkMode && styles.historyAuthorDark]} numberOfLines={1}>
                    {item.author}
                  </Text>
                  <Text style={[styles.historyDate, isDarkMode && styles.historyDateDark]}>
                    {formatDate(item.scannedAt)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  gradient: { position: 'absolute', width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '700' as const, color: '#3E2723',
    flex: 1, textAlign: 'center', marginHorizontal: 8,
  },
  headerTitleDark: { color: '#FFF' },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16, padding: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  historyItemDark: { backgroundColor: 'rgba(255,255,255,0.08)', elevation: 0, shadowOpacity: 0 },
  historyCover: { width: 56, height: 76, borderRadius: 8 },
  historyCoverPlaceholder: {
    width: 56, height: 76, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  historyInfo: { flex: 1, gap: 4 },
  historyTitle: { fontSize: 15, fontWeight: '700' as const, color: '#3E2723', lineHeight: 20 },
  historyTitleDark: { color: '#FFF' },
  historyAuthor: { fontSize: 13, color: '#8D6E63' },
  historyAuthorDark: { color: '#AAA' },
  historyDate: { fontSize: 11, color: '#BDBDBD' },
  historyDateDark: { color: '#666' },
  deleteBtn: { padding: 4 },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40,
  },
  emptyText: { fontSize: 18, fontWeight: '700' as const, color: '#3E2723', textAlign: 'center' },
  emptyTextDark: { color: '#FFF' },
  emptySubtext: { fontSize: 14, color: '#8D6E63', textAlign: 'center', lineHeight: 22 },
  emptySubtextDark: { color: '#888' },
  // Detail view
  detailContent: { padding: 16, gap: 16, paddingBottom: 40 },
  detailCard: {
    flexDirection: 'row', gap: 16,
    backgroundColor: '#FFF',
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  detailCardDark: { backgroundColor: 'rgba(255,255,255,0.08)', elevation: 0, shadowOpacity: 0 },
  detailCover: { width: 90, height: 120, borderRadius: 10 },
  detailCoverPlaceholder: {
    width: 90, height: 120, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  detailMeta: { flex: 1, gap: 8, justifyContent: 'center' },
  detailTitle: { fontSize: 18, fontWeight: '800' as const, color: '#3E2723', lineHeight: 24 },
  detailTitleDark: { color: '#FFF' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailAuthor: { fontSize: 14, color: '#8D6E63', fontWeight: '500' as const },
  detailAuthorDark: { color: '#AAA' },
  detailDate: { fontSize: 12, color: '#BDBDBD' },
  detailDateDark: { color: '#666' },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    gap: 12,
  },
  summaryCardDark: { backgroundColor: 'rgba(255,255,255,0.08)', elevation: 0, shadowOpacity: 0 },
  summaryLabel: { fontSize: 13, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 1 },
  summaryText: { fontSize: 15, color: '#4E342E', lineHeight: 24 },
  summaryTextDark: { color: '#E0E0E0' },
});
