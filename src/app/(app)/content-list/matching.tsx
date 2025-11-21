import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, RotateCcw, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type CardType = "word" | "meaning";

interface MatchingCard {
  id: string;
  type: CardType;
  content: string;
  pairId: string; // ID để match với card kia
  isSelected: boolean;
  isMatched: boolean;
}

const MatchingGameScreen = () => {
  const { t } = useTranslation();
  const { id, contentType } = useLocalSearchParams<{
    id?: string;
    contentType?: string;
  }>();

  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Get content data based on content type
  const getContentData = () => {
    switch (contentType) {
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  };

  const contentData: any[] = getContentData();

  // Initialize cards from content data
  const initializeCards = useCallback(() => {
    if (contentData.length === 0) return [];

    const allCards: MatchingCard[] = [];

    contentData.forEach((item, index) => {
      const pairId = `pair-${index}`;

      if (contentType === "kanji") {
        // Kanji cards
        const meaning =
          item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

        // Word card: Kanji character
        allCards.push({
          id: `kanji-${index}`,
          type: "word",
          content: item.character,
          pairId,
          isSelected: false,
          isMatched: false,
        });

        // Meaning card
        allCards.push({
          id: `meaning-${index}`,
          type: "meaning",
          content: meaning,
          pairId,
          isSelected: false,
          isMatched: false,
        });
      } else {
        // Vocabulary cards
        const wordJp = item.wordJp || "";
        const meanings = (item.meanings || [])
          .map((m: any) =>
            typeof m === "string" ? m : m.meaning || m.text || ""
          )
          .filter(Boolean);

        const meaning = meanings.length > 0 ? meanings[0] : t("lessons.no_meaning");

        // Word card: Japanese word
        allCards.push({
          id: `word-${index}`,
          type: "word",
          content: wordJp,
          pairId,
          isSelected: false,
          isMatched: false,
        });

        // Meaning card
        allCards.push({
          id: `meaning-${index}`,
          type: "meaning",
          content: meaning,
          pairId,
          isSelected: false,
          isMatched: false,
        });
      }
    });

    // Shuffle all cards together
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    return allCards;
  }, [contentData, contentType, t]);

  // Initialize game on mount and when data changes
  useEffect(() => {
    if (contentData.length > 0 && cards.length === 0) {
      const initializedCards = initializeCards();
      setCards(initializedCards);
    }
  }, [contentData.length, initializeCards, cards.length]);

  // Reset game
  const resetGame = useCallback(() => {
    setSelectedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameComplete(false);
    setIsChecking(false);
    const initializedCards = initializeCards();
    setCards(initializedCards);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initializeCards]);

  // Handle card press
  const handleCardPress = (index: number) => {
    if (isChecking) return;
    if (cards[index].isMatched) return;
    if (selectedIndices.length >= 2) return;
    if (selectedIndices.includes(index)) {
      // Deselect if already selected
      const newSelected = selectedIndices.filter((i) => i !== index);
      setSelectedIndices(newSelected);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    // If 2 cards selected, check for match
    if (newSelected.length === 2) {
      checkMatch(newSelected[0], newSelected[1]);
    }
  };

  // Check if selected cards match
  const checkMatch = (firstIndex: number, secondIndex: number) => {
    setIsChecking(true);
    setMoves((prev) => prev + 1);

    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    setTimeout(() => {
      if (
        firstCard.pairId === secondCard.pairId &&
        firstCard.type !== secondCard.type
      ) {
        // Match found!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Mark cards as matched but keep them in array
        const updatedCards = [...cards];
        updatedCards[firstIndex].isMatched = true;
        updatedCards[secondIndex].isMatched = true;

        setCards(updatedCards);
        setMatchedPairs((prev) => {
          const newCount = prev + 1;
          // Check if game is complete
          if (newCount >= contentData.length) {
            setTimeout(() => {
              setIsGameComplete(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 500);
          }
          return newCount;
        });
      } else {
        // No match
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setSelectedIndices([]);
      setIsChecking(false);
    }, 600);
  };

  // Calculate card size for grid
  const padding = 24;
  const cardSpacing = 12;
  const numColumns = 3; // 3 columns for grid
  const availableWidth = width - padding * 2;
  const cardSize = (availableWidth - cardSpacing * (numColumns - 1)) / numColumns;
  const cardHeight = 120;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  if (contentData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LinearGradient
          colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
          style={{ flex: 1 }}
        >
          <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="#6b7280" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <ThemedText
                style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}
              >
                {t(
                  contentType === "kanji"
                    ? "content_list.activity.match.kanji"
                    : "content_list.activity.match.vocabulary",
                  contentType === "kanji"
                    ? "Match kanji"
                    : "Match vocabulary"
                )}
              </ThemedText>
            </View>
            <View style={{ width: 24 }} />
          </View>
          <View className="flex-1 items-center justify-center p-6">
            <ThemedText style={{ fontSize: 18, color: "#6b7280", textAlign: "center" }}>
              {t("content_list.matching.no_content", "No content available")}
            </ThemedText>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}
            >
              {t(
                contentType === "kanji"
                  ? "content_list.activity.match.kanji"
                  : "content_list.activity.match.vocabulary",
                contentType === "kanji"
                  ? "Match kanji"
                  : "Match vocabulary"
              )}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={resetGame} activeOpacity={0.7}>
            <RotateCcw size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View className="px-6 py-3 flex-row justify-between items-center">
          <View className="flex-row items-center" style={{ gap: 16 }}>
            <View>
              <ThemedText style={{ fontSize: 12, color: "#6b7280" }}>
                {t("content_list.matching.pairs", "Pairs")}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {matchedPairs}/{contentData.length}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={{ fontSize: 12, color: "#6b7280" }}>
                {t("content_list.matching.moves", "Moves")}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {moves}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Game Board */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: padding,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions */}
          <View className="mb-4 px-2">
            <ThemedText
              style={{
                fontSize: 14,
                color: "#4b5563",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {t(
                "content_list.matching.instruction",
                "Select two cards to match a word with its meaning"
              )}
            </ThemedText>
          </View>

          {/* Grid Layout - All cards shuffled together */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              gap: cardSpacing,
            }}
          >
            {cards.map((card, index) => {
              const isSelected = selectedIndices.includes(index);
              const isWordCard = card.type === "word";
              const scaleAnim = new Animated.Value(isSelected ? 1.05 : 1);

              if (isSelected) {
                Animated.spring(scaleAnim, {
                  toValue: 1.05,
                  tension: 100,
                  friction: 7,
                  useNativeDriver: true,
                }).start();
              } else {
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  tension: 100,
                  friction: 7,
                  useNativeDriver: true,
                }).start();
              }

              return (
                <Animated.View
                  key={card.id}
                  style={{
                    width: cardSize,
                    height: cardHeight,
                    transform: [{ scale: scaleAnim }],
                    opacity: card.isMatched ? 0 : 1,
                  }}
                  pointerEvents={card.isMatched ? "none" : "auto"}
                >
                  <TouchableOpacity
                    onPress={() => handleCardPress(index)}
                    activeOpacity={0.8}
                    disabled={isChecking || card.isMatched}
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
                      borderRadius: 16,
                      borderWidth: 3,
                      borderColor: isSelected ? "#f59e0b" : "#d1d5db",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 6,
                      padding: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: isWordCard
                          ? contentType === "kanji"
                            ? 32
                            : 20
                          : 16,
                        fontWeight: "bold",
                        color: "#000000",
                        textAlign: "center",
                      }}
                      numberOfLines={isWordCard ? 2 : 3}
                    >
                      {card.content}
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Completion Modal */}
        <Modal
          visible={isGameComplete}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsGameComplete(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 32,
                alignItems: "center",
                width: "100%",
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={["#fbbf24", "#f59e0b"]}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Trophy size={40} color="#ffffff" />
              </LinearGradient>

              <ThemedText
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {t("content_list.matching.complete", "Congratulations!")}
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                {t("content_list.matching.complete_message", "You matched all pairs!")}
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#4f46e5",
                  marginBottom: 32,
                }}
              >
                {t("content_list.matching.total_moves", {
                  defaultValue: `Total moves: ${moves}`,
                  moves,
                })}
              </ThemedText>

              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsGameComplete(false);
                    resetGame();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#4f46e5",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#ffffff",
                    }}
                  >
                    {t("content_list.matching.play_again", "Play Again")}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsGameComplete(false);
                    router.back();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#e5e7eb",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    {t("common.close", "Close")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MatchingGameScreen;
