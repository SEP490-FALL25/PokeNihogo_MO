import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { useLesson } from "@hooks/useLessons";
import { ROUTES } from "@routes/routes";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

// --- Vocabulary Card (Simple display, navigate to vocabulary list) ---
const VocabularyCard = ({
  item,
  index,
  lessonId,
}: {
  item: any;
  index: number;
  lessonId: string;
}) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: ROUTES.LESSON.CONTENT_LIST,
      params: {
        id: lessonId,
        activityType: "learn",
      },
    });
  };

  return (
    <ModernCard style={{ marginHorizontal: 4 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View className="items-center justify-center">
          <ThemedText className="text-3xl font-bold text-indigo-600 text-center">
            {item.wordJp}
          </ThemedText>
          <ThemedText className="text-lg text-indigo-400 mt-1 font-medium text-center">
            {item.reading}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
};

// --- Grammar Card (Simple display, navigate to vocabulary list) ---
const GrammarCard = ({
  item,
  lessonId,
}: {
  item: any;
  lessonId: string;
}) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: ROUTES.LESSON.CONTENT_LIST,
      params: {
        id: lessonId,
        contentType: "grammar",
        activityType: "learn",
      },
    });
  };

  return (
    <ModernCard style={{ marginHorizontal: 4 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View className="items-center justify-center">
          <ThemedText className="text-xl font-bold text-cyan-700 text-center">
            {item.title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
};

// --- Kanji Card (Simple display, navigate to vocabulary list) ---
const KanjiCard = ({
  item,
  lessonId,
}: {
  item: any;
  lessonId: string;
}) => {
  const { t } = useTranslation();
  const meaning =
    item.meaning?.split("##")[0] || item.meaning || t("lessons.no_meaning");

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: ROUTES.LESSON.CONTENT_LIST,
      params: {
        id: lessonId,
        contentType: "kanji",
        activityType: "learn",
      },
    });
  };

  return (
    <ModernCard style={{ marginHorizontal: 4 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View className="items-center justify-center">
          <ThemedText className="text-6xl font-bold text-amber-700 text-center mb-2">
            {item.character}
          </ThemedText>
          <ThemedText className="text-lg font-medium text-amber-800 text-center">
            {meaning}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
};

// --- Main Screen ---
const LessonDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: lessonData, isLoading } = useLesson(id || "");
  const lesson: any = lessonData?.data || {};

  // Try multiple property names in case of mock/real difference, fallback to []
  const voca: any[] = lesson.voca || lesson.vocabulary || [];
  const grammar: any[] = lesson.grama || lesson.grammar || [];
  const kanji: any[] = lesson.kanji || [];

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
              {t("lessons.title")} {id}
            </ThemedText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 pb-32">
            {/* === TỪ VỰNG - HORIZONTAL SCROLL === */}
            <View className="mb-8">
              <View className="mb-4">
                <ThemedText className="text-2xl font-bold text-indigo-600">
                  {t("lessons.lesson_types.vocabulary")}
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row rounded-3xl"
              >
                {voca.map((item: any, i: number) => (
                  <View key={i} style={{ width: width - 80 }}>
                    <VocabularyCard
                      item={item}
                      index={i}
                      lessonId={id || ""}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* === NGỮ PHÁP - HORIZONTAL SCROLL === */}
            <View className="mb-8">
              <View className="mb-4">
                <ThemedText className="text-2xl font-bold text-cyan-700">
                  {t("lessons.lesson_types.grammar")}
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row rounded-3xl"
              >
                {grammar.map((item: any, i: number) => (
                  <View key={i} style={{ width: width - 80 }}>
                    <GrammarCard item={item} lessonId={id || ""} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* === KANJI - HORIZONTAL SCROLL === */}
            <View className="mb-10">
              <View className="mb-4">
                <ThemedText className="text-2xl font-bold text-amber-700">
                  {t("lessons.lesson_types.kanji")}
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row rounded-3xl"
              >
                {kanji.map((item: any, i: number) => (
                  <View key={i} style={{ width: width - 80 }}>
                    <KanjiCard item={item} lessonId={id || ""} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* === FINAL TEST BUTTON === */}
            <BounceButton variant="solid" size="full" onPress={() => {}}>
              <ThemedText className="text-white text-lg font-bold flex-row items-center">
                <Sparkles size={20} color="white" className="mr-2" />
                {t("common.start")}
              </ThemedText>
            </BounceButton>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;
