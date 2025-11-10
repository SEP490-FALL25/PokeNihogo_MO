import KanjiWriter from "@components/KanjiWriter";
import { ThemedText } from "@components/ThemedText";
import { useLesson } from "@hooks/useLessons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Headphones,
  Pencil,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Helper: Play audio from URL
const playAudio = async (url: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.warn("Audio playback error", e);
  }
};

// --- Modern Card Component (for expandable vocabulary) ---
const ModernCardExpandable = ({ children, style }: any) => (
  <Animated.View
    className="bg-white rounded-3xl p-6 shadow-xl mb-4"
    style={[
      {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
      },
      style,
    ]}
  >
    {children}
  </Animated.View>
);

// --- Modern Card Component (for list vocabulary) ---
const ModernCard = ({ children, style }: any) => (
  <Animated.View
    className="bg-white rounded-2xl p-4 shadow-lg mb-3"
    style={[
      {
        borderWidth: 2,
        borderColor: "#FCD34D",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
      },
      style,
    ]}
  >
    {children}
  </Animated.View>
);

// --- Expandable Vocabulary Card (Flip Card) ---
const ExpandableVocabularyCard = ({
  item,
  index,
}: {
  item: any;
  index: number;
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const meanings = (item.meanings || [])
    .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
    .filter(Boolean);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    
    Animated.spring(flipAnim, {
      toValue,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <View style={{ marginHorizontal: 4 }}>
      <View style={{ position: "relative", width: "100%", minHeight: 160 }}>
        {/* Front Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            frontAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "none" : "auto"}
        >
          <ModernCardExpandable style={{ padding: 16 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View style={{ minHeight: 120 }}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <ThemedText className="text-3xl font-bold text-indigo-600">
                      {item.wordJp}
                    </ThemedText>
                    <ThemedText className="text-lg text-indigo-400 mt-1 font-medium">
                      {item.reading}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (item.audioUrl) {
                        playAudio(item.audioUrl);
                      }
                    }}
                    className="bg-indigo-100 p-3 rounded-2xl"
                  >
                    <Headphones size={22} color="#4f46e5" />
                  </TouchableOpacity>
                </View>
                <View className="mt-3 items-center">
                  <ThemedText className="text-xs text-gray-400">
                    {t("lessons.press_to_see_meaning") || "Nhấn để xem nghĩa"}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>

        {/* Back Side */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
            },
            backAnimatedStyle,
          ]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <ModernCardExpandable style={{ padding: 16 }}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <View style={{ minHeight: 120 }} className="justify-center">
                <View className="w-full space-y-2">
                  {meanings.length > 0 ? (
                    meanings.map((m: string, i: number) => (
                      <View key={i} className="flex-row items-start">
                        <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3 mt-2" />
                        <ThemedText className="text-base text-gray-800 flex-1 font-medium">
                          {m}
                        </ThemedText>
                      </View>
                    ))
                  ) : (
                    <ThemedText className="text-base text-gray-500 text-center">
                      {t("lessons.no_meaning") || "Không có nghĩa"}
                    </ThemedText>
                  )}
                </View>
                <View className="mt-3 items-center">
                  <ThemedText className="text-xs text-gray-400">
                    {t("lessons.hide_meaning") || "Nhấn để ẩn nghĩa"}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </ModernCardExpandable>
        </Animated.View>
      </View>
    </View>
  );
};

// --- Expandable Grammar Card ---
const ExpandableGrammarCard = ({
  item,
  index,
}: {
  item: any;
  index: number;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [expanded, heightAnim]);

  const height = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <ModernCardExpandable style={{ marginHorizontal: 4 }}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row justify-between items-center"
      >
        <ThemedText className="text-lg font-bold text-cyan-700 flex-1 pr-4">
          {item.title}
        </ThemedText>
        <Animated.View
          style={{
            transform: [{ rotate: expanded ? "180deg" : "0deg" }],
          }}
        >
          <ChevronLeft
            size={20}
            color="#0891b2"
            style={{ transform: [{ rotate: "270deg" }] }}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, overflow: "hidden" }}>
        <View className="mt-4 space-y-3">
          <ThemedText className="text-gray-600 leading-6">
            {item.description}
          </ThemedText>
          {item.usage && (
            <View className="bg-cyan-50 p-4 rounded-2xl">
              <ThemedText className="text-sm text-cyan-800">
                <ThemedText style={{ fontWeight: "bold" }}>
                  {t("lessons.usage")}:
                </ThemedText>{" "}
                {item.usage}
              </ThemedText>
            </View>
          )}
        </View>
      </Animated.View>
    </ModernCardExpandable>
  );
};

// --- Expandable Kanji Card ---
const ExpandableKanjiCard = ({
  item,
  index,
  onWrite,
}: {
  item: any;
  index: number;
  onWrite?: (char: string) => void;
}) => {
  const { t } = useTranslation();
  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  const handleWrite = () => {
    if (onWrite) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onWrite(item.character);
    }
  };

  return (
    <ModernCardExpandable style={{ marginHorizontal: 4 }}>
      <View className="flex-row items-center">
        <View className="bg-amber-100 rounded-3xl p-6 mr-4">
          <ThemedText className="text-6xl font-bold text-amber-700">
            {item.character}
          </ThemedText>
        </View>
        <View className="flex-1">
          <ThemedText className="text-lg font-bold text-amber-800">
            {meaning}
          </ThemedText>
          {(item.onReading || item.kunReading) && (
            <ThemedText className="text-sm text-amber-600 mt-1">
              {item.onReading} • {item.kunReading}
            </ThemedText>
          )}
          <View className="flex-row items-center mt-2">
            <Sparkles size={14} color="#f59e0b" />
            <ThemedText className="text-xs text-amber-600 ml-1">
              {item.strokeCount} {t("lessons.stroke")}
            </ThemedText>
          </View>
        </View>
        {onWrite && (
          <TouchableOpacity
            onPress={handleWrite}
            className="bg-amber-500 p-4 rounded-2xl shadow-md"
            activeOpacity={0.8}
          >
            <Pencil size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </ModernCardExpandable>
  );
};

// --- Vocabulary Card (Simple display with audio) ---
const VocabularyCard = ({ item, index }: { item: any; index: number }) => {
  const meanings = (item.meanings || [])
    .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
    .filter(Boolean);

  const handleAudio = () => {
    if (item.audioUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playAudio(item.audioUrl);
    }
  };

  return (
    <ModernCard>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <ThemedText className="text-2xl font-bold text-gray-900 mb-1">
            {item.wordJp}
          </ThemedText>
          {item.reading && (
            <ThemedText className="text-base text-gray-600 mb-2">
              {item.reading}
            </ThemedText>
          )}
          {meanings.length > 0 && (
            <ThemedText className="text-base text-gray-700">
              {meanings[0]}
            </ThemedText>
          )}
        </View>
        {item.audioUrl && (
          <TouchableOpacity
            onPress={handleAudio}
            className="bg-purple-100 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <View className="items-center justify-center">
              <ThemedText className="text-xs text-purple-700 font-bold mb-0.5">
                Riki
              </ThemedText>
              <ThemedText className="text-xs text-purple-700 font-bold mb-0.5">
                AI
              </ThemedText>
              <Headphones size={12} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ModernCard>
  );
};

// --- Grammar Card (Simple display for vertical list) ---
const GrammarListCard = ({ item, index }: { item: any; index: number }) => {
  const { t } = useTranslation();

  return (
    <ModernCard>
      <View className="flex-1">
        <ThemedText className="text-xl font-bold text-cyan-700 mb-2">
          {item.title}
        </ThemedText>
        {item.description && (
          <ThemedText className="text-base text-gray-700 mb-2">
            {item.description}
          </ThemedText>
        )}
        {item.usage && (
          <View className="bg-cyan-50 p-3 rounded-xl mt-2">
            <ThemedText className="text-sm text-cyan-800">
              <ThemedText style={{ fontWeight: "bold" }}>
                {t("lessons.usage")}:
              </ThemedText>{" "}
              {item.usage}
            </ThemedText>
          </View>
        )}
      </View>
    </ModernCard>
  );
};

// --- Kanji Card (Simple display for vertical list) ---
const KanjiListCard = ({
  item,
  index,
  onWrite,
}: {
  item: any;
  index: number;
  onWrite?: (char: string) => void;
}) => {
  const { t } = useTranslation();

  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  const handleWrite = () => {
    if (onWrite) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onWrite(item.character);
    }
  };

  return (
    <ModernCard>
      <View className="flex-row items-center">
        <View className="bg-amber-100 rounded-2xl p-4 mr-3">
          <ThemedText className="text-5xl font-bold text-amber-700">
            {item.character}
          </ThemedText>
        </View>
        <View className="flex-1">
          <ThemedText className="text-lg font-bold text-amber-800 mb-1">
            {meaning}
          </ThemedText>
          {(item.onReading || item.kunReading) && (
            <ThemedText className="text-sm text-amber-600 mb-1">
              {item.onReading} • {item.kunReading}
            </ThemedText>
          )}
          {item.strokeCount && (
            <View className="flex-row items-center mt-1">
              <Sparkles size={14} color="#f59e0b" />
              <ThemedText className="text-xs text-amber-600 ml-1">
                {item.strokeCount} {t("lessons.stroke")}
              </ThemedText>
            </View>
          )}
        </View>
        {onWrite && (
          <TouchableOpacity
            onPress={handleWrite}
            className="bg-amber-500 p-3 rounded-xl shadow-md ml-2"
            activeOpacity={0.8}
          >
            <Pencil size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </ModernCard>
  );
};

// --- Main Screen ---
const VocabularyListScreen = () => {
  const { t } = useTranslation();
  const { id, activityType, contentType } = useLocalSearchParams<{
    id?: string;
    activityType?: string;
    contentType?: string;
  }>();
  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  // State for Kanji Writer Modal
  const [showKanjiWriterModal, setShowKanjiWriterModal] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<string>("");

  // Determine content type: vocabulary (default), grammar, or kanji
  const contentTypeValue = contentType || "vocabulary";

  // Get data based on content type
  const getContentData = () => {
    switch (contentTypeValue) {
      case "grammar":
        return lesson.grama || lesson.grammar || [];
      case "kanji":
        return lesson.kanji || [];
      default:
        return lesson.voca || lesson.vocabulary || [];
    }
  };

  const contentData: any[] = getContentData();

  // Get activity type title
  const getActivityTitle = () => {
    const baseTitle =
      contentTypeValue === "grammar"
        ? "Ngữ pháp"
        : contentTypeValue === "kanji"
        ? "Kanji"
        : "Từ vựng";

    switch (activityType) {
      case "learn":
        return contentTypeValue === "grammar"
          ? "Học ngữ pháp"
          : contentTypeValue === "kanji"
          ? "Học Kanji"
          : "Học từ mới";
      case "match":
        return "Trò chơi ghép thẻ";
      case "test":
        return contentTypeValue === "grammar"
          ? "Kiểm tra ngữ pháp"
          : contentTypeValue === "kanji"
          ? "Kiểm tra Kanji"
          : "Kiểm tra từ mới";
      case "reflex":
        return "Luyện phản xạ";
      default:
        return `${baseTitle} trong bài`;
    }
  };

  // Get banner text
  const getBannerText = () => {
    switch (contentTypeValue) {
      case "grammar":
        return "Ngữ pháp trong bài";
      case "kanji":
        return "Kanji trong bài";
      default:
        return "Từ vựng trong bài";
    }
  };

  // Get empty message
  const getEmptyMessage = () => {
    switch (contentTypeValue) {
      case "grammar":
        return t("lessons.no_grammar") || "Không có ngữ pháp nào";
      case "kanji":
        return t("lessons.no_kanji") || "Không có Kanji nào";
      default:
        return t("lessons.no_vocabulary") || "Không có từ vựng nào";
    }
  };

  // Handle Kanji writing
  const handleWriteKanji = (character: string) => {
    setSelectedKanji(character);
    setShowKanjiWriterModal(true);
  };

  const handleCloseKanjiWriter = () => {
    setShowKanjiWriterModal(false);
    setSelectedKanji("");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-6">
          <View className="h-8 bg-gray-200 rounded-3xl mb-6 w-3/4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Sticky Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-b-3xl items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText className="text-xl font-bold text-gray-800">
              {getActivityTitle()}
            </ThemedText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 pb-32">
            {/* === EXPANDABLE CONTENT CARDS (Horizontal Scroll) === */}
            <View className="mb-8">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row rounded-3xl"
              >
                {contentData.map((item: any, i: number) => (
                  <View key={i} style={{ width: width - 80 }}>
                    {contentTypeValue === "grammar" ? (
                      <ExpandableGrammarCard item={item} index={i} />
                    ) : contentTypeValue === "kanji" ? (
                      <ExpandableKanjiCard
                        item={item}
                        index={i}
                        onWrite={handleWriteKanji}
                      />
                    ) : (
                      <ExpandableVocabularyCard item={item} index={i} />
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* === ACTIVITY BLOCKS === */}
            <View className="mb-6">
              <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
                {/* Học từ mới - Top Left */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    // Navigate to same screen with different activity type
                    router.setParams({ activityType: "learn" });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#E0F2FE",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#BAE6FD",
                      }}
                    >
                      <ThemedText className="text-4xl">🏴‍☠️</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-center text-base font-bold text-blue-800">
                    Học từ mới
                  </ThemedText>
                </TouchableOpacity>

                {/* Trò chơi ghép thẻ - Top Right */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.setParams({ activityType: "match" });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#D1FAE5",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#A7F3D0",
                      }}
                    >
                      <ThemedText className="text-4xl">🧳</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-center text-base font-bold text-green-800">
                    Trò chơi ghép thẻ
                  </ThemedText>
                </TouchableOpacity>

                {/* Kiểm tra từ mới - Bottom Left */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.setParams({ activityType: "test" });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#FEF3C7",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#FDE68A",
                      }}
                    >
                      <ThemedText className="text-4xl">🥷</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-center text-base font-bold text-amber-800">
                    Kiểm tra từ mới
                  </ThemedText>
                </TouchableOpacity>

                {/* Luyện phản xạ - Bottom Right */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.setParams({ activityType: "reflex" });
                  }}
                  className="rounded-3xl p-6 shadow-lg"
                  style={{
                    width: (width - 48 - 12) / 2,
                    backgroundColor: "#FCE7F3",
                  }}
                >
                  <View className="items-center mb-3">
                    <View
                      className="rounded-full items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#FBCFE8",
                      }}
                    >
                      <ThemedText className="text-4xl">⚡</ThemedText>
                    </View>
                  </View>
                  <ThemedText className="text-center text-base font-bold text-pink-800">
                    Luyện phản xạ
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* === BANNER === */}
            <View className="mb-6">
              <View
                className="rounded-2xl py-4 px-6 items-center"
                style={{
                  backgroundColor: "#FCD34D",
                }}
              >
                <ThemedText className="text-lg font-bold text-white">
                  {getBannerText()}
                </ThemedText>
              </View>
            </View>

            {/* === CONTENT LIST === */}
            {contentData.length === 0 ? (
              <View className="items-center justify-center py-20">
                <ThemedText className="text-gray-500 text-lg">
                  {getEmptyMessage()}
                </ThemedText>
              </View>
            ) : (
              contentData.map((item: any, i: number) => {
                if (contentTypeValue === "vocabulary") {
                  return <VocabularyCard key={i} item={item} index={i} />;
                } else if (contentTypeValue === "grammar") {
                  return <GrammarListCard key={i} item={item} index={i} />;
                } else if (contentTypeValue === "kanji") {
                  return (
                    <KanjiListCard
                      key={i}
                      item={item}
                      index={i}
                      onWrite={handleWriteKanji}
                    />
                  );
                }
                return null;
              })
            )}
          </View>
        </ScrollView>

        {/* Kanji Writer Modal */}
        <Modal
          visible={showKanjiWriterModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseKanjiWriter}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                <ThemedText className="text-xl font-bold text-gray-800">
                  {t("lessons.practice_writing") || "Luyện viết Kanji"}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleCloseKanjiWriter}
                  className="p-2 rounded-full bg-gray-100"
                  activeOpacity={0.7}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Kanji Writer Content */}
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {selectedKanji && (
                  <KanjiWriter
                    character={selectedKanji}
                    mode="practice"
                    onComplete={(totalMistakes) => {
                      console.log(
                        `Completed writing ${selectedKanji} with ${totalMistakes} mistakes`
                      );
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                    }}
                    onCorrectStroke={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      );
                    }}
                    onMistake={() => {
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                      );
                    }}
                  />
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default VocabularyListScreen;

