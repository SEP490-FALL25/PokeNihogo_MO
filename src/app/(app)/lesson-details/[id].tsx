import KanjiWriter from "@components/KanjiWriter";
import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { useLesson } from "@hooks/useLessons";
import { useUserExerciseAttempt } from "@hooks/useUserExerciseAttempt";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
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
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- Modern Card Component ---
const ModernCard = ({ children, style }: any) => (
  <Animated.View
    className="bg-white rounded-3xl p-6 shadow-xl"
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

// --- Floating Progress Ring (removed unused) ---

// Helper: Play audio from URL
const playAudio = async (url: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );
    // Optionally unload sound when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    // Optionally you can alert or log error
    console.warn("Audio playback error", e);
  }
};

function getButtonColor(status?: string) {
  if (status === "COMPLETED") return "bg-emerald-600";
  if (status === "IN_PROGRESS") return "bg-amber-500";
  if (status === "ABANDONED") return "bg-rose-500";
  if (status === "FAIL") return "bg-red-600";
  return "bg-slate-200";
}
function getTextColor(status?: string) {
  if (status === "COMPLETED") return "text-white";
  if (status === "IN_PROGRESS") return "text-white";
  if (status === "ABANDONED") return "text-white";
  if (status === "FAIL") return "text-white";
  return "text-slate-700";
}

// --- Vocabulary Card (Swipeable + Audio + Meaning Toggle) ---
const VocabularyCard = ({ item, index }: { item: any; index: number }) => {
  const { t } = useTranslation();
  const [showMeaning, setShowMeaning] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const meanings = (item.meanings || [])
    .map((m: any) => (typeof m === "string" ? m : m.meaning || m.text || ""))
    .filter(Boolean);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
      setShowMeaning(!showMeaning);
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <ModernCard style={{ marginHorizontal: 4 }}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <ThemedText className="text-3xl font-bold text-indigo-600">
                {item.wordJp}
              </ThemedText>
              <ThemedText className="text-lg text-indigo-400 mt-1 font-medium">
                {item.reading}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => item.audioUrl && playAudio(item.audioUrl)}
              className="bg-indigo-100 p-3 rounded-2xl"
            >
              <Headphones size={22} color="#4f46e5" />
            </TouchableOpacity>
          </View>

          {showMeaning && (
            <Animated.View className="mt-3 space-y-1">
              {meanings.map((m: string, i: number) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                  <ThemedText className="text-gray-700 flex-1">{m}</ThemedText>
                </View>
              ))}
            </Animated.View>
          )}

          <View className="mt-4 items-center">
            <ThemedText className="text-xs text-gray-400">
              {showMeaning
                ? t("lessons.hide_meaning")
                : t("lessons.press_to_see_meaning")}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ModernCard>
    </Animated.View>
  );
};

// --- Grammar Card (Collapsible + Example Highlight) ---
const GrammarCard = ({ item }: { item: any }) => {
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
    <ModernCard>
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
    </ModernCard>
  );
};

// --- Kanji Card (Big Char + Stroke Count + Write Button) ---
const KanjiCard = ({
  item,
  onWrite,
}: {
  item: any;
  onWrite: (c: string) => void;
}) => {
  const { t } = useTranslation();
  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  return (
    <ModernCard>
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
        <TouchableOpacity
          onPress={() => onWrite(item.character)}
          className="bg-amber-500 p-4 rounded-2xl shadow-md"
        >
          <Pencil size={22} color="white" />
        </TouchableOpacity>
      </View>
    </ModernCard>
  );
};

// --- Main Screen ---
const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  // fetch latest user exercise attempt for this lesson
  const { data: latestExerciseAttempt } = useUserExerciseAttempt(id || "");

  type ExerciseCategory = "vocabulary" | "grammar" | "kanji";

  // Map attempt IDs by category
  const attemptIdByCategory = React.useMemo(() => {
    const list: any[] = latestExerciseAttempt?.data || [];
    const map: Record<string, number | string | undefined> = {};
    for (const item of list) {
      const type = (item.exerciseType || "").toString().toLowerCase();
      if (type === "vocabulary") map.vocabulary = item.id;
      if (type === "grammar") map.grammar = item.id;
      if (type === "kanji") map.kanji = item.id;
    }
    return map;
  }, [latestExerciseAttempt]);

  // Map status by category from latestExerciseAttempt
  const statusByCategory = React.useMemo(() => {
    const list: any[] = latestExerciseAttempt?.data || [];
    const map: Record<string, string | undefined> = {};
    for (const item of list) {
      const type = (item.exerciseType || "").toString().toLowerCase();
      if (type === "vocabulary") map.vocabulary = item.status;
      if (type === "grammar") map.grammar = item.status;
      if (type === "kanji") map.kanji = item.status;
    }
    return map;
  }, [latestExerciseAttempt]);

  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Try multiple property names in case of mock/real difference, fallback to []
  const voca: any[] = lesson.voca || lesson.vocabulary || [];
  const grammar: any[] = lesson.grama || lesson.grammar || [];
  const kanji: any[] = lesson.kanji || [];

  const openWriter = (char: string) => {
    setSelectedKanji(char);
    setModalVisible(true);
    Haptics.selectionAsync();
  };

  const startExercise = async (category: ExerciseCategory) => {
    try {
      const status = statusByCategory[category];
      const exerciseAttemptId = attemptIdByCategory[category];
      
      if (!exerciseAttemptId) {
        Alert.alert(
          t("common.error") || "Error",
          t("common.something_wrong") || "Có lỗi xảy ra, vui lòng thử lại."
        );
        return;
      }

      const proceed = () => {
        Haptics.selectionAsync();
        router.push({
          pathname: "/(app)/quiz/[sessionId]",
          params: { 
            sessionId: exerciseAttemptId.toString(),
            exerciseAttemptId: exerciseAttemptId.toString(),
          },
        });
      };

      if (status === "COMPLETED") {
        Alert.alert(
          t("common.confirm") || "Confirm",
          t("lessons.retake_warning") ||
            "Bạn đã hoàn thành bài này. Lần làm lại chỉ nhận 90% phần thưởng. Tiếp tục?",
          [
            { text: t("common.cancel") || "Hủy", style: "cancel" },
            { text: t("common.continue") || "Tiếp tục", onPress: proceed },
          ]
        );
      } else {
        proceed();
      }
    } catch (e) {
      console.warn("Failed to start exercise", e);
      Alert.alert(
        t("common.error") || "Error",
        t("common.something_wrong") || "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  };

  if (isLoading) {
    return (
      <HomeLayout>
        <View className="p-6">
          <View className="h-8 bg-gray-200 rounded-3xl mb-6 w-3/4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl mb-4" />
          <View className="h-32 bg-gray-100 rounded-3xl" />
        </View>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      {/* Sticky Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row rounded-3xl items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#6b7280" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <ThemedText className="text-xl font-bold text-gray-800">
            {t("lessons.title")} {id}
          </ThemedText>
        </View>
        {/* Optionally, right side can be left blank or add a View for space if no control exists */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6 pb-32">
          {/* === TỪ VỰNG - HORIZONTAL SCROLL === */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-2xl font-bold text-indigo-600">
                {t("lessons.lesson_types.vocabulary")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => startExercise("vocabulary")}
                className={`${getButtonColor(statusByCategory.vocabulary)} px-4 py-2 rounded-full`}
              >
                <ThemedText
                  className={`${getTextColor(statusByCategory.vocabulary)} text-sm font-medium`}
                >
                  {t("lessons.do_vocab_exercise")}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row rounded-3xl"
            >
              {voca.map((item: any, i: number) => (
                <View key={i} style={{ width: width - 80 }}>
                  <VocabularyCard item={item} index={i} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* === NGỮ PHÁP === */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-2xl font-bold text-cyan-700">
                {t("lessons.lesson_types.grammar")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => startExercise("grammar")}
                className={`${getButtonColor(statusByCategory.grammar)} px-4 py-2 rounded-full`}
              >
                <ThemedText
                  className={`${getTextColor(statusByCategory.grammar)} text-sm font-medium`}
                >
                  {t("lessons.do_grammar_exercise")}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {grammar.slice(0, 3).map((item: any, i: number) => (
              <View key={i} className="mb-4">
                <GrammarCard item={item} />
              </View>
            ))}
          </View>

          {/* === KANJI === */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-2xl font-bold text-amber-700">
                {t("lessons.lesson_types.kanji")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => startExercise("kanji")}
                className={`${getButtonColor(statusByCategory.kanji)} px-4 py-2 rounded-full`}
              >
                <ThemedText
                  className={`${getTextColor(statusByCategory.kanji)} text-sm font-medium`}
                >
                  {t("lessons.do_kanji_exercise")}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {kanji.map((item: any, i: number) => (
              <View key={i} className="mb-4">
                <KanjiCard item={item} onWrite={openWriter} />
              </View>
            ))}
          </View>

          {/* === FINAL TEST BUTTON === */}
          <BounceButton
            variant="solid"
            size="full"
            onPress={() => setModalVisible(true)}
          >
            <ThemedText className="text-white text-lg font-bold flex-row items-center">
              <Sparkles size={20} color="white" className="mr-2" />
              {t("common.start")}
            </ThemedText>
          </BounceButton>
        </View>
      </ScrollView>

      {/* === KANJI WRITER MODAL === */}

      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 mt-36 bg-gradient-to-b from-amber-50 to-white p-6">
          <View className="flex-row justify-end items-center mb-6">
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <KanjiWriter
            character={selectedKanji!}
            mode="practice"
            onComplete={(mistakes) => {
              Alert.alert(
                t("common.complete"),
                `${t("common.finish")}: ${mistakes}`,
                [
                  {
                    text: t("common.close"),
                    onPress: () => setModalVisible(false),
                  },
                ]
              );
            }}
          />
        </View>
      </Modal>
    </HomeLayout>
  );
};

export default LessonDetailScreen;
