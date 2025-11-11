import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { useLesson } from "@hooks/useLessons";
import { ROUTES } from "@routes/routes";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Hero Section Card Component ---
interface HeroSectionCardProps {
  title: string;
  count: number;
  emoji: string;
  gradientColors: [string, string];
  previewText: string;
  onPress: () => void;
}

const HeroSectionCard = ({
  title,
  count,
  emoji,
  gradientColors,
  previewText,
  onPress,
}: HeroSectionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        marginBottom: 16,
        borderRadius: 28,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 24,
          minHeight: 160,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <ThemedText style={{ fontSize: 32 }}>{emoji}</ThemedText>
              </View>
              <View>
                <ThemedText
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "white",
                    textShadowColor: "rgba(0, 0, 0, 0.1)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {title}
                </ThemedText>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginTop: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {count} nội dung
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <ChevronRight size={24} color="white" strokeWidth={3} />
          </View>
        </View>

        {/* Preview Text */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        >
          <ThemedText
            style={{
              fontSize: 15,
              color: "white",
              lineHeight: 24,
              fontWeight: "500",
            }}
            numberOfLines={2}
          >
            {previewText}
          </ThemedText>
        </View>
      </LinearGradient>
    </TouchableOpacity>
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

  // Navigate to content list
  const navigateToContent = (contentType: "vocabulary" | "grammar" | "kanji") => {
    Haptics.selectionAsync();
    router.push({
      pathname: ROUTES.LESSON.CONTENT_LIST,
      params: {
        id,
        contentType,
        activityType: "learn",
      },
    });
  };

  // Generate preview text for each section
  const getVocabPreview = () => {
    if (voca.length === 0) return "Chưa có từ vựng nào";
    const preview = voca
      .slice(0, 3)
      .map((item) => item.wordJp)
      .join("  •  ");
    return preview + (voca.length > 3 ? "  •  ..." : "");
  };

  const getGrammarPreview = () => {
    if (grammar.length === 0) return "Chưa có ngữ pháp nào";
    const preview = grammar
      .slice(0, 2)
      .map((item) => item.title)
      .join("  •  ");
    return preview + (grammar.length > 2 ? "  •  ..." : "");
  };

  const getKanjiPreview = () => {
    if (kanji.length === 0) return "Chưa có Kanji nào";
    return kanji
      .slice(0, 8)
      .map((item) => item.character)
      .join("  ");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        style={{ flex: 1 }}
      >
        {/* Sticky Header */}
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {lesson.name || `${t("lessons.title")} ${id}`}
              </ThemedText>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {/* Lesson Description */}
          {lesson.description && (
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                borderLeftWidth: 4,
                borderLeftColor: "#3b82f6",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <BookOpen size={20} color="#3b82f6" />
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginLeft: 8,
                  }}
                >
                  Về bài học này
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 15,
                  color: "#4b5563",
                  lineHeight: 24,
                }}
              >
                {lesson.description}
              </ThemedText>
            </View>
          )}

          {/* Content Overview Title */}
          <View style={{ marginBottom: 20 }}>
            <ThemedText
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#1f2937",
                textAlign: "center",
              }}
            >
              Nội dung bài học
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 15,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Nhấn vào để xem chi tiết
            </ThemedText>
          </View>

          {/* Vocabulary Section */}
          {voca.length > 0 && (
            <HeroSectionCard
              title="Từ vựng"
              count={voca.length}
              emoji="📚"
              gradientColors={["#667eea", "#764ba2"]}
              previewText={getVocabPreview()}
              onPress={() => navigateToContent("vocabulary")}
            />
          )}

          {/* Grammar Section */}
          {grammar.length > 0 && (
            <HeroSectionCard
              title="Ngữ pháp"
              count={grammar.length}
              emoji="✏️"
              gradientColors={["#06b6d4", "#0891b2"]}
              previewText={getGrammarPreview()}
              onPress={() => navigateToContent("grammar")}
            />
          )}

          {/* Kanji Section */}
          {kanji.length > 0 && (
            <HeroSectionCard
              title="Kanji"
              count={kanji.length}
              emoji="🈯"
              gradientColors={["#f59e0b", "#d97706"]}
              previewText={getKanjiPreview()}
              onPress={() => navigateToContent("kanji")}
            />
          )}

          {/* Start Button */}
          <View style={{ marginTop: 8 }}>
            <BounceButton variant="solid" size="full" onPress={() => {}}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={20} color="white" style={{ marginRight: 8 }} />
                <ThemedText
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Bắt đầu kiểm tra
                </ThemedText>
              </View>
            </BounceButton>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;
