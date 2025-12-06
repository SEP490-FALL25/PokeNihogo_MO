import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, RotateCcw, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

type CardType = "word" | "meaning";

interface MatchingCard {
  id: string;
  type: CardType;
  content: string;
  pairId: string; // ID để match với card kia
  isSelected: boolean;
  isMatched: boolean;
}

// Card component with animations
const MatchingCardComponent = React.memo(({
  card,
  index,
  isSelected,
  cardSize,
  cardHeight,
  contentType,
  scaleRef,
  opacityRef,
  selectionScaleRef,
  onPress,
  disabled,
}: {
  card: MatchingCard;
  index: number;
  isSelected: boolean;
  cardSize: number;
  cardHeight: number;
  contentType?: string;
  scaleRef: Animated.Value;
  opacityRef: Animated.Value;
  selectionScaleRef: Animated.Value;
  onPress: () => void;
  disabled: boolean;
}) => {
  const isWordCard = card.type === "word";
  
  // Animate selection scale
  useEffect(() => {
    Animated.spring(selectionScaleRef, {
      toValue: isSelected ? 1.05 : 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isSelected, selectionScaleRef]);
  
  // Combine base scale with selection scale
  const combinedScale = Animated.multiply(scaleRef, selectionScaleRef);
  
  return (
    <Animated.View
      style={{
        width: cardSize,
        height: cardHeight,
        transform: [{ scale: combinedScale }],
        opacity: opacityRef,
      }}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: isSelected ? "#fef3c7" : "#ffffff",
          borderRadius: 16,
          borderWidth: 3,
          borderColor: isSelected ? "#f59e0b" : "#d1d5db",padding: 12,
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
});

MatchingCardComponent.displayName = "MatchingCardComponent";

const MatchingGameScreen = () => {
  const { t } = useTranslation();
  const { id, contentType } = useLocalSearchParams<{
    id?: string;
    contentType?: string;
  }>();

  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  const [allCardsPool, setAllCardsPool] = useState<MatchingCard[]>([]); // All cards pool
  const [cards, setCards] = useState<MatchingCard[]>([]); // Displayed cards (max 12)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [nextCardIndex, setNextCardIndex] = useState<number>(0); // Index to get next cards from pool
  const MAX_DISPLAYED_CARDS = 12; // 3x4 = 12 cards (6 pairs)
  
  // Animation refs for each card
  const cardScaleRefs = useRef<{ [key: string]: Animated.Value }>({});
  const cardOpacityRefs = useRef<{ [key: string]: Animated.Value }>({});
  const cardSelectionScaleRefs = useRef<{ [key: string]: Animated.Value }>({});
  
  // Initialize animation refs for a card
  const initCardAnimation = useCallback((cardId: string, isNewCard = false) => {
    if (!cardScaleRefs.current[cardId]) {
      cardScaleRefs.current[cardId] = new Animated.Value(isNewCard ? 0 : 1);
    }
    if (!cardOpacityRefs.current[cardId]) {
      cardOpacityRefs.current[cardId] = new Animated.Value(isNewCard ? 0 : 1);
    }
  }, []);
  
  // Animate card match out (zoom in -> zoom out -> fade out)
  const animateCardMatchOut = useCallback((cardId: string, callback?: () => void) => {
    const scaleAnim = cardScaleRefs.current[cardId];
    const opacityAnim = cardOpacityRefs.current[cardId];
    
    if (!scaleAnim || !opacityAnim) {
      callback?.();
      return;
    }
    
    Animated.sequence([
      // Zoom in
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      // Zoom out
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(callback);
  }, []);
  
  // Animate card in (zoom in from 0)
  const animateCardIn = useCallback((cardId: string) => {
    const scaleAnim = cardScaleRefs.current[cardId];
    const opacityAnim = cardOpacityRefs.current[cardId];
    
    if (!scaleAnim || !opacityAnim) return;
    
    // Start from 0
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    
    // Animate to 1
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  // Helper function to initialize displayed cards from pool
  const initializeDisplayedCards = useCallback((allCards: MatchingCard[]) => {
    // Display first 6 complete pairs (12 cards)
    // Find first 6 unique pairIds and get both cards (word + meaning) for each pair
    const displayedPairIds = new Set<string>();
    const initialDisplayed: MatchingCard[] = [];
    
    for (const card of allCards) {
      if (initialDisplayed.length >= MAX_DISPLAYED_CARDS) break;
      
      if (!displayedPairIds.has(card.pairId)) {
        // Find both cards (word and meaning) of this pair
        const pairCards = allCards.filter((c) => c.pairId === card.pairId);
        if (pairCards.length === 2) {
          // Add both cards to display
          initialDisplayed.push(...pairCards);
          displayedPairIds.add(card.pairId);
          
          // Initialize animation refs for displayed cards
          pairCards.forEach((c) => {
            initCardAnimation(c.id);
          });
        }
      }
    }
    
    setCards(initialDisplayed);
    // Update nextCardIndex to skip all displayed cards
    setNextCardIndex(
      allCards.findIndex(
        (card) => !displayedPairIds.has(card.pairId)
      ) === -1
        ? allCards.length
        : allCards.findIndex((card) => !displayedPairIds.has(card.pairId))
    );
  }, [initCardAnimation]);

  // Initialize game on mount and when data changes
  useEffect(() => {
    if (contentData.length > 0 && allCardsPool.length === 0) {
      const allCards = initializeCards();
      setAllCardsPool(allCards);
      initializeDisplayedCards(allCards);
    }
  }, [contentData.length, initializeCards, allCardsPool.length, initializeDisplayedCards]);

  // Timer countdown
  useEffect(() => {
    if (isGameComplete || isTimeUp || cards.length === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameComplete, isTimeUp, cards.length]);

  // Handle time up
  useEffect(() => {
    if (isTimeUp && !isGameComplete) {
      setIsGameComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [isTimeUp, isGameComplete]);

  // Initialize animation refs for cards
  useEffect(() => {
    cards.forEach((card) => {
      initCardAnimation(card.id);
    });
  }, [cards, initCardAnimation]);

  // Reset game
  const resetGame = useCallback(() => {
    // Clear all state first
    setSelectedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameComplete(false);
    setIsChecking(false);
    setTimeRemaining(600); // Reset to 10 minutes
    setIsTimeUp(false);
    setNextCardIndex(0);
    
    // Clear animation refs
    cardScaleRefs.current = {};
    cardOpacityRefs.current = {};
    cardSelectionScaleRefs.current = {};
    
    // Initialize new cards pool and display immediately
    const allCards = initializeCards();
    
    // Set new pool and initialize displayed cards directly (don't clear first)
    setAllCardsPool(allCards);
    initializeDisplayedCards(allCards);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initializeCards, initializeDisplayedCards]);

  // Format time to mm:ss
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

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

        // Initialize animation refs for matched cards
        initCardAnimation(firstCard.id);
        initCardAnimation(secondCard.id);
        
        // Find next complete pair from pool before animation
        let newNextIndex = nextCardIndex;
        let nextPairCards: MatchingCard[] = [];
        
        // Get all displayed pairIds to avoid duplicates
        const displayedPairIds = new Set(cards.map((card) => card.pairId));
        
        // Find next pair in pool that hasn't been displayed yet
        if (newNextIndex < allCardsPool.length) {
          const remainingPool = allCardsPool.slice(newNextIndex);
          
          let foundPairId: string | null = null;
          for (const card of remainingPool) {
            if (!displayedPairIds.has(card.pairId)) {
              foundPairId = card.pairId;
              break;
            }
          }
          
          if (foundPairId) {
            const pairCards = allCardsPool
              .slice(newNextIndex)
              .filter((card) => card.pairId === foundPairId);
            
            if (pairCards.length === 2) {
              nextPairCards = pairCards;
              const lastCardIndex = allCardsPool.findIndex(
                (card, idx) => idx >= newNextIndex && card.pairId === foundPairId && card.type === "meaning"
              );
              if (lastCardIndex !== -1) {
                newNextIndex = lastCardIndex + 1;
              }
            }
          }
        }
        
        // Animate matched cards out (zoom in -> zoom out -> fade out)
        let animationCompleteCount = 0;
        const onAnimationComplete = () => {
          animationCompleteCount++;
          if (animationCompleteCount === 2) {
            // Both animations complete, now replace cards at the same positions
            const newCards = [...cards];
            
            // Replace cards at the same positions (firstIndex and secondIndex)
            if (nextPairCards.length === 2) {
              // Initialize animation refs for new cards
              nextPairCards.forEach((card) => {
                initCardAnimation(card.id, true);
              });
              
              // Replace at the same positions
              newCards[firstIndex] = nextPairCards[0];
              newCards[secondIndex] = nextPairCards[1];
              
              setNextCardIndex(newNextIndex);
            } else {
              // No more pairs, remove matched cards (set to null or remove)
              // But we want to keep positions, so we'll mark them as matched
              newCards[firstIndex] = { ...firstCard, isMatched: true };
              newCards[secondIndex] = { ...secondCard, isMatched: true };
            }
            
            setCards(newCards);
            
            // Animate new cards in after a short delay
            if (nextPairCards.length === 2) {
              setTimeout(() => {
                nextPairCards.forEach((card) => {
                  animateCardIn(card.id);
                });
              }, 50);
            }
            
            // Check if game is complete after updating cards
            setMatchedPairs((prev) => {
              const newCount = prev + 1;
              const totalPairsInPool = allCardsPool.length / 2;
              const remainingCardsInPool = allCardsPool.length - newNextIndex;
              const remainingDisplayedCards = newCards.filter((c) => !c.isMatched).length;
              
              // Game complete if: all pairs matched OR no more cards in pool and display
              if (newCount >= totalPairsInPool || (remainingCardsInPool === 0 && remainingDisplayedCards === 0)) {
                setTimeout(() => {
                  setIsGameComplete(true);
                  setIsTimeUp(false); // Mark as completed, not time up
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }, 500);
              }
              return newCount;
            });
          }
        };
        
        // Start animations for both matched cards
        animateCardMatchOut(firstCard.id, onAnimationComplete);
        animateCardMatchOut(secondCard.id, onAnimationComplete);
      } else {
        // No match
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setSelectedIndices([]);
      setIsChecking(false);
    }, 600);
  };

  // Calculate card size for grid - dynamically adjust based on screen and card count
  const { cardSize, cardHeight, cardSpacing } = useMemo(() => {
    const padding = 24;
    const spacing = 12;
    const headerHeight = 120; // Approximate header + stats height
    const instructionsHeight = 50;
    const bottomPadding = 100;
    
    const availableWidth = width - padding * 2;
    const availableHeight = height - headerHeight - instructionsHeight - bottomPadding;
    
    // Fixed 3 columns layout (3x4 = 12 cards max)
    const optimalColumns = 3;
    const cardCount = Math.min(cards.length, MAX_DISPLAYED_CARDS);
    const rows = Math.ceil(cardCount / optimalColumns);
    
    const cardWidth = (availableWidth - spacing * (optimalColumns - 1)) / optimalColumns;
    const cardH = Math.min(
      (availableHeight - spacing * (rows - 1)) / rows,
      160 // Max card height
    );
    
    const optimalCardSize = Math.max(80, Math.min(160, cardWidth));
    const optimalCardHeight = Math.max(90, Math.min(160, cardH));
    
    return {
      cardSize: optimalCardSize,
      cardHeight: optimalCardHeight,
      cardSpacing: spacing,
    };
  }, [cards.length]);
  
  const padding = 24;

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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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

        {/* Timer Progress Bar */}
        <View className="px-6 py-6">
          <View className="flex-row items-center justify-between mb-2">
            <ThemedText style={{ fontSize: 14, fontWeight: "600", color: "#1f2937" }}>
              {t("content_list.matching.time", "Time")}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: timeRemaining <= 60 ? "#ef4444" : "#1f2937",
              }}
            >
              {formatTime(timeRemaining)}
            </ThemedText>
          </View>
          <View
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              backgroundColor: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                width: `${(timeRemaining / 600) * 100}%`,
                borderRadius: 4,
                backgroundColor:
                  timeRemaining <= 60
                    ? "#ef4444"
                    : timeRemaining <= 180
                      ? "#f59e0b"
                      : "#10b981",
              }}
            />
          </View>
        </View>

        {/* Game Board */}
        <View
          className="flex-1"
          style={{
            padding: padding,
          }}
        >

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
              
              // Get or create animation refs
              if (!cardScaleRefs.current[card.id]) {
                cardScaleRefs.current[card.id] = new Animated.Value(1);
              }
              if (!cardOpacityRefs.current[card.id]) {
                cardOpacityRefs.current[card.id] = new Animated.Value(1);
              }
              if (!cardSelectionScaleRefs.current[card.id]) {
                cardSelectionScaleRefs.current[card.id] = new Animated.Value(1);
              }

              return (
                <MatchingCardComponent
                  key={card.id}
                  card={card}
                  index={index}
                  isSelected={isSelected}
                  cardSize={cardSize}
                  cardHeight={cardHeight}
                  contentType={contentType}
                  scaleRef={cardScaleRefs.current[card.id]}
                  opacityRef={cardOpacityRefs.current[card.id]}
                  selectionScaleRef={cardSelectionScaleRefs.current[card.id]}
                  onPress={() => handleCardPress(index)}
                  disabled={isChecking || card.isMatched}
                />
              );
            })}
          </View>
        </View>

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
                maxWidth: 400,}}
            >
              <LinearGradient
                colors={
                  isTimeUp
                    ? ["#ef4444", "#dc2626"]
                    : ["#fbbf24", "#f59e0b"]
                }
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {isTimeUp ? (
                  <ThemedText style={{ fontSize: 40 }}>⏰</ThemedText>
                ) : (
                  <Trophy size={40} color="#ffffff" />
                )}
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
                {isTimeUp
                  ? t("content_list.matching.time_up", "Time's Up!")
                  : t("content_list.matching.complete", "Congratulations!")}
              </ThemedText>

              <ThemedText
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                {isTimeUp
                  ? t("content_list.matching.time_up_message", {
                      matchedPairs,
                      total: contentData.length,
                      defaultValue: `You matched ${matchedPairs} out of ${contentData.length} pairs!`,
                    })
                  : t("content_list.matching.complete_message", "You matched all pairs!")}
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
