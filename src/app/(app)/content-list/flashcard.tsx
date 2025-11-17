import { ThemedText } from "@components/ThemedText";
import { FlashcardContentType } from "@constants/flashcard.enum";
import {
  useFlashcardDeckCards,
  useMarkFlashcardCardRead,
} from "@hooks/useFlashcard";
import { useLesson } from "@hooks/useLessons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Repeat, Settings2 } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { PanGestureHandler, TapGestureHandler } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

const normalizeVocabularyMeanings = (meanings?: any): string[] => {
  if (!meanings) return [];

  if (typeof meanings === "string") {
    return meanings
      .split(/[\n;,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (Array.isArray(meanings)) {
    return meanings
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.meaning || item.text || "";
        }
        return "";
      })
      .filter(Boolean);
  }

  return [];
};

const VocabularyFlashcardScreen = () => {
  const { id, deckId: deckIdParam, contentType, practiceSource } = useLocalSearchParams<{
    id?: string;
    deckId?: string;
    contentType?: string;
    practiceSource?: string;
  }>();

  const isDeckPractice = !!deckIdParam || practiceSource === "deck";
  const deckId = deckIdParam || undefined;
  const numericDeckId = deckId ? Number(deckId) : undefined;
  const lessonId = !isDeckPractice ? (id || "") : "";

  const {
    data: lessonData,
    isLoading: isLessonLoading,
  } = useLesson(lessonId);

  const {
    data: deckCardsData,
    isLoading: isDeckCardsLoading,
  } = useFlashcardDeckCards(
    isDeckPractice && deckId ? deckId : null,
    {
      currentPage: 1,
      pageSize: 9999,
      contentType: FlashcardContentType.VOCABULARY,
    }
  );
  
  const deckFromPractice = useMemo(() => {
    if (!isDeckPractice) return [];
    const cards = deckCardsData?.data?.results ?? [];

    return cards
      .map((card) => {
        const vocabulary =
          card.vocabulary || (card as any).metadata || undefined;
        if (!vocabulary) return null;
        return {
          ...vocabulary,
          __cardId: card.id,
          __deckId: card.deckId,
          __read: card.read ?? false,
        };
      })
      .filter(Boolean);
  }, [deckCardsData, isDeckPractice]);

  const contentTypeValue = (contentType as string) || "vocabulary";
  const isVocabulary = contentTypeValue === "vocabulary";
  const isGrammar = contentTypeValue === "grammar";
  const isKanji = contentTypeValue === "kanji";

  const deck = useMemo(() => {
    if (isDeckPractice) {
      return deckFromPractice;
    }

    const lesson: any = lessonData?.data || {};

    switch (contentTypeValue) {
      case "kanji":
        return lesson.kanji || [];
      case "grammar":
        return lesson.grama || lesson.grammar || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  }, [deckFromPractice, isDeckPractice, lessonData, contentTypeValue]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isFrontSide, setIsFrontSide] = useState(true);
  const [stackMode, setStackMode] = useState<"overlap" | "offset">("offset"); // "overlap" = chồng hoàn toàn, "offset" = hở một chút
  const [showOptions, setShowOptions] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const stackReveal = useRef(new Animated.Value(0)).current;

  const cardSpacing = useMemo(() => (stackMode === "offset" ? 8 : 0), [stackMode]);

  useFocusEffect(
    useCallback(() => {
      setStackMode("offset");
    }, [])
  );

  useEffect(() => {
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsFrontSide(true);
    flipAnim.setValue(0);
    stackReveal.setValue(0);
  }, [deck, flipAnim, stackReveal]);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const backScrollRef = useRef(null);
  const markCardReadMutation = useMarkFlashcardCardRead();

  useEffect(() => {
    translateX.setValue(0);
    translateY.setValue(0);
    cardOpacity.setValue(1);
    setIsFrontSide(true);
    flipAnim.setValue(0);
    stackReveal.setValue(0);
  }, [currentIndex, translateX, translateY, cardOpacity, flipAnim, stackReveal]);

  const rotate = translateX.interpolate({
    inputRange: [-250, 0, 250],
    outputRange: ["-18deg", "0deg", "18deg"],
  });

  // Gesture handlers (RNGH)
  const onPanGestureEvent = useRef(
    Animated.event(
      [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
      { useNativeDriver: true }
    )
  ).current;

  const handleSwipe = useCallback(
    (result: "known" | "unknown") => {
      const direction = result === "known" ? 1 : -1;

      stackReveal.setValue(0);

      const practiceCard = deck[currentIndex] as any;
      if (
        isDeckPractice &&
        numericDeckId &&
        practiceCard?.__cardId &&
        !markCardReadMutation.isPending
      ) {
        markCardReadMutation.mutate({
          deckId: numericDeckId,
          cardId: practiceCard.__cardId,
          read: result === "known",
        });
      }

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: direction * (width + 80),
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(stackReveal, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start(() => {
        translateX.setValue(0);
        translateY.setValue(0);
        cardOpacity.setValue(1);
        stackReveal.setValue(0);
        setIsFrontSide(true);

        Haptics.notificationAsync(
          result === "known"
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );

        if (result === "known") {
          setKnownCount((prev) => prev + 1);
        } else {
          setUnknownCount((prev) => prev + 1);
        }

        setCurrentIndex((prev) => prev + 1);
      });
    },
    [
      cardOpacity,
      currentIndex,
      deck,
      isDeckPractice,
      markCardReadMutation,
      numericDeckId,
      stackReveal,
      translateX,
      translateY,
    ]
  );

  const onPanEnded = useCallback((event: any) => {
    const dx = event?.nativeEvent?.translationX ?? 0;
    if (dx > SWIPE_THRESHOLD) {
      handleSwipe("known");
      return;
    }
    if (dx < -SWIPE_THRESHOLD) {
      handleSwipe("unknown");
      return;
    }
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 150,
      friction: 12,
    }).start();
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 150,
      friction: 12,
    }).start();
  }, [handleSwipe, translateX, translateY]);

  const resetDeck = () => {
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsFrontSide(true);
    flipAnim.setValue(0);
  };

  const toggleCardSide = () => {
    const nextSideIsBack = isFrontSide;
    const toValue = nextSideIsBack ? 1 : 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
    setIsFrontSide(!isFrontSide);
  };

  const totalCount = deck.length;
  const reviewedCount = Math.min(currentIndex, totalCount);

  const progress = totalCount === 0 ? 0 : (reviewedCount / totalCount) * 100;
  const progressLabel = useMemo(() => {
    if (isDeckPractice) {
      return `${reviewedCount}/${totalCount} thẻ trong bộ flashcard`;
    }

    const labelMap: Record<string, string> = {
      vocabulary: "thẻ từ vựng đã xem",
      grammar: "thẻ ngữ pháp đã xem",
      kanji: "thẻ Kanji đã xem",
    };

    return `${reviewedCount}/${totalCount} ${labelMap[contentTypeValue] || "thẻ đã xem"}`;
  }, [reviewedCount, totalCount, contentTypeValue, isDeckPractice]);

  const isDataLoading = isDeckPractice ? isDeckCardsLoading : isLessonLoading;

  const previewIndices = useMemo(() => {
    const remaining = totalCount - currentIndex - 1;
    const visibleCount = remaining > 0 ? Math.min(3, remaining) : 0;

    if (visibleCount === 0) {
      return [];
    }

    return Array.from({ length: visibleCount }, (_, i) => currentIndex + i + 1);
  }, [currentIndex, totalCount]);

  // Render một card trong stack
  const renderCard = (
    cardIndex: number,
    stackIndex: number,
    isActive: boolean
  ) => {
    const card: any = deck[cardIndex];
    if (!card) return null;

    const meanings = isVocabulary ? normalizeVocabularyMeanings(card?.meanings) : [];

    const kanjiExplanation = isKanji
      ? (typeof card?.explanationMeaning === "string" ? card.explanationMeaning : "")
      : "";

    const offset = stackIndex * cardSpacing;
    const scale = isActive ? 1 : Math.max(0.96, 1 - stackIndex * 0.03);
    const zIndex = totalCount - stackIndex;

    const isSecondCard = !isActive && stackIndex === 1;

    const translateXValue = isSecondCard
      ? stackReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, 0],
        })
      : offset;

    const translateYValue = isSecondCard
      ? stackReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, 0],
        })
      : offset;

    const scaleValue = isSecondCard
      ? stackReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [scale, 1],
        })
      : scale;

    const opacityValue = isActive
      ? 1
      : isSecondCard
      ? stackReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        })
      : 0.85;

    const cardShadowStyle = isActive
      ? {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 18,
          elevation: 10,
        }
      : {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 2,
        };

    const cardBaseStyle = {
      paddingTop: 64,
      paddingBottom: 64,
      paddingHorizontal: 28,
      minHeight: 540,
      borderRadius: 28,
    };

    const backgroundColorValue = isActive
      ? "#ffffff"
      : isSecondCard
      ? stackReveal.interpolate({
          inputRange: [0, 1],
          outputRange: ["#f1f5f9", "#ffffff"],
        })
      : "#f1f5f9";

    const frontCardStyle = isActive
      ? {
          transform: [
            {
              rotateY: flipAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              }),
            },
          ],
          backfaceVisibility: "hidden" as const,
        }
      : {};

    const backCardStyle = {
      transform: [
        {
          rotateY: flipAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["180deg", "360deg"],
          }),
        },
      ],
      backfaceVisibility: "hidden" as const,
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    const cardIsFrontSide = isActive ? isFrontSide : true;
    const cardPositionLabel = totalCount > 0 ? `${Math.min(cardIndex + 1, totalCount)}/${totalCount}` : "0/0";

    return (
      <Animated.View
        key={`card-${cardIndex}`}
        style={{
          position: "absolute",
          width: "100%",
          opacity: opacityValue,
          transform: [
            { scale: scaleValue },
            { translateX: translateXValue },
            { translateY: translateYValue },
          ],
          zIndex,
        }}
        pointerEvents={isActive ? "auto" : "none"}
      >
        <TapGestureHandler
          enabled={isActive}
          onActivated={toggleCardSide}
          waitFor={isActive && !cardIsFrontSide ? backScrollRef as any : undefined}
        >
          <View style={{ position: "relative", width: "100%" }}>
            {/* Front Card */}
            <Animated.View
              style={[cardBaseStyle, cardShadowStyle, { backgroundColor: backgroundColorValue }, frontCardStyle]}
              pointerEvents={cardIsFrontSide ? "auto" : "none"}
            >
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 4, paddingBottom: 4 }}>
                {isKanji ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <ThemedText style={{ fontSize: 52, fontWeight: "bold", color: "#b45309", textAlign: "center", lineHeight: 62 }}>
                      {card?.character || ""}
                    </ThemedText>
                  </View>
                ) : isGrammar ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <ThemedText style={{ fontSize: 30, fontWeight: "bold", color: "#0e7490", textAlign: "center", lineHeight: 38 }}>
                      {card?.title || ""}
                    </ThemedText>
                    {card?.structure && (
                      <ThemedText style={{ fontSize: 17, color: "#06b6d4", marginTop: 10, textAlign: "center" }}>
                        {card.structure}
                      </ThemedText>
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <ThemedText style={{ fontSize: 44, fontWeight: "bold", color: "#0369a1", textAlign: "center", lineHeight: 52 }}>
                      {card?.wordJp || ""}
                    </ThemedText>
                    {(card?.reading || card?.kana) && (
                      <ThemedText style={{ fontSize: 20, color: "#0ea5e9", marginTop: 12, textAlign: "center" }}>
                        {card?.reading || card?.kana}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 0,
                  right: 0,
                  paddingHorizontal: 28,
                  alignItems: "center",
                }}
              >
                <ThemedText style={{ fontSize: 16, color: "#94a3b8", textAlign: "center", width: "100%" }}>
                  {cardPositionLabel}
                </ThemedText>
              </View>
            </Animated.View>

            {/* Back Card - chỉ hiển thị cho card active */}
            {isActive && (
              <Animated.View
                style={[cardBaseStyle, cardShadowStyle, { backgroundColor: backgroundColorValue }, backCardStyle]}
                pointerEvents={cardIsFrontSide ? "none" : "auto"}
              >
                <ScrollView
                  ref={backScrollRef as any}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                  scrollEventThrottle={16}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onStartShouldSetResponderCapture={() => true}
                  onMoveShouldSetResponderCapture={() => true}
                  contentContainerStyle={{
                    paddingVertical: 24,
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 20,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {isKanji ? (
                    <View className="w-full items-center">
                      {card?.meaning ? (
                        <View
                          className="py-5 px-6 mb-5 rounded-2xl bg-amber-50 border border-amber-100"
                          style={{ width: width - 160 }}
                        >
                          <ThemedText style={{ fontSize: 36, fontWeight: "600", color: "#92400e", textAlign: "center", lineHeight: 48 }}>
                            {card.meaning}
                          </ThemedText>
                        </View>
                      ) : null}
                      {kanjiExplanation ? (
                        <View
                          className="py-5 px-6 rounded-2xl bg-amber-50 border border-amber-100"
                          style={{ width: width - 160 }}
                        >
                          <ThemedText style={{ fontSize: 28, color: "#b45309", textAlign: "center", lineHeight: 42 }}>
                            {kanjiExplanation}
                          </ThemedText>
                        </View>
                      ) : (
                        <ThemedText style={{ fontSize: 24, color: "#d97706", textAlign: "center", width: width - 160, lineHeight: 36 }}>
                          Không có phần giải thích
                        </ThemedText>
                      )}
                      {(card?.onReading || card?.kunReading) && (
                        <View className="mt-4" style={{ width: width - 160 }}>
                          <ThemedText style={{ fontSize: 20, color: "#d97706", textAlign: "center", lineHeight: 28 }}>
                            Âm On: {card?.onReading || "-"}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 20, color: "#d97706", textAlign: "center", marginTop: 8, lineHeight: 28 }}>
                            Âm Kun: {card?.kunReading || "-"}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  ) : isGrammar ? (
                    <View className="w-full">
                      {card?.description && (
                        <View
                          className="py-5 px-6 rounded-2xl bg-cyan-50 border border-cyan-100 mb-5"
                          style={{ width: width - 160, alignSelf: "center" }}
                        >
                          <ThemedText style={{ fontSize: 32, fontWeight: "600", color: "#155e75", textAlign: "center", lineHeight: 46 }}>
                            {card.description}
                          </ThemedText>
                        </View>
                      )}
                      {card?.usage && (
                        <View
                          className="py-5 px-6 rounded-2xl bg-white border border-cyan-100"
                          style={{ width: width - 160, alignSelf: "center" }}
                        >
                          <ThemedText style={{ fontSize: 26, color: "#0e7490", textAlign: "center", lineHeight: 38 }}>
                            <ThemedText style={{ fontWeight: "bold" }}>Cách dùng:</ThemedText> {card.usage}
                          </ThemedText>
                        </View>
                      )}
                      {!card?.description && !card?.usage && (
                        <ThemedText style={{ fontSize: 26, color: "#0891b2", textAlign: "center", width: width - 160, lineHeight: 38 }}>
                          Chưa có mô tả chi tiết
                        </ThemedText>
                      )}
                    </View>
                  ) : meanings.length > 0 ? (
                    meanings.map((meaning: string, idx: number) => (
                      <View
                        key={idx}
                        className="py-5 px-6 mb-4 rounded-2xl bg-sky-50 border border-sky-100"
                        style={{ width: width - 160 }}
                      >
                        <ThemedText style={{ fontSize: 36, fontWeight: "600", color: "#0369a1", textAlign: "center", lineHeight: 48 }}>
                          {meaning}
                        </ThemedText>
                      </View>
                    ))
                  ) : (
                    <ThemedText style={{ fontSize: 32, color: "#0369a1", textAlign: "center", width: width - 160, lineHeight: 46 }}>
                      Không có nghĩa
                    </ThemedText>
                  )}
                </ScrollView>
                <View
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 28,
                    alignItems: "center",
                  }}
                >
                  <ThemedText style={{ fontSize: 16, color: "#94a3b8", textAlign: "center", width: "100%" }}>
                    {cardPositionLabel}
                  </ThemedText>
                </View>
              </Animated.View>
            )}
          </View>
        </TapGestureHandler>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#9DE0FF", "#B8F5FF", "#E3FDFD"]}
        style={{ flex: 1 }}
      >
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <ThemedText style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>
            Học với Flashcard
          </ThemedText>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setShowOptions(true)}
              className="p-2 rounded-full bg-white/50"
            >
              <Settings2 size={20} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetDeck} className="p-2">
              <Repeat size={22} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          <ThemedText style={{ fontSize: 14, color: "#4b5563", marginBottom: 4, textAlign: "center" }}>
            {progressLabel}
          </ThemedText>
          <View className="w-full h-2 rounded-full bg-white/50 overflow-hidden">
            <View
              style={{ width: `${progress}%` }}
              className="h-full bg-sky-400"
            />
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          {isDataLoading ? (
            <View className="bg-white/80 rounded-3xl p-8 items-center">
              <ActivityIndicator color="#0ea5e9" />
            </View>
          ) : totalCount === 0 ? (
            <View className="bg-white/70 rounded-3xl p-8 items-center">
              <ThemedText style={{ fontSize: 18, color: "#4b5563", textAlign: "center" }}>
                Không có dữ liệu để hiển thị
              </ThemedText>
            </View>
          ) : reviewedCount >= totalCount ? (
            <View className="bg-white/80 rounded-3xl p-8 items-center">
              <ThemedText style={{ fontSize: 24, fontWeight: "bold", color: "#0284c7", textAlign: "center", marginBottom: 8 }}>
                Hoàn thành!
              </ThemedText>
              <ThemedText style={{ fontSize: 16, color: "#4b5563", textAlign: "center" }}>
                Bạn có thể xem lại bằng cách nhấn biểu tượng làm mới.
              </ThemedText>
            </View>
          ) : (
            <View
              style={{
                width: width - 80,
                height: 580,
                position: "relative",
              }}
            >
              {/* Stack các card phía sau */}
              {previewIndices.map((cardIndex, arrayIndex) =>
                renderCard(cardIndex, arrayIndex + 1, false)
              )}

              {/* Card hiện tại (có thể tương tác) */}
              <PanGestureHandler
                enabled={reviewedCount < totalCount}
                activeOffsetX={[-12, 12]}
                failOffsetY={[-10, 10]}
                onGestureEvent={onPanGestureEvent}
                onEnded={onPanEnded}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    width: "100%",
                    transform: [
                      { perspective: 1000 },
                      { translateX },
                      { translateY },
                      { rotate },
                    ],
                    opacity: cardOpacity,
                    zIndex: totalCount + 10,
                  }}
                >
                  {renderCard(currentIndex, 0, true)}
                </Animated.View>
              </PanGestureHandler>
            </View>
          )}
        </View>

        <View className="px-8 pb-10">
          <View className="flex-row justify-between">
            <View className="flex-1 mr-3 rounded-3xl bg-rose-500/90 py-4 items-center shadow-lg">
              <ThemedText style={{ color: "#ffffff", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Chưa thuộc
              </ThemedText>
              <ThemedText style={{ fontSize: 24, color: "#ffffff", fontWeight: "bold", marginTop: 4 }}>
                {unknownCount}
              </ThemedText>
            </View>
            <View className="flex-1 ml-3 rounded-3xl bg-sky-500/90 py-4 items-center shadow-lg">
              <ThemedText style={{ color: "#ffffff", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Đã thuộc
              </ThemedText>
              <ThemedText style={{ fontSize: 24, color: "#ffffff", fontWeight: "bold", marginTop: 4 }}>
                {knownCount}
              </ThemedText>
            </View>
          </View>
        </View>

        <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
          <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
            <View className="flex-1 bg-black/40 justify-center items-center px-6">
              <TouchableWithoutFeedback>
                <View className="w-full max-w-md rounded-3xl bg-white p-6">
                  <ThemedText style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 16, textAlign: "center" }}>
                    Tùy chỉnh hiển thị thẻ
                  </ThemedText>
                  <View className="space-y-4">
                    <TouchableOpacity
                      className={`p-4 rounded-2xl border ${stackMode === "offset" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}
                      onPress={() => {
                        setStackMode("offset");
                        setShowOptions(false);
                      }}
                    >
                      <ThemedText style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}>
                        Hiển thị hở
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                        Các thẻ phía sau lệch nhẹ để thấy còn bao nhiêu thẻ.
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`p-4 rounded-2xl border ${stackMode === "overlap" ? "border-sky-400 bg-sky-50" : "border-gray-200"}`}
                      onPress={() => {
                        setStackMode("overlap");
                        setShowOptions(false);
                      }}
                    >
                      <ThemedText style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}>
                        Chồng lên nhau
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                        Các thẻ phía sau trùng nhau để tập trung vào thẻ hiện tại.
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="mt-6 py-3 rounded-2xl bg-gray-100"
                    onPress={() => setShowOptions(false)}
                  >
                    <ThemedText style={{ textAlign: "center", color: "#374151", fontWeight: "500" }}>
                      Đóng
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default VocabularyFlashcardScreen;
